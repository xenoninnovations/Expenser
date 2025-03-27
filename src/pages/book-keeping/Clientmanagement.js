import React, { useState, useEffect } from "react";
import Navbar from "../../components/NavBar/NavBar";
import "../assets/styles/global.css";
import { db } from "../../config";
import { CSVLink } from "react-csv";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Clientmanagement() {
  const [clientList, setClientList] = useState([]);
  const [clientId, setClientId] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsRef = collection(db, "clients");
        const querySnapshot = await getDocs(clientsRef);

        const clientsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setClientList(clientsList);

        // console.table(clientList);
        setClientId(clientList.id);
      } catch (error) {
        console.log(error);
      }
    };

    loadClients();
  }, []);

  const handleRowClick = (id) => {
    navigate(`/client/${id}`);
  };

  useEffect(() => {
    // console.log(clientList); // Logs whenever clientList changes
  }, [clientList]);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <a href="/addclientform" id="link-button">
          Add A Client
        </a>
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="yellow-bar"></span> Client List
            </h2>
          </div>
          <table className="global-table">
            <thead>
              <tr>
                {[
                  "Client Name",
                  "Client Source",
                  "Email Address",
                  "Phone Number",
                  "Preferred Contact Method",
                ].map((head) => (
                  <th key={head}>{head} ⬍ </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientList.length > 0 ? (
                clientList.map((client, index) => (
                  <tr
                    key={index}
                    className="table-row"
                    onClick={() => handleRowClick(client.id)}
                  >
                    <td>{client.clientName}</td>
                    <td>{client.source}</td>
                    <td>{client.emailAddress}</td>
                    <td>{client.phoneNumber}</td>
                    <td>{client.preferredCommMethod}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No clients data available...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Clientmanagement;
