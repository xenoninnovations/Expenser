import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config";
import Navbar from "../../components/NavBar/NavBar";
import "../assets/styles/IncomeRevenue.css";
import dots from "../../images/dots.svg";
import GlobalButton from "../../components/GlobalButton/GlobalButton";
import AddIncome from "../../components/AddIncome/AddIncome";
import EditIncome from "../../components/EditIncome/EditIncome";
import DeleteIncome from "../../components/DeleteIncome/DeleteIncome";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";

function IncomeRevenue() {
  const [incomeData, setIncomeData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isEditIncomeModalOpen, setIsEditIncomeModalOpen] = useState(false);
  const [isDeleteIncomeModalOpen, setIsDeleteIncomeModalOpen] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState(null);

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

  const fetchIncomeData = async () => {
    try {
      const incomeRef = collection(db, "income");
      const querySnapshot = await getDocs(incomeRef);
      const incomeList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          amount: parseFloat(data.amount), // Ensure amount is a number
          date: formatDate(data.date),
        };
      });
      setIncomeData(incomeList);

      const total = incomeList.reduce(
        (sum, income) => sum + (income.amount || 0),
        0
      );
      setTotalIncome(total);
    } catch (error) {
      console.error("Error fetching income data: ", error);
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

  const handleEditClick = (incomeId) => {
    setSelectedIncomeId(incomeId);
    setIsEditIncomeModalOpen(true);
  };

  const handleDeleteClick = (incomeId) => {
    setSelectedIncomeId(incomeId);
    setIsDeleteIncomeModalOpen(true);
  };

  useEffect(() => {
    fetchIncomeData();
    fetchRevenueData();
  }, []);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="header">
          <h3>Income and Revenue Tracker</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>

        <div className="inc-rev-totals">
          <div className="inc-rev-header">
            <span className="yellow-bar inc-rev"></span>
            <h2 className="inc-rev-title">
              Your total <strong>income</strong>
            </h2>
            <span className="inc-rev-total">
              ${totalIncome.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
          </div>
          <div className="inc-rev-header">
            <span className="yellow-bar inc-rev"></span>
            <h2 className="inc-rev-title">
              Your total <strong>revenue</strong>
            </h2>
            <span className="inc-rev-total">
              ${totalRevenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header inc-rev">
            <h2 className="table-title">
              <span className="yellow-bar"></span> My Income
            </h2>
            <GlobalButton
              bg={"white"}
              textColor={"#222222"}
              icon={FaPlus}
              text={"Add an Income"}
              onClick={() => setIsAddIncomeModalOpen(true)}
            />
          </div>
          <table className="global-table">
            <thead>
              <tr>
                {["Source", "Transaction date", "Amount", "Note", "Actions"].map(
                  (head) => (
                    <th key={head}>{head} ⬍</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {incomeData.length > 0 ? (
                incomeData.map((income) => (
                  <tr key={income.id} className="table-row">
                    <td>{income.source || "N/A"}</td>
                    <td>{income.date}</td>
                    <td>
                      $
                      {income.amount
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </td>
                    <td>{income.note || "N/A"}</td>
                    <td>
                      <FaPen
                        className="icon edit-icon"
                        onClick={() => handleEditClick(income.id)}
                      />
                      <FaTrash
                        className="icon delete-icon"
                        onClick={() => handleDeleteClick(income.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No income data available...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isAddIncomeModalOpen && (
          <AddIncome
            closeModal={() => {
              setIsAddIncomeModalOpen(false);
              fetchIncomeData(); // Refresh income list
            }}
          />
        )}
        {isEditIncomeModalOpen && (
          <EditIncome
            closeModal={() => {
              setIsEditIncomeModalOpen(false);
              fetchIncomeData(); // Refresh income list
            }}
            incomeId={selectedIncomeId}
          />
        )}
        {isDeleteIncomeModalOpen && (
          <DeleteIncome
            closeModal={() => {
              setIsDeleteIncomeModalOpen(false);
              fetchIncomeData(); // Refresh income list
            }}
            incomeId={selectedIncomeId}
          />
        )}
      </div>
    </div>
  );
}

export default IncomeRevenue;
