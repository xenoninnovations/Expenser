import React from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../config.js";

function DeleteRevenue({ closeModal, revenueId, refreshRevenue }) {
  const handleDelete = async () => {
    try {
      const revenueRef = doc(db, "revenue", revenueId); // Reference the specific document
      await deleteDoc(revenueRef); // Delete the document
      console.log("Revenue deleted successfully");

      // Refresh the list and close modal
      refreshRevenue && refreshRevenue();
      closeModal();
    } catch (error) {
      console.error("Error deleting revenue: ", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete Revenue</h2>
        <p>
          Are you sure you want to delete this revenue? This action cannot be
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

export default DeleteRevenue;
