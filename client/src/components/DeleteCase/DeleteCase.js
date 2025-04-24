import React from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../config";
import "../../pages/assets/styles/RevenueTracker.css";

function DeleteCase({ closeModal, caseId, refreshCases }) {
  
  const handleDelete = async () => {
    try {
      const caseRef = doc(db, "cases", caseId); // Reference the specific document
      await deleteDoc(caseRef); // Delete the document
      console.log("Case deleted successfully");

      // Refresh the list and close modal
      refreshCases && refreshCases();
      closeModal();
    } catch (error) {
      console.error("Error deleting case: ", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete Expense</h2>
        <p>
          Are you sure you want to delete this case? This action cannot be
          undone.
        </p>
        <div className="button-group">
          <button className="modal-button del" onClick={handleDelete}>
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

export default DeleteCase;