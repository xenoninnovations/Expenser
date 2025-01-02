import React from "react";
import Navbar from '../../components/NavBar/NavBar';
import '../assets/styles/global.css'

function Clientmanagement() {
  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <a href="/addclientform">Add A Client</a>
      </div>
    </div>
  );
}

export default Clientmanagement;
