import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config";
import Navbar from "../../components/NavBar/NavBar";
import "../assets/styles/global.css";
import "../assets/styles/ExpenseTracker.css";
import dots from "../../images/dots.svg";
import { FaPen, FaTrash, FaPlus, FaFileExport } from "react-icons/fa";
import AddExpense from "../../components/AddExpense/AddExpense";
import EditExpense from "../../components/EditExpense/EditExpense";
import DeleteExpense from "../../components/DeleteExpense/DeleteExpense";
import { CSVLink } from "react-csv";
import GlobalButton from "../../components/GlobalButton/GlobalButton";

function ExpenseTracker() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  const [expenseData, setExpenseData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  // Function to load all expenses
  const loadAllExpenses = async () => {
    try {
      const expensesRef = collection(db, "expenses");
      const querySnapshot = await getDocs(expensesRef);

      const expensesList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          amount: parseFloat(data.amount || 0), // Ensure amount is a number
          date: data.date ? new Date(data.date).toLocaleDateString() : "N/A", // Format date
        };
      });

      setExpenseData(expensesList);

      // Calculate total expense
      const total = expensesList.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      setTotalExpense(total);
    } catch (error) {
      console.error("Error fetching expenses: ", error);
    }
  };

  useEffect(() => {
    loadAllExpenses();
  }, []); // Run on component mount

  const handleEditClick = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="header">
          <h3>Expense Tracker</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>

        <div className="revexp-totals">
          <div className="revexp-header">
            <span className="yellow-bar exp"></span>
            <h2 className="revexp-title">Your total expenses</h2>
            <span className="revexp-total">
              <strong>
                ${totalExpense.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </strong>
            </span>
          </div>
        </div>

        <div className="expense-buttons">
          <CSVLink
            filename={"your-expenses.csv"}
            data={expenseData}
            className="buttons"
          >
            <FaFileExport />
            Export as CSV
          </CSVLink>
        </div>

        <div className="table-container">
          <div className="table-header exp">
            <div className="exp-spaced">
              <span className="yellow-bar exp"></span>
              <h2 className="table-title">My Expenses</h2>
            </div>
            <GlobalButton
              bg={"white"}
              textColor={"#222222"}
              icon={FaPlus}
              text={"Add an Expense"}
              onClick={() => setIsAddModalOpen(true)}
            />
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
              {expenseData.length > 0 ? (
                expenseData.map((expense) => (
                  <tr key={expense.id} className="table-row">
                    <td>{expense.item || "N/A"}</td>
                    <td>{expense.date}</td>
                    <td>
                      $
                      {expense.amount
                        .toFixed(2)
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}
                    </td>
                    <td>{expense.category || "N/A"}</td>
                    <td>{expense.merchant || "N/A"}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan="6">No expense data available...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddExpense
          closeModal={() => {
            setIsAddModalOpen(false);
            loadAllExpenses(); // Refresh after adding
          }}
        />
      )}
      {isEditModalOpen && (
        <EditExpense
          closeModal={() => {
            setIsEditModalOpen(false);
            loadAllExpenses(); // Refresh after editing
          }}
          expenseId={selectedExpenseId}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteExpense
          closeModal={() => {
            setIsDeleteModalOpen(false);
            loadAllExpenses(); // Refresh after deletion
          }}
          expenseId={selectedExpenseId}
        />
      )}
    </div>
  );
}

export default ExpenseTracker;