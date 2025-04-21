import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config";
import Navbar from "../../components/NavBar/NavBar";
import "../assets/styles/RevenueTracker.css";
import dots from "../../images/dots.svg";
import GlobalButton from "../../components/GlobalButton/GlobalButton";
import AddRevenue from "../../components/AddRevenue/AddRevenue";
import EditRevenue from "../../components/EditRevenue/EditRevenue";
import DeleteRevenue from "../../components/DeleteRevenue/DeleteRevenue";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";

function IncomeRevenue() {
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

  const handleEditClick = (revenueId) => {
    setSelectedId(revenueId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (revenueId) => {
    setSelectedId(revenueId);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="header">
          <h3>Revenue Tracker</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>

        <div className="revexp-totals">
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
              onClick={() => setIsAddModalOpen(true)}
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
                        onClick={() => handleEditClick(revenue.id)}
                      />
                      <FaTrash
                        className="icon delete-icon"
                        onClick={() => handleDeleteClick(revenue.id)}
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
        {isAddModalOpen && (
          <AddRevenue
            closeModal={() => {
              setIsAddModalOpen(false);
              fetchRevenueData();
            }}
          />
        )}
        {isEditModalOpen && (
          <EditRevenue
            closeModal={() => {
              setIsEditModalOpen(false);
              fetchRevenueData();
            }}
            revenueId={selectedId}
          />
        )}
        {isDeleteModalOpen && (
          <DeleteRevenue
            closeModal={() => {
              setIsDeleteModalOpen(false);
              fetchRevenueData();
            }}
            revenueId={selectedId}
          />
        )}
      </div>
    </div>
  );
}

export default IncomeRevenue;
