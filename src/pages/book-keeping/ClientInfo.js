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
import { FaPen, FaTrash, FaPlus, FaFileExport } from "react-icons/fa";
import EditCase from "../../components/EditCase/EditCase";
import "../../pages/assets/styles/book-keeping.css";

const ClientInfo = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
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
  if (loading) return <p>Loading...</p>;
  if (!client) return <p>Client not found.</p>;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>{client.clientName}</h1>
        <p>Phone: {client.phoneNumber}</p>
        <p>Email: {client.emailAddress}</p>

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
              // onClick={() => setIsAddModalOpen(true)}
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
                client.cases.map((caseItem) => (
                  <tr key={caseItem.id} className="table-row">
                    <td>{caseItem.id}</td>
                    <td>{caseItem.name}</td>
                    <td>{caseItem.lead_attorney}</td>
                    <td>{caseItem.type}</td>
                    <td>{caseItem.case_desc || "N/A"}</td>
                    <td>{caseItem.status || "N/A"}</td>
                    <td>
                      <FaPen
                        className="icon edit-icon"
                        onClick={() => handleEditClick(caseItem.id)}
                      />
                      <FaTrash
                        className="icon delete-icon"
                        // onClick={() => handleDeleteClick(expense.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No case data available...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* {isAddModalOpen && (
        <AddExpense
          closeModal={() => {
            setIsAddModalOpen(false);
            loadAllExpenses(); // Refresh after adding
          }}
        />
      )} */}
      {isEditModalOpen && (
        <EditCase
          closeModal={() => {
            setIsEditModalOpen(false);
            loadAllCases(); // Refresh after editing
          }}
          caseId={selectedCase}
        />
      )}
      {/* {isDeleteModalOpen && (
        <DeleteExpense
          closeModal={() => {
            setIsDeleteModalOpen(false);
            loadAllExpenses(); // Refresh after deletion
          }}
          expenseId={selectedExpenseId}
        />
      )} */}
    </div>
  );
};

export default ClientInfo;
