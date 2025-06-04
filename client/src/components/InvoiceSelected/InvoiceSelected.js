import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { db, functions } from "../../config.js";
import CreateInvoicePdf from "../CreateInvoice/CreateInvoicePdf.js";
import { httpsCallable } from "firebase/functions";

export default function AddTask( { closeModal, selectedTaskIds, fetchOutstandingTasks }) {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);

  const handlePdfPreview = async () => {
    console.log({client, tasks});
    const newDoc = await CreateInvoicePdf({client, tasks}, true);
    const pdfBlob = newDoc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl);
  }

  const handlePdfUpload = async (invoiceId) => {
    const newDoc = await CreateInvoicePdf({client, tasks}, false, invoiceId);
    const pdfBlob = newDoc.output('blob');
    const storage = getStorage();
    const storageRef = ref(storage, `pdfs/invoices/invoice_${invoiceId}.pdf`);
    uploadBytes(storageRef, pdfBlob).then((snapshot) => {
      console.log("Successfully uploaded pdf");
    })
  }

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
      const invoice = await httpsCallable(functions, "createInvoice")({
        email: id,
        taskIds: selectedTaskIds
      });
    } catch (error) {
      console.error("ERROR INVOICING: ", error.message)
    }
    closeModal()
    /*
    try {
      const invoiceId = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, "metadata", "invoiceNumber");
        const counterDoc = await transaction.get(counterRef);
        const currentId = counterDoc.data().current;
        const newId = currentId + 1;
        transaction.update(counterRef, {current: newId});
        return String(newId).padStart(6, "0");
      })

      const invoiceRef = await addDoc(collection(db, "invoices"), {
        client: client.emailAddress,
        date: new Date().toISOString().split("T")[0],
        invoiceId,
        phoneNumber: client.phoneNumber,
        total: calcTotal(),
        status: "DUE",
        tasks: tasks
      })

      await Promise.all(
        tasks.map((task) =>
          updateDoc(doc(db, "Tasks", task.id), { outstanding: false })
        )
      );
      
      handlePdfUpload(invoiceId);
      closeModal();
      fetchOutstandingTasks();
    } catch(e) {
      console.error("Failed to create invoice: ", e)
    }
    */
  };

  const calcTotal = () => {
    let sum = 0;
    tasks.forEach((task) => (sum += parseFloat(task.price) || 0))
    return sum;
  }

  useEffect( () => {
    const fetchClient = async () => {
      try {
        const docRef = doc(db, "clients", id);
        const docSnapshot = await getDoc(docRef)
        if(docSnapshot.exists()){
          setClient(docSnapshot.data())
        }
      } catch (e) {
        console.error("Failed to find client")
      }
    };

    const fetchTasks = async () => {
      try {
        const selectedTasks = selectedTaskIds.map((id) => {
          const ref = doc(db, "Tasks", id);
          return getDoc(ref);
        });
    
        const snapshots = await Promise.all(selectedTasks);
    
        const retrievedTasks = snapshots
          .filter((docSnap) => docSnap.exists())
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
    
        setTasks(retrievedTasks);
      } catch (e) {
        console.error("Failed to retrieve tasks: ", e);
      }
    };
    
    fetchClient();
    fetchTasks();

  },[id])

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Invoicing</h2>
        <form onSubmit={handleSubmit}>
          <h4>Services:</h4>
          {tasks.map((task, index) => (
            <div  key={task.id} >
              <div className="field-group">
                <h5>{index+1}.</h5>
                <div><strong>{task.description}</strong></div>
                <div><strong>{task.date}</strong></div>
                <div><strong>${parseFloat(task.price || 0).toFixed(2)}</strong></div>
                <div></div>
              </div>
              <hr></hr>
            </div>
            ))}
            <button type="submit" className="modal-button save">Invoice</button>
        </form>

        <button className="cancel-button" onClick={closeModal}>Cancel</button>
      </div>
    </div>
  )
}