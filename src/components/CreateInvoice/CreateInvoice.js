import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, where, query, runTransaction, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { db } from "../../config.js";
import { FaTrash } from "react-icons/fa";
import CreateInvoicePdf from "./CreateInvoicePdf.js";

export default function CreateInvoice( { closeModal }) {

  const [formData, setFormData] = useState({
    client: "",
    phoneNumber: "",
    date: new Date().toISOString().split("T")[0],
    status: "DUE",
    total: 0,
    tasks: [],
    services: []
  });
  const [tasks, setTasks] = useState([])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTasksChange = (index, e) => {
    const {name, value} = e.target;
    const selectedTask = tasks.find((task) => task.id === value);
    const updatedTasks = [...formData.tasks];
    updatedTasks[index] = {
      id: selectedTask.id,
      projectName: selectedTask.ProjectName, 
      taskDescription: selectedTask.TaskName, 
      duration: selectedTask.Duration, 
      total: 0};
    setFormData({...formData, tasks: updatedTasks});
  }

  const handleTaskTotalChange = (index, e) => {
    const {name, value} = e.target;
    const updatedTasks = [...formData.tasks];
    updatedTasks[index] = {...updatedTasks[index], [name]: value };
    setFormData({...formData, tasks: updatedTasks})
  }

  const addTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { id: "", projectName: "", taskDescription: "", duration: "", total: 0 }],
    });
  };

  const handleServicesChange = (index, e) => {
    const { name, value } = e.target;
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [name]: value };
    setFormData({ ...formData, services: updatedServices });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { service: "", term: "", total: 0 }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
      const invoiceId = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, "metadata", "invoiceNumber");
        const counterDoc = await transaction.get(counterRef);

        const currentId = counterDoc.data().current;
        const newId = currentId + 1;
        transaction.update(counterRef, {current: newId});

        return String(newId).padStart(6, "0");
      })

      const collectionRef = collection(db, "invoices");
      await addDoc(collectionRef, {
        ...formData,
        total: calcTotal(),
        invoiceId,
        date: new Date().toISOString().split("T")[0]
      });
      handlePdfUpload(invoiceId);
      closeModal();

    } catch (e) {
      console.error("failed to create invoice: ", e)
    }
  };

  const calcTotal = () => {
    let sum = 0;
    formData.tasks.forEach((val) => (sum += +val.total));
    formData.services.forEach((val) => (sum += +val.total));
    return sum;
  }

  const deleteTask = (index) => {
    const updatedTasks = [
      ...formData.tasks.slice(0, index),
      ...formData.tasks.slice(index+1)
    ];
    setFormData({...formData, tasks: updatedTasks});
  }

  const deleteService = (index) => {
    const updatedServices = [
      ...formData.services.slice(0, index),
      ...formData.services.slice(index+1)
    ];
    setFormData({...formData, services: updatedServices});
  }

  const handlePdfPreview = async () => {
    const newDoc = await CreateInvoicePdf(formData, true);
    const pdfBlob = newDoc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl);
  }

  const handlePdfUpload = async (invoiceId) => {
    const newDoc = await CreateInvoicePdf(formData, false, invoiceId);
    const pdfBlob = newDoc.output('blob');
    const storage = getStorage();
    const storageRef = ref(storage, `pdfs/invoices/invoice_${invoiceId}.pdf`);
    uploadBytes(storageRef, pdfBlob).then((snapshot) => {
      console.log("Successfully uploaded pdf");
    })

  }

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const collectionRef = collection(db, "Tasks");
        const q = await query(collectionRef, where("clientName", "==", formData.client));
        const querySnapshot = await getDocs(q);
        const tasks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(tasks);
      } catch (e) {
        console.error("Error fetching tasks: ", e);
      }
    };
  
    const getPhone = async () => {
      try {
        const collectionRef = collection(db, "clients");
        const q = await query(collectionRef, where("emailAddress", "==", formData.client));
        const querySnapshot = await getDocs(q);
        const client = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
        }));
        const phoneNumber = client[0] ? client[0].phoneNumber : "";
        return phoneNumber;
      } catch (e) {
        console.error("Error fetching phone number: ", e);
        return "";
      }
    };
  
    const fetchData = async () => {
      const phoneNumber = await getPhone();
      loadTasks();
      
      setFormData((prevData) => ({
        ...prevData,
        //Why "phoneNumber" works here is literal magic. "Shorthand Property Names" courtesy of ES6.
        phoneNumber,
      }));
    };
  
    fetchData();
  }, [formData.client]);
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Invoice</h2>
        <form onSubmit={handleSubmit}>
          <label className="label">
            Client:
            <div className="field-group">
              <input 
                className="field"
                type="email"
                name="client"
                value={formData.client}
                onChange={handleChange}
                placeholder="email"
                required
              />
              <input 
                className="field"
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                required
              />
            </div>
          </label>
          <label className="label">
            Date:
            <input 
              className="field"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>
          <label className="label">
            Status:
            <select
              className="field"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="DUE">
                DUE
              </option>
              <option value="PAID">
                PAID
              </option>
            </select>
          </label>
          <h4>Tasks:</h4>
          {formData.tasks.map((task, index) => (
  
            <div key={index} className="field-group">
              <h5>{index+1}.</h5>
              <select 
                className="field"
                name="task"
                value={task.id || ""}
                onChange={(e) => handleTasksChange(index, e)}
                required
                
              >
                {tasks.length > 0 ? (
                <option value="" disabled>
                  Select a Task
                </option> 
                ) : (
                <option value="" disabled>
                  Client has no Tasks
                </option>
                )}
                {tasks.map((task) =>(
                  <option key={task.id} value={task.id}>
                    {task.ProjectName} | {task.TaskName}
                  </option>
                ))}
              </select>
              <input 
                className="field"
                type="number"
                name="total"
                placeholder="Total"
                value={task.total}
                onChange={e => handleTaskTotalChange(index, e)}
                required
              />
              <button type="button" onClick={() => deleteTask(index)} className="modal-button del">
                <FaTrash />
              </button>
            </div>
          ))}
          <hr></hr>
          <h4>Services:</h4>
          {formData.services.map((service, index) => (
            <div key={index} className="field-group">
              <h5>{index+1}.</h5>
              <input 
                className="field"
                type="text"
                name="service"
                placeholder="Service"
                value={service.service}
                onChange={(e) => handleServicesChange(index, e)}
                required
              />
              <input 
                className="field"
                type="text"
                name="term"
                placeholder="Term"
                value={service.term}
                onChange={(e) => handleServicesChange(index, e)}
                required
              />
              <input 
                className="field"
                type="number"
                name="total"
                placeholder="Total"
                value={service.total}
                onChange={(e) => handleServicesChange(index, e)}
                required
              />
              <button type="button" onClick={() => deleteService(index)} className="modal-button del">
                <FaTrash />
              </button>
            </div>
            ))}
          <button type="button" onClick={addTask} className="modal-button add">
            + Add Pre-existing Task
          </button>
            <button type="button" onClick={addService} className="modal-button add">
            + Add Service
          </button>
          <div className="field-group">
            <button type="button" onClick={handlePdfPreview} className="modal-button alt">
              Preview PDF
            </button>
            <button type="submit" className="modal-button save">
              Create Invoice
            </button>
          </div>
        </form>
        <button className="cancel-button" onClick={closeModal}>
          Cancel
        </button>
      </div>
    </div>
  )
}
