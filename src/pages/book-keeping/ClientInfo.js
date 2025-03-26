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

const ClientInfo = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading...</p>;
  if (!client) return <p>Client not found.</p>;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>{client.clientName}</h1>
        <p>Phone: {client.phone}</p>
        <p>Email: {client.email}</p>

        <h2>Cases</h2>
        {client.cases && client.cases.length > 0 ? (
          client.cases.map((caseItem) => (
            <div key={caseItem.id}>
              <h3>{caseItem.case_name}</h3>
              <p>Jurisdiction: {caseItem.jurisdiction}</p>
              <p>Case Type: {caseItem.type}</p>
              <p>Status: {caseItem.status}</p>
              <p>Attorney: {caseItem.lead_attorney}</p>
              {caseItem.witnesses && (
                <p>
                  Witness: {caseItem.witnesses.name} (
                  {caseItem.witnesses.contact})
                </p>
              )}
            </div>
          ))
        ) : (
          <p>No cases found.</p>
        )}
      </div>
    </div>
  );
};

export default ClientInfo;
