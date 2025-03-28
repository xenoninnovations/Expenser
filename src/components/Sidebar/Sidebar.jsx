import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaWallet, FaBook, FaClock, FaEnvelope } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();

    const mainMenuItems = [
        { path: '/', icon: <FaHome />, label: 'Home' },
        { 
            path: '/budgeting', 
            icon: <FaWallet />, 
            label: 'Budgeting',
            subItems: [
                { path: '/expense-tracker', label: 'Expense Tracker' },
                { path: '/income-revenue', label: 'Income/Revenue' },
                { path: '/savings', label: 'Savings' },
                { path: '/transactions', label: 'Transactions' },
            ]
        },
        { 
            path: '/book-keeping', 
            icon: <FaBook />, 
            label: 'Book Keeping',
            subItems: [
                { path: '/client-management', label: 'Client Management' },
                { path: '/conflict-check', label: 'Conflict Check' },
                { path: '/document-drafting', label: 'Document Drafting' },
            ]
        },
        { path: '/time-tracking', icon: <FaClock />, label: 'Time Tracking' },
        { path: '/email', icon: <FaEnvelope />, label: 'Email' }
    ];

    const isActive = (path) => location.pathname === path;
    const isParentActive = (item) => {
        if (item.subItems) {
            return item.subItems.some(subItem => location.pathname === subItem.path);
        }
        return false;
    };

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <img src="/path-to-profile-image.jpg" alt="Fizikes Floky" className="profile-image" />
                <div className="profile-name">Fizikes Floky</div>
                <div className="profile-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                </div>
            </div>

            <ul className="sidebar-menu">
                {mainMenuItems.map((item) => (
                    <li key={item.path} className={`menu-item ${isActive(item.path) || isParentActive(item) ? 'active' : ''}`}>
                        <Link to={item.path}>
                            <span className="icon">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </Link>
                        {item.subItems && (
                            <ul className="submenu">
                                {item.subItems.map((subItem) => (
                                    <li key={subItem.path} className={isActive(subItem.path) ? 'active' : ''}>
                                        <Link to={subItem.path}>{subItem.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>

            <div className="sidebar-footer">
                <img src="/path-to-logo.png" alt="Logo" className="logo" />
            </div>
        </nav>
    );
};

export default Sidebar; 