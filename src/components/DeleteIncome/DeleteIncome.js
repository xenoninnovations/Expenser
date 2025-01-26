import React from "react";
import { doc, deleteDoc } from "firebase/firestore";
import "../../pages/assets/styles/ExpenseTracker.css";
import { db } from "../../config.js";

function DeleteIncome({ closeModal, incomeId, refreshIncome }) {
  const handleDelete = async () => {
    try {
      const incomeRef = doc(db, "income", incomeId); // Reference the specific document
      await deleteDoc(incomeRef); // Delete the document
      console.log("Income deleted successfully");

      // Refresh the list and close modal
      refreshIncome && refreshIncome();
      closeModal();
    } catch (error) {
      console.error("Error deleting income: ", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete Income</h2>
        <p>
          Are you sure you want to delete this income? This action cannot be
          undone.
        </p>
        <div className="button-group">
          <button className="delete-button" onClick={handleDelete}>
            Confirm Delete
          </button>
          <button className="cancel-button" onClick={closeModal}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteIncome;
