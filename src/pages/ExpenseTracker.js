import React, { useState, useEffect } from "react";
import Navbar from "../components/NavBar/NavBar";
import "../pages/assets/styles/global.css";
import "./assets/styles/ExpenseTracker.css";
import dots from "../images/dots.svg";
import { FaPen, FaTrash } from "react-icons/fa";
import AddExpense from "../components/AddExpense/AddExpense";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config";

function ExpenseTracker() {
  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const expensesRef = collection(db, "expenses"); // Reference to "categories" collection
        const querySnapshot = await getDocs(expensesRef);

        // Map through documents and set categories state
        const expensesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExpenses(expensesList);
      } catch (error) {
        console.error("Error fetching expenses: ", error);
      }
    };

    loadExpenses();
  }, []); // Fetch categories on component load
  
  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="header">
          <h3>Expense Tracker</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>
        <div className="expense-buttons">
          {/* Button to open modal */}
          <button className="buttons" onClick={() => setIsModalOpen(true)}>
            Add an expense
          </button>
          <button className="buttons">Export as CSV</button>
        </div>
        <div className="expenses-container">
          <div className="expenses-header">
            <h2 className="expenses-title">
              <span className="yellow-bar"></span> My Expenses
            </h2>
          </div>
          <table className="expenses-table">
            <thead>
              <tr>
                {[
                  "Item",
                  "Transaction date",
                  "Amount",
                  "Category",
                  "Merchant",
                  "Invoice",
                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={index} className="table-row">
                  <td>{expense.item}</td>
                  <td>{expense.date}</td>
                  <td>${Number(expense.amount).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                  <td>{expense.category}</td>
                  <td>{expense.merchant}</td>
                  <td>
                    <FaPen className="icon edit-icon" />
                    <FaTrash className="icon delete-icon" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* AddExpense Modal */}
      {isModalOpen && <AddExpense closeModal={() => setIsModalOpen(false)} />}
    </div>
  );
}

export default ExpenseTracker;
