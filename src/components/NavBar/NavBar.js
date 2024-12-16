import React, { useState } from "react";
import "./NavBar.css";
import profileImg from "../../images/profile.png";
import settingsIcon from "../../images/settings.svg";
import dots from "../../images/dots.svg";
import dashboardIcon from "../../images/dashboard.svg";
import budgetingIcon from "../../images/budgeting.svg";
import timeIcon from "../../images/time.svg";
import bookIcon from "../../images/bookkeeping.svg";
import collapseIcon from "../../images/collapse.svg";

export default function NavBar() {
  const [isBudgetingOpen, setIsBudgetingOpen] = useState(false);
  const [isTimeTrackingOpen, setIsTimeTrackingOpen] = useState(false);
  const [isBookKeepingOpen, setIsBookKeepingOpen] = useState(false);

  const toggleBudgeting = () => {
    setIsBudgetingOpen(!isBudgetingOpen);
  };

  const toggleTimeTracking = () => {
    setIsTimeTrackingOpen(!isTimeTrackingOpen);
  };

  const toggleBookKeeping = () => {
    setIsBookKeepingOpen(!isBookKeepingOpen);
  };

  return (
    <nav className="navbar">
      <section className="profile-box">
        {/* <img src={profileImg} alt="profile" className="profile-picture" /> */}
        <section className="user-sett-dots">
          <section className="username-settings">
            <h3 className="username">Fizkies Floky</h3>
            <img
              src={settingsIcon}
              alt="settings icon"
              className="settings-icon"
            />
          </section>
          <img src={dots} alt="dots" className="dots" />
        </section>
      </section>
      <ul className="nav-list">
        <section className="list-dashboard">
          <img src={dashboardIcon} alt="dashboard icon" className="list-icon" />
          <li className="list-item">Dashboard</li>
        </section>
        <section className="list-group">
          <section className="main-nav" onClick={toggleBudgeting}>
            <section className="icon-item">
              <img
                src={budgetingIcon}
                alt="budgeting icon"
                className="list-icon"
              />
              <li className="list-item">Budgeting</li>
            </section>
            <img
              src={collapseIcon}
              alt="collapse icon"
              className={`collapse-icon ${isBudgetingOpen ? "open" : ""}`}
            />
          </section>
          {isBudgetingOpen && (
            <ul className="mini-nav">
              <a href="/expensetracker">
                <li className="mini-item">Expense Tracker</li>
              </a>
              <a href="/incomerevenue">
                <li className="mini-item">Income/Revenue</li>
              </a>
              <li className="mini-item">Savings</li>
              <li className="mini-item">Transactions</li>
            </ul>
          )}
        </section>
        <section className="list-group">
          <section className="main-nav" onClick={toggleTimeTracking}>
            <section className="icon-item">
              <img
                src={timeIcon}
                alt="time tracking icon"
                className="list-icon"
              />
              <li className="list-item">Time tracking</li>
            </section>
            <img
              src={collapseIcon}
              alt="collapse icon"
              className={`collapse-icon ${isTimeTrackingOpen ? "open" : ""}`}
            />
          </section>
          {isTimeTrackingOpen && (
            <ul className="mini-nav">
              <li className="mini-item">Calendar</li>
              <li className="mini-item">Automations</li>
              <li className="mini-item">Time Sheets</li>
            </ul>
          )}
        </section>
        <section className="list-group">
          <section className="main-nav" onClick={toggleBookKeeping}>
            <section className="icon-item">
              <img
                src={bookIcon}
                alt="bookkeeping icon"
                className="list-icon"
              />
              <li className="list-item">Book keeping</li>
            </section>
            <img
              src={collapseIcon}
              alt="collapse icon"
              className={`collapse-icon ${isBookKeepingOpen ? "open" : ""}`}
            />
          </section>
          {isBookKeepingOpen && (
            <ul className="mini-nav">
              <a href="/expensetracker">
                <li className="mini-item">Expense Tracker</li>
              </a>
              <li className="mini-item">Income/Revenue</li>
              <li className="mini-item">Savings</li>
              <li className="mini-item">Transactions</li>
            </ul>
          )}
        </section>
      </ul>

      <div>
        <section id="auth">
          <a href="/signin">Signin</a> <br />
          <a href="/signup">Signup</a>
        </section>
      </div>
    </nav>
  );
}
