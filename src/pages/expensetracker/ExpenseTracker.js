import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
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

  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);

  // State for month and year selection
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year

  // Function to load expenses filtered by month and year
  const loadExpenses = async (selectedMonth, selectedYear) => {
    try {
      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth, 0);

      const expensesRef = collection(db, "expenses");
      const q = query(
        expensesRef,
        where("date", ">=", startOfMonth.toISOString().split("T")[0]),
        where("date", "<=", endOfMonth.toISOString().split("T")[0])
      );

      const querySnapshot = await getDocs(q);
      const expensesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expensesList);
    } catch (error) {
      console.error("Error fetching expenses: ", error);
    }
  };

  // Function to load all expenses (no filters)
  const loadAllExpenses = async () => {
    try {
      const expensesRef = collection(db, "expenses");
      const querySnapshot = await getDocs(expensesRef);
      const expensesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expensesList);
    } catch (error) {
      console.error("Error fetching all expenses: ", error);
    }
  };

  useEffect(() => {
    loadExpenses(month, year);
  }, [month, year]); // Reload whenever month or year changes

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
    setSelectedExpenseId(expenseId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setIsDeleteModalOpen(true);
  };

  const handleClearFilterClick = () => {
    setMonth(new Date().getMonth() + 1); // Reset month to current
    setYear(new Date().getFullYear()); // Reset year to current
    loadAllExpenses(); // Fetch all records
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
          <GlobalButton
            bg={"#222222"}
            textColor={"white"}
            icon={FaPlus}
            text={"Add an expense"}
            onClick={() => setIsAddModalOpen(true)}
          />

          <CSVLink
            filename={"your-expenses"}
            data={expenses}
            className="buttons"
          >
            <FaFileExport />
            Export as CSV
          </CSVLink>
        </div>
        <div className="filters">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="dropdown"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("en-US", { month: "long" })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min="2000"
            max={new Date().getFullYear()}
            className="dropdown"
          />
          <GlobalButton
            bg={"#222222"}
            textColor={"white"}
            icon={FaTrash}
            text={"Clear filters"}
            onClick={() => handleClearFilterClick()}
          />
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
      {isAddModalOpen && (
        <AddExpense
          closeModal={() => setIsAddModalOpen(false)}
          refreshExpenses={() => loadExpenses(month, year)}
        />
      )}
      {isEditModalOpen && (
        <EditExpense
          closeModal={() => setIsEditModalOpen(false)}
          expenseId={selectedExpenseId}
          refreshExpenses={() => loadExpenses(month, year)}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteExpense
          closeModal={() => setIsDeleteModalOpen(false)}
          expenseId={selectedExpenseId}
          refreshExpenses={() => loadExpenses(month, year)}
        />
      )}
    </div>
  );
}

export default ExpenseTracker;
