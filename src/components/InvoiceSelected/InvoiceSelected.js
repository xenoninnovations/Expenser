import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc, getDocs, where, query, runTransaction, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { db } from "../../config.js";
import { FaTrash } from "react-icons/fa";

export default function AddTask( { closeModal, selectedTaskIds, fetchOutstandingTasks }) {

  const handleSubmit = async (e) => {
    e.preventDefault();
    return;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Invoice</h2>
        <form onSubmit={handleSubmit}>
          <h4>Services:</h4>
          {selectedTaskIds.map((id, index) => (
            <div key={index} className="field-group">
              <h5>{index+1}.</h5>

            </div>
            ))}
            <button type="button" className="modal-button add">Preview Invoice</button>
            <button type="submit" className="modal-button save">Invoice</button>
        </form>

        <button className="cancel-button" onClick={closeModal}>Cancel</button>
      </div>
    </div>
  )
}