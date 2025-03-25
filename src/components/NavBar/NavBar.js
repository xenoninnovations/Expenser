import React, { useState, useEffect } from "react";
import "./NavBar.css";
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaWallet, 
  FaClock, 
  FaBook, 
  FaEnvelope,
  FaChevronDown,
  FaBars 
} from 'react-icons/fa';

export default function NavBar() {
  const [isBudgetingOpen, setIsBudgetingOpen] = useState(false);
  const [isBookKeepingOpen, setIsBookKeepingOpen] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const location = useLocation();

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

  const isActiveRoute = (path) => location.pathname === path;

  const toggleNavbar = () => {
    setIsNavExpanded(!isNavExpanded);
  };

  return (
    <nav className={`navbar ${isNavExpanded ? "expanded" : "collapsed"}`}>
      <div className="profile-section">
        <div className="profile-header">
          <h3 className="profile-name">Fizikes Floky</h3>
          <button className="toggle-button" onClick={toggleNavbar}>
            <FaBars />
          </button>
        </div>
        <div className="profile-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
      </div>

      <ul className="nav-list">
        {/* Home */}
        <li className="nav-item">
          <Link to="/" className={isActiveRoute('/') ? 'active' : ''}>
            <FaHome className="nav-icon" />
            {isNavExpanded && <span>Home</span>}
          </Link>
        </li>

        {/* Budgeting */}
        <li className="nav-item">
          <div 
            className={`nav-link ${isBudgetingOpen ? 'open' : ''} ${location.pathname.includes('/budgeting') ? 'active' : ''}`}
            onClick={() => setIsBudgetingOpen(!isBudgetingOpen)}
          >
            <div className="nav-link-content">
              <FaWallet className="nav-icon" />
              {isNavExpanded && <span>Budgeting</span>}
            </div>
            {isNavExpanded && <FaChevronDown className={`chevron ${isBudgetingOpen ? 'open' : ''}`} />}
          </div>
          {isNavExpanded && isBudgetingOpen && (
            <ul className="submenu">
              <li className={isActiveRoute('/expensetracker') ? 'active' : ''}>
                <Link to="/expensetracker">Expense Tracker</Link>
              </li>
              <li className={isActiveRoute('/revenuetracker') ? 'active' : ''}>
                <Link to="/revenuetracker">Income/Revenue</Link>
              </li>
              <li className={isActiveRoute('/savings') ? 'active' : ''}>
                <Link to="/savings">Savings</Link>
              </li>
              <li className={isActiveRoute('/transactions') ? 'active' : ''}>
                <Link to="/transactions">Transactions</Link>
              </li>
            </ul>
          )}
        </li>

        {/* Book Keeping */}
        <li className="nav-item">
          <div 
            className={`nav-link ${isBookKeepingOpen ? 'open' : ''} ${location.pathname.includes('/bookkeeping') ? 'active' : ''}`}
            onClick={() => setIsBookKeepingOpen(!isBookKeepingOpen)}
          >
            <div className="nav-link-content">
              <FaBook className="nav-icon" />
              {isNavExpanded && <span>Book Keeping</span>}
            </div>
            {isNavExpanded && <FaChevronDown className={`chevron ${isBookKeepingOpen ? 'open' : ''}`} />}
          </div>
          {isNavExpanded && isBookKeepingOpen && (
            <ul className="submenu">
              <li className={isActiveRoute('/clientmanagement') ? 'active' : ''}>
                <Link to="/clientmanagement">Client Management</Link>
              </li>
              <li className={isActiveRoute('/conflict-check') ? 'active' : ''}>
                <Link to="/conflict-check">Conflict Check</Link>
              </li>
              <li className={isActiveRoute('/document-drafting') ? 'active' : ''}>
                <Link to="/document-drafting">Document Drafting</Link>
              </li>
            </ul>
          )}
        </li>

        {/* Time Tracking */}
        <li className="nav-item">
          <Link to="/timetracker" className={isActiveRoute('/timetracker') ? 'active' : ''}>
            <FaClock className="nav-icon" />
            {isNavExpanded && <span>Time Tracking</span>}
          </Link>
        </li>

        {/* Email */}
        <li className="nav-item">
          <Link to="/email" className={isActiveRoute('/email') ? 'active' : ''}>
            <FaEnvelope className="nav-icon" />
            {isNavExpanded && <span>Email</span>}
          </Link>
        </li>
      </ul>

      <div className="logo-section">
        <div className="logo">
          <div className="logo-circle"></div>
          <div className="logo-square"></div>
          <div className="logo-triangle"></div>
        </div>
      </div>
    </nav>
  );
}
