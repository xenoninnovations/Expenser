import React, { useState, useEffect } from "react";
import Navbar from "../../components/NavBar/NavBar";
import "../assets/styles/global.css";
import { db } from "../../config";
import { CSVLink } from "react-csv";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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

        console.table(clientList);
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
    console.log(clientList); // Logs whenever clientList changes
  }, [clientList]);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        {/*===================REMEMBER TO MENTION THIS===================*/}
        <a href="/addclientform" id="link-button">Add A Client (1)</a>
        <Link to="/addclientform" id="link-button">Add A Client (2)</Link>
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
            {clientList.map((client, index) => (
              <tr
                key={index}
                className="table-row"
                onClick={() => handleRowClick(client.id)}
              >
                <td>{client.clientName}</td>
                <td>{client.clientSource}</td>
                <td>{client.emailAddress}</td>
                <td>{client.phoneNumber}</td>
                <td>{client.preferredCommMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default Clientmanagement;
