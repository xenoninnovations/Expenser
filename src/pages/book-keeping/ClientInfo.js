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

const ClientInfo = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

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
    setSelectedExpenseId(caseId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (caseId) => {
    setSelectedExpenseId(caseId);
    setIsDeleteModalOpen(true);
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
          <h3>Cases Tracker</h3>
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
                        // onClick={() => handleEditClick(expense.id)}
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
    </div>
  );
};

export default ClientInfo;
