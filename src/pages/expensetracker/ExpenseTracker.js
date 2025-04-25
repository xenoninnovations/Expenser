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
import AddRevenue from "../../components/AddRevenue/AddRevenue";
import EditRevenue from "../../components/EditRevenue/EditRevenue";
import DeleteRevenue from "../../components/DeleteRevenue/DeleteRevenue";
import { CSVLink } from "react-csv";
import GlobalButton from "../../components/GlobalButton/GlobalButton";

function ExpenseTracker() {
  const [isAddModalOpenExpense, setIsAddModalOpenExpense] = useState(false);
  const [isEditModalOpenExpense, setIsEditModalOpenExpense] = useState(false);
  const [isDeleteModalOpenExpense, setIsDeleteModalOpenExpense] =
    useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  const [isAddModalOpenRevenue, setIsAddModalOpenRevenue] = useState(false);
  const [isEditModalOpenRevenue, setIsEditModalOpenRevenue] = useState(false);
  const [isDeleteModalOpenRevenue, setIsDeleteModalOpenRevenue] =
    useState(false);
  const [selectedRevenueId, setSelectedRevenueId] = useState(null);

  const [expenseData, setExpenseData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

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
      const total = expensesList.reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0
      );
      setTotalExpense(total);
    } catch (error) {
      console.error("Error fetching expenses: ", error);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const revenueRef = collection(db, "revenue");
      const querySnapshot = await getDocs(revenueRef);
      const revenueList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          amount: parseFloat(data.amount), // Ensure amount is a number
          date: formatDate(data.date),
        };
      });
      setRevenueData(revenueList);

      const total = revenueList.reduce(
        (sum, revenue) => sum + (revenue.amount || 0),
        0
      );
      setTotalRevenue(total);
    } catch (error) {
      console.error("Error fetching revenue data: ", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      if (typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString(); // Firestore Timestamp
      }
      return new Date(date).toLocaleDateString(); // String date
    } catch {
      return "N/A"; // Fallback for invalid dates
    }
  };

  useEffect(() => {
    loadAllExpenses();
    fetchRevenueData();
  }, []); // Run on component mount

  const handleEditClickExpense = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setIsEditModalOpenExpense(true);
  };

  const handleDeleteClickExpense = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setIsDeleteModalOpenExpense(true);
  };

  const handleEditClickRevenue = (revenueId) => {
    setSelectedRevenueId(revenueId);
    setIsEditModalOpenRevenue(true);
  };

  const handleDeleteClickRevenue = (revenueId) => {
    setSelectedRevenueId(revenueId);
    setIsDeleteModalOpenRevenue(true);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="header">
          <h3>Finances Tracker</h3>
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
          <div className="revexp-header">
            <span className="yellow-bar rev"></span>
            <h2 className="revexp-title">Your total revenue</h2>
            <span className="revexp-total">
              <strong>
                ${totalRevenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
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

        {/** Expense Table */}
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
              onClick={() => setIsAddModalOpenExpense(true)}
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
                        onClick={() => handleEditClickExpense(expense.id)}
                      />
                      <FaTrash
                        className="icon delete-icon"
                        onClick={() => handleDeleteClickExpense(expense.id)}
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

        {/** Revenue Table */}
        <div className="table-container">
          <div className="table-header rev">
            <div className="rev-spaced">
              <span className="yellow-bar rev"></span>
              <h2 className="table-title">My Revenue</h2>
            </div>
            <GlobalButton
              bg={"white"}
              textColor={"#222222"}
              icon={FaPlus}
              text={"Add a Revenue"}
              onClick={() => setIsAddModalOpenRevenue(true)}
            />
          </div>
          <table className="global-table">
            <thead>
              <tr>
                {[
                  "Source",
                  "Transaction date",
                  "Amount",
                  "Note",
                  "Actions",
                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {revenueData.length > 0 ? (
                revenueData.map((revenue) => (
                  <tr key={revenue.id} className="table-row">
                    <td>{revenue.source || "N/A"}</td>
                    <td>{revenue.date}</td>
                    <td>
                      $
                      {revenue.amount
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </td>
                    <td>{revenue.note || "N/A"}</td>
                    <td>
                      <FaPen
                        className="icon edit-icon"
                        onClick={() => handleEditClickRevenue(revenue.id)}
                      />
                      <FaTrash
                        className="icon delete-icon"
                        onClick={() => handleDeleteClickRevenue(revenue.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No revenue data available...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpenExpense && (
        <AddExpense
          closeModal={() => {
            setIsAddModalOpenExpense(false);
            loadAllExpenses(); // Refresh after adding
          }}
        />
      )}
      {isEditModalOpenExpense && (
        <EditExpense
          closeModal={() => {
            setIsEditModalOpenExpense(false);
            loadAllExpenses(); // Refresh after editing
          }}
          expenseId={selectedExpenseId}
        />
      )}
      {isDeleteModalOpenExpense && (
        <DeleteExpense
          closeModal={() => {
            setIsDeleteModalOpenExpense(false);
            loadAllExpenses(); // Refresh after deletion
          }}
          expenseId={selectedExpenseId}
        />
      )}
      {isAddModalOpenRevenue && (
        <AddRevenue
          closeModal={() => {
            setIsAddModalOpenRevenue(false);
            fetchRevenueData();
          }}
        />
      )}
      {isEditModalOpenRevenue && (
        <EditRevenue
          closeModal={() => {
            setIsEditModalOpenRevenue(false);
            fetchRevenueData();
          }}
          revenueId={selectedRevenueId}
        />
      )}
      {isDeleteModalOpenRevenue && (
        <DeleteRevenue
          closeModal={() => {
            setIsDeleteModalOpenRevenue(false);
            fetchRevenueData();
          }}
          revenueId={selectedRevenueId}
        />
      )}
    </div>
  );
}

export default ExpenseTracker;
