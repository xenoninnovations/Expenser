import React from "react";
import Navbar from "../components/NavBar/NavBar";
import "./assets/styles/global.css";
import "./assets/styles/ExpenseTracker.css";
import dots from "../images/dots.svg";
import { FaPen, FaTrash } from "react-icons/fa";

function ExpenseTracker() {
  //temp JSON
  const expenses = [
    {
      item: "Headphones",
      date: "July 2, 2024",
      amount: "$2,365.00",
      category: "Electronics",
      merchant: "Beats",
    },
    {
      item: "Headphones",
      date: "July 2, 2024",
      amount: "$2,365.00",
      category: "Electronics",
      merchant: "Beats",
    },
    {
      item: "Headphones",
      date: "July 2, 2024",
      amount: "$2,365.00",
      category: "Electronics",
      merchant: "Beats",
    },
    {
      item: "Headphones",
      date: "July 2, 2024",
      amount: "$2,365.00",
      category: "Electronics",
      merchant: "Beats",
    },
  ];

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="header">
          <h3>Expense Tracker</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>
        <div className="expense-buttons">
          <button className="buttons">Add an expense</button>
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
                  <td>{expense.amount}</td>
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
    </div>
  );
}

export default ExpenseTracker;
