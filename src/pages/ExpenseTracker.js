import React, { useState, useEffect } from "react";
import Navbar from "../components/NavBar/NavBar";
import "../pages/assets/styles/global.css";
import "./assets/styles/ExpenseTracker.css";
import dots from "../images/dots.svg";
import { FaPen, FaTrash } from "react-icons/fa";
import AddExpense from "../components/AddExpense/AddExpense";
import EditExpense from "../components/EditExpense/EditExpense";
import DeleteExpense from "../components/DeleteExpense/DeleteExpense";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config";
import { CSVLink } from "react-csv";

function ExpenseTracker() {
  // State to manage modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);

  // Function to load expenses
  const loadExpenses = async () => {
    try {
      const expensesRef = collection(db, "expenses");
      const querySnapshot = await getDocs(expensesRef);

      const expensesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setExpenses(expensesList);
    } catch (error) {
      console.error("Error fetching expenses: ", error);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    const calculateTotal = () => {
      const sum = expenses.reduce(
        (acc, expense) => acc + parseFloat(expense.amount || 0),
        0
      );
      setTotal(sum);
    };

    calculateTotal();
  }, [expenses]);

  const handleEditClick = (expenseId) => {
    setSelectedExpenseId(expenseId); // Set the selected expense ID
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleDeleteClick = (expenseId) => {
    setSelectedExpenseId(expenseId); // Set the selected expense ID
    setIsDeleteModalOpen(true); // Open the delete modal
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="header">
          <h3>Expense Tracker</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>
        <div className="expense-buttons">
          <button className="buttons" onClick={() => setIsAddModalOpen(true)}>
            Add an expense
          </button>
          <CSVLink
            filename={"your-expenses"}
            data={expenses}
            className="buttons"
          >
            Export as CSV
          </CSVLink>
        </div>
        <div className="table-container">
          <div className="table-header">
            <h2 className="table-title">
              <span className="yellow-bar"></span> My Expenses
            </h2>
          </div>
          <table className="global-table">
            <thead>
              <tr>
                {[
                  "Item",
                  "Transaction date",
                  "Amount",
                  "Category",
                  "Merchant",
                  "Actions",
                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="table-row">
                  <td>{expense.item}</td>
                  <td>{expense.date}</td>
                  <td>
                    $
                    {Number(expense.amount)
                      .toFixed(2)
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}
                  </td>
                  <td>{expense.category}</td>
                  <td>{expense.merchant}</td>
                  <td>
                    <FaPen
                      className="icon edit-icon"
                      onClick={() => handleEditClick(expense.id)}
                    />
                    <FaTrash
                      className="icon delete-icon"
                      onClick={() => handleDeleteClick(expense.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="expenses-total">
          <h4>
            <span className="total-icon">💰</span>
            The <span>total</span> of your Expenses:
          </h4>
          <h4>${total.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}</h4>
        </div>
      </div>
      {/* AddExpense Modal */}
      {isAddModalOpen && (
        <AddExpense
          closeModal={() => setIsAddModalOpen(false)}
          refreshExpenses={loadExpenses}
        />
      )}
      {/* EditExpense Modal */}
      {isEditModalOpen && (
        <EditExpense
          closeModal={() => setIsEditModalOpen(false)}
          expenseId={selectedExpenseId}
          refreshExpenses={loadExpenses}
        />
      )}
      {/* DeleteExpense Modal */}
      {isDeleteModalOpen && (
        <DeleteExpense
          closeModal={() => setIsDeleteModalOpen(false)}
          expenseId={selectedExpenseId}
          refreshExpenses={loadExpenses}
        />
      )}
    </div>
  );
}

export default ExpenseTracker;
