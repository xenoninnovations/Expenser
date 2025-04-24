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

const ClientInfo = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  useEffect(() => {
    fetchClientAndCases();
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
          <h3>Cases</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>
        <div className="table-container">
          <div className="table-header exp">
            <div className="exp-spaced">
              <span className="yellow-bar exp"></span>
              <h2 className="table-title">{client.clientName}'s Cases</h2>
            </div>
            <GlobalButton
              bg={"white"}
              textColor={"#222222"}
              icon={FaPlus}
              text={"Add a case"}
              onClick={() => setIsAddModalOpen(true)}
            />
          </div>
          <table className="global-table">
            <thead>
              <tr>
                {[
                  "Case number",
                  "Case name",
                  "Case Attorney",
                  "Case Type",
                  "Case Description",
                  "Case Status",
                  "Actions",
                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {client.cases && client.cases.length > 0 ? (
                client.cases.map((caseItem) => {
                  console.log("Rendering case item:", caseItem);
                  return (
                    <tr key={caseItem.id} className="table-row">
                      <td>{caseItem.id}</td>
                      <td>{caseItem.name || caseItem.caseName}</td>
                      <td>{caseItem.lead_attorney || caseItem.leadAttorney}</td>
                      <td>{caseItem.type || caseItem.caseType}</td>
                      <td>{caseItem.case_desc || caseItem.caseDesc || "N/A"}</td>
                      <td>{caseItem.status || "N/A"}</td>
                      <td>
                        <FaPen
                          className="icon edit-icon"
                          onClick={() => handleEditClick(caseItem.id)}
                        />
                        <FaTrash
                          className="icon delete-icon"
                          onClick={() => handleDeleteClick(caseItem.id)}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">No case data available...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
