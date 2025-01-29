import React, { useState, useEffect } from "react";
import "./NavBar.css";
import profileImg from "../../images/profile.png";
import settingsIcon from "../../images/settings.svg";
import dots from "../../images/dots.svg";
import dashboardIcon from "../../images/dashboard.svg";
import budgetingIcon from "../../images/budgeting.svg";
import timeIcon from "../../images/time.svg";
import bookIcon from "../../images/bookkeeping.svg";
import collapseIcon from "../../images/collapse.svg";
import GlobalButton from "../GlobalButton/GlobalButton";
import { FaRegUser, FaUser } from "react-icons/fa";

export default function NavBar() {
  const [isBudgetingOpen, setIsBudgetingOpen] = useState(false);
  const [isTimeTrackingOpen, setIsTimeTrackingOpen] = useState(false);
  const [isBookKeepingOpen, setIsBookKeepingOpen] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  // Auto-collapse on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 2503) {
        setIsNavExpanded(false);
      } else {
        setIsNavExpanded(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className={`navbar ${isNavExpanded ? "expanded" : "collapsed"}`}>
      <section className="profile-box">
        <img
          src={settingsIcon}
          alt="settings icon"
          className="settings-icon"
          onClick={() => setIsNavExpanded(!isNavExpanded)}
        />
        {isNavExpanded && (
          <section className="user-sett-dots">
            <section className="username-settings">
              <h3 className="username">Fizkies Floky</h3>
              <img src={dots} alt="dots" className="dots" />
            </section>
          </section>
        )}
      </section>

      <ul className="nav-list">
        <section className="list-group">
          <section className="main-nav">
          <section className="icon-item">
            <img
              src={dashboardIcon}
              alt="dashboard icon"
              className="list-icon"
            />
            {isNavExpanded && (
              <a href="/">
                <li className="list-item">Dashboard</li>
              </a>
            )}
          </section>
          </section>
        </section>

        {/* Budgeting Section */}
        <section className="list-group">
          <section
            className="main-nav"
            onClick={() => setIsBudgetingOpen(!isBudgetingOpen)}
          >
            <section className="icon-item">
              <img
                src={budgetingIcon}
                alt="budgeting icon"
                className="list-icon"
              />
              {isNavExpanded && <li className="list-item">Budgeting</li>}
            </section>
            {isNavExpanded && (
              <img
                src={collapseIcon}
                alt="collapse icon"
                className={`collapse-icon ${isBudgetingOpen ? "open" : ""}`}
              />
            )}
          </section>
          {isBudgetingOpen && isNavExpanded && (
            <ul className="mini-nav">
              <li className="mini-item">
                <a href="/expensetracker">Expense Tracker</a>
              </li>
              <li className="mini-item">
              <a href="/revenuetracker">Revenue Tracker</a>
                
                </li>
              <li className="mini-item">Savings</li>
              <li className="mini-item">Transactions</li>
            </ul>
          )}
        </section>

        {/* Time Tracking Section */}
        <section className="list-group">
          <section
            className="main-nav"
            onClick={() => setIsTimeTrackingOpen(!isTimeTrackingOpen)}
          >
            <section className="icon-item">
              <img
                src={timeIcon}
                alt="time tracking icon"
                className="list-icon"
              />
              {isNavExpanded && <li className="list-item">Time Tracking</li>}
            </section>
            {isNavExpanded && (
              <img
                src={collapseIcon}
                alt="collapse icon"
                className={`collapse-icon ${isTimeTrackingOpen ? "open" : ""}`}
              />
            )}
          </section>
          {isTimeTrackingOpen && isNavExpanded && (
            <ul className="mini-nav">
              <li className="mini-item">
                <a href="/timetracker">Time Tracker</a>
              </li>
              <li className="mini-item">Calendar</li>
              <li className="mini-item">Automations</li>
              <li className="mini-item">Time Sheets</li>
            </ul>
          )}
        </section>

        {/* Book Keeping Section */}
        <section className="list-group">
          <section
            className="main-nav"
            onClick={() => setIsBookKeepingOpen(!isBookKeepingOpen)}
          >
            <section className="icon-item">
              <img
                src={bookIcon}
                alt="bookkeeping icon"
                className="list-icon"
              />
              {isNavExpanded && <li className="list-item">Book Keeping</li>}
            </section>
            {isNavExpanded && (
              <img
                src={collapseIcon}
                alt="collapse icon"
                className={`collapse-icon ${isBookKeepingOpen ? "open" : ""}`}
              />
            )}
          </section>
          {isBookKeepingOpen && isNavExpanded && (
            <ul className="mini-nav">
              <li className="mini-item">
                <a href="/clientmanagement">Client Management</a>
              </li>
              <li className="mini-item">Cost Breakdown</li>
              <li className="mini-item">Invoicing & Payments</li>
            </ul>
          )}
        </section>
      </ul>

      <div>
        <section id="auth">
          <a href="/signin">Signin</a> <br/>
          <a href="/signup">Signup</a>
        </section>
      </div>
    </nav>
  );
}
