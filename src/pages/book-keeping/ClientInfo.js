import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config";
import Navbar from "../../components/NavBar/NavBar";
import { useParams } from "react-router-dom";
import dots from "../../images/dots.svg";
import GlobalButton from "../../components/GlobalButton/GlobalButton";
import {
  FaPen,
  FaTrash,
  FaPlus,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import EditCase from "../../components/EditCase/EditCase";
import "../../pages/assets/styles/book-keeping.css";
import "../../pages/assets/styles/ClientInfo.css";
import avatar from "../../images/avatar.png";
import DeleteCase from "../../components/DeleteCase/DeleteCase";
import AddCase from "../../components/AddCase/AddCase";
import ClientCasesTable from "../../components/ClientTables/ClientCasesTable";
import ClientOutstandingFeesTable from "../../components/ClientTables/ClientOutstandingFeesTable";
import ClientInvoicesTable from "../../components/ClientTables/ClientInvoicesTable";

const ClientInfo = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [view, setView] = useState("cases")
  const [outstandingTasks, setOutstandingTasks] = useState([])
  const [invoices, setInvoices] = useState([])


  const fetchClientAndCases = async () => {
    try {
      const docRef = doc(db, "clients", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const clientData = docSnap.data();

        const casesRef = collection(db, "cases");
        const q = query(casesRef, where("client_id", "==", id));
        const querySnapshot = await getDocs(q);

        const cases = [];
        querySnapshot.forEach((doc) => {
          cases.push({ id: doc.id, ...doc.data() });
        });

        setClient({ ...clientData, cases });
      } else {
        console.log("Client not found!");
      }
    } catch (error) {
      console.error("Error fetching client or cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutstandingTasks = async () => {
    try {
      const outstandingTasksRef = collection(db, "Tasks");
      const q = query(outstandingTasksRef, where("clientName", "==", id));
      const querySnapshot = await getDocs(q);
  
      const oustandingTasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setOutstandingTasks(oustandingTasksData);
    } catch (error) {
      console.error("Error fetching fees: ", error);
    }
  };

  const fetchInvoices = async () => {
    try{
      const invoicesRef = collection(db, "invoices");
      const q = query(invoicesRef, where("client", "==", id));
      const querySnapShot = await getDocs(q);
      
      const invoiceData = querySnapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInvoices(invoiceData);
    } catch (error) {
      console.error("Error Fetching Invoices: ", error)
    }
  }

  useEffect(() => {
    fetchClientAndCases();
    fetchOutstandingTasks();
    fetchInvoices();
  }, [id]);

  const handleEditClick = (caseId) => {
    setSelectedCase(caseId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (caseId) => {
    setSelectedCase(caseId);
    setIsDeleteModalOpen(true);
  };

  // Function to load all cases
  const loadAllCases = async () => {
    try {
      const casesRef = collection(db, "cases");
      const querySnapshot = await getDocs(casesRef);

      const casesList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          amount: parseFloat(data.amount || 0), // Ensure amount is a number
          date: data.date ? new Date(data.date).toLocaleDateString() : "N/A", // Format date
        };
      });

      setCaseData(casesList);
    } catch (error) {
      console.error("Error fetching cases: ", error);
    }
  };

  // Add this formatting function
  const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters
    const cleaned = phoneNumber?.replace(/\D/g, '');
    
    // Check if the number has 10 digits
    if (cleaned?.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    // Return original number if it doesn't match expected format
    return phoneNumber || 'N/A';
  };

  if (loading) return <p>Loading...</p>;
  if (!client) return <p>Client not found.</p>;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="client-info">
          <img src={avatar} alt="avatar" className="client-avatar" />
          
          <div className="client-info-container">
            <h1>{client.clientName}</h1>
            <div className="client-info-section">
              <FaPhone />
              <p>{formatPhoneNumber(client.phoneNumber)}</p>
            </div>
            <div className="client-info-section">
              <FaEnvelope />
              <p>{client.emailAddress}</p>
            </div>
          </div>
        </div>
        <div className="header">
          <div className="view-toggle">
            {[
              { label: "Cases", value: "cases" },
              { label: "Outstanding Fees", value: "fees" },
              { label: "Invoices", value: "invoices" }
            ].map(({ label, value }) => (
              <button
                key={value}
                className={`toggle-button ${view === value ? "active" : ""}`}
                onClick={() => setView(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {view === "cases" && <ClientCasesTable client={client} setIsAddModalOpen={setIsAddModalOpen} handleEditClick={handleEditClick} handleDeleteClick={handleDeleteClick}/>}
        {view === "fees" && <ClientOutstandingFeesTable tasks={outstandingTasks} setIsAddModalOpen={setIsAddModalOpen} handleEditClick={handleEditClick} handleDeleteClick={handleDeleteClick}/>}
        {view === "invoices" && <ClientInvoicesTable invoices={invoices} setIsAddModalOpen={setIsAddModalOpen} handleEditClick={handleEditClick} handleDeleteClick={handleDeleteClick}/>}
      </div>
      {isAddModalOpen && (
        <AddCase
          closeModal={() => {
            setIsAddModalOpen(false);
            fetchClientAndCases();
          }}
          clientId={id}
        />
      )}
      {isEditModalOpen && (
        <EditCase
          closeModal={() => {
            setIsEditModalOpen(false);
            fetchClientAndCases();
          }}
          caseId={selectedCase}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteCase
          closeModal={() => {
            setIsDeleteModalOpen(false);
            fetchClientAndCases();
          }}
          caseId={selectedCase}
        />
      )}
    </div>
  );
};

export default ClientInfo;
