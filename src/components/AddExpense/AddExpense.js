import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import "../../pages/assets/styles/RevenueTracker.css";
import { db } from "../../config.js";

function AddExpense({ closeModal, refreshExpenses }) {
  const [formData, setFormData] = useState({
    date: "",
    item: "",
    amount: "",
    category: "",
    merchant: "",
  });
  const [categories, setCategories] = useState([]); // State for storing categories
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const collectionRef = collection(db, "expenses");
      await addDoc(collectionRef, {
        ...formData,
        date: new Date(formData.date).toISOString().split("T")[0], // Save in ISO format
        isHidden: false, // Set isHidden to false for new expenses
      });
      console.log("Expense added successfully");
      closeModal();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories"); // Reference to "categories" collection
        const querySnapshot = await getDocs(categoriesRef);

        // Map through documents and set categories state
        const categoriesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    loadCategories();
  }, []); // Fetch categories on component load

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add an Expense</h2>
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
          <button type="submit" className="modal-button save">
            Add Expense
          </button>
        </form>
        <button className="cancel-button" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
}

export default AddExpense;
