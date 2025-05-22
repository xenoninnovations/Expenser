import React, { useEffect, useState } from 'react';
import { db } from '../config';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Clients = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, 'clients'));
      const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientsData);
    };
    fetchClients();
    console.log(clients);
  }, []);

  return (
    <div className="clients-section">
      <h2 className="section-title"><span className="yellow-bar"></span>Your clients</h2>
      <div className="clients-list">
        {clients.map(client => (
          <div className="client-item" key={client.id}>
            <img className="client-avatar" src={client.photoURL || '/default-avatar.png'} alt={client.clientName} />
            <div className="client-name">{client.clientName}</div>
          </div>
        ))}
        <Link to="/addclientform" className="client-item add-client-btn">
          <div className="client-avatar add-avatar">+</div>
          <div className="client-name">Add</div>
        </Link>
      </div>
    </div>
  );
};

export default Clients; 