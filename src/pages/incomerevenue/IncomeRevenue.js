import React from "react";
import "../assets/styles/IncomeRevenue.css";
import "../assets/styles/global.css";
import Navbar from "../../components/NavBar/NavBar";
import dots from "../../images/dots.svg";

function IncomeRevenue() {
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
            <h2 className="inc-rev-title">
              <span className="yellow-bar"></span> Your total income
            </h2>
            <span className="">$3000</span>
          </div>
          <div className="inc-rev-header">
            <h2 className="inc-rev-title">
              <span className="yellow-bar"></span> Your total revenue
            </h2>
            <span className="">$3000</span>
          </div>
        </div>
        {/** Revenue table */}
        <div className="table-container">
          <div className="table-header">
            <h2 className="table-title">
              <span className="yellow-bar"></span> My Revenue
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
                  "Invoice",
                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>
            <tbody>No items yet...</tbody>
          </table>
        </div>
        {/** Revenue table */}
        <div className="table-container">
          <div className="table-header">
            <h2 className="table-title">
              <span className="yellow-bar"></span> My Income
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
                  "Invoice",
                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>
            <tbody>No items yet...</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default IncomeRevenue;
