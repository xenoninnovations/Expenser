import React from "react";
import { doc, updateDoc } from "firebase/firestore";
import "../../pages/assets/styles/RevenueTracker.css";
import { db } from "../../config.js";

function DeleteExpense({ closeModal, expenseId, refreshExpenses }) {
  const handleDelete = async () => {
    try {
      const expenseRef = doc(db, "expenses", expenseId); // Reference the specific document
      await updateDoc(expenseRef, { isHidden: true }); // Update isHidden field instead of deleting
      console.log("Expense hidden successfully");

      // Refresh the list and close modal
      refreshExpenses && refreshExpenses();
      closeModal();
    } catch (error) {
      console.error("Error hiding expense: ", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete Expense</h2>
        <p>
          Are you sure you want to delete this expense? This action cannot be
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

export default DeleteExpense;
// import React from "react";
// import { doc, deleteDoc } from "firebase/firestore";
// import "../../pages/assets/styles/RevenueTracker.css";
// import { db } from "../../config.js";

// function DeleteExpense({ closeModal, expenseId, refreshExpenses }) {
//   const handleDelete = async () => {
//     try {
//       const expenseRef = doc(db, "expenses", expenseId); // Reference the specific document
//       await deleteDoc(expenseRef); // Delete the document
//       console.log("Expense deleted successfully");

//       // Refresh the list and close modal
//       refreshExpenses && refreshExpenses();
//       closeModal();
//     } catch (error) {
//       console.error("Error deleting expense: ", error);
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <h2>Delete Expense</h2>
//         <p>
//           Are you sure you want to delete this expense? This action cannot be
//           undone.
//         </p>
//         <div className="button-group">
//           <button className="modal-button del" onClick={handleDelete}>
//             Confirm Delete
//           </button>
//           <button className="cancel-button" onClick={closeModal}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DeleteExpense;
