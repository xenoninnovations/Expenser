import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import "../../pages/assets/styles/RevenueTracker.css";
import { db } from "../../config.js";

function EditExpense({ closeModal, expenseId, refreshExpenses }) {
  const [formData, setFormData] = useState({
    date: "",
    item: "",
    amount: "",
    category: "",
    merchant: "",
  });
  const [categories, setCategories] = useState([]); // State for storing categories

  useEffect(() => {
    const loadExpense = async () => {
      try {
        const expenseRef = doc(db, "expenses", expenseId);
        const expenseSnapshot = await getDoc(expenseRef);
        if (expenseSnapshot.exists()) {
          setFormData(expenseSnapshot.data());
        } else {
          console.error("No such expense found!");
        }
      } catch (error) {
        console.error("Error fetching expense: ", error);
      }
    };

    loadExpense();
  }, [expenseId]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories"); // Pass db here correctly
        const querySnapshot = await getDocs(categoriesRef);

        // Map through documents and set categories state
        const categoriesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Category", // Default name if missing
        }));
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const expenseRef = doc(db, "expenses", expenseId);
      await updateDoc(expenseRef, formData);
      console.log("Expense updated successfully");

      // Close modal and refresh expenses after submission
      closeModal();
      refreshExpenses && refreshExpenses();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Expense</h2>
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
            Item Name:
            <input
              className="field"
              type="text"
              name="item"
              value={formData.item}
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
            Merchant:
            <input
              className="field"
              type="text"
              name="merchant"
              value={formData.merchant}
              onChange={handleChange}
              required
            />
          </label>
          <label className="label">
            Category:
            <select
              className="field"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
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

export default EditExpense;
