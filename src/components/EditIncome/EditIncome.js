import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import "../../pages/assets/styles/ExpenseTracker.css";
import { db } from "../../config.js";

function EditIncome({ closeModal, incomeId }) {
  const [formData, setFormData] = useState({
    date: "",
    source: "",
    amount: "",
    note: "",
  });

  useEffect(() => {
    const loadIncome = async () => {
      try {
        const incomeRef = doc(db, "income", incomeId);
        const incomeSnapshot = await getDoc(incomeRef);
        if (incomeSnapshot.exists()) {
          const data = incomeSnapshot.data();
          setFormData({
            ...data,
            amount: parseFloat(data.amount).toFixed(2), // Ensure number format
            date: data.date ? new Date(data.date).toISOString().split("T")[0] : "", // Format date for input
          });
        } else {
          console.error("No such income found!");
        }
      } catch (error) {
        console.error("Error fetching income: ", error);
      }
    };

    loadIncome();
  }, [incomeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const incomeRef = doc(db, "income", incomeId);
      await updateDoc(incomeRef, {
        ...formData,
        amount: parseFloat(formData.amount), // Convert back to number
      });
      console.log("Income updated successfully");
      closeModal();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Income</h2>
        <form onSubmit={handleSubmit}>
          <label className="label">
            Transaction Date:
            <input
              className="field"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>
          <label className="label">
            Source:
            <input
              className="field"
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              required
            />
          </label>
          <label className="label">
            Amount:
            <input
              className="field"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </label>
          <label className="label">
            Note:
            <input
              className="field"
              type="text"
              name="note"
              value={formData.note}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="add-expense-button">
            Save Changes
          </button>
        </form>
        <button className="close-button" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
}

export default EditIncome;
