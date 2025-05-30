import React from "react";
import './mobileNav.css'

function mobileNav() {
  return (
    <div className="navbar-minimized">
      <div className="nav-content">
        <div className="profile-data"></div>
        <div className="nav-icons"></div>
      </div>

      <div className="company-logo"></div>
    </div>
  );
}

export default mobileNav;