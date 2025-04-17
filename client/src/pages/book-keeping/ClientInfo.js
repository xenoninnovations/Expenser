import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config"; // Your Firestore instance
import { useParams } from "react-router-dom";
import Navbar from '../../components/NavBar/NavBar'


const ClientDetails = () => {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const docRef = doc(db, "clients", id); // Reference to the document
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setClient(docSnap.data()); // Set client data in state
                } else {
                    console.log("No such client!");
                }
            } catch (error) {
                console.error("Error fetching client data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClient();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!client) return <p>Client not found!</p>;

    return (
        <div className="page">
                  <Navbar />
            <div className="page-content">
            <h1>{client.clientName}</h1>
            <p>Email: {client.emailAddress}</p>
            <p>Phone: {client.phoneNumber}</p>
            {/* Add more fields as needed */}
            </div>
        </div>
    );
};

export default ClientDetails;
