import React from "react";
import "./AddExpense.css";
import "../../pages/assets/styles/global.css";

function AddExpense({ closeModal }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add an Expense</h2>
        <form>
          <label className="label">
            Transaction Date:
            <input className="field" type="date" />
          </label>
          <label className="label">
            Item Name:
            <input className="field" type="text" />
          </label>
          <label className="label">
            Amount:
            <input className="field" type="number" />
          </label>
          <label className="label">
            Merchant:
            <input className="field" type="text" />
          </label>
          <label className="label">
            Category:
            <select className="field" >
              <option value="electronics">Electronics</option>
              <option value="groceries">Groceries</option>
            </select>
          </label>
          {/* <label className="label">
            Repeat:
            <div>
              <button type="button">Yes</button>
              <button type="button">No</button>
            </div>
          </label> */}
        </form>
        <button type="submit" className="add-expense-button">
          Add Expense
        </button>
        <button className="close-button" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
}

export default AddExpense;
