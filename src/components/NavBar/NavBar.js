import React from "react";
import "./NavBar.css";
import profileImg from "../../images/profile.png";
import settingsIcon from "../../images/settings.svg";
import dots from "../../images/dots.svg";

export default function NavBar() {
  return (
    <nav className="navbar">
      <section className="profile-box">
        <img
          src={profileImg}
          alt="profile picture"
          className="profile-picture"
        />
        <section className="user-sett-dots">
          <section className="username-settings">
            <h3 className="username">Fizkies Floky</h3>
            <img
              src={settingsIcon}
              alt="settings icon"
              className="settings-icon"
            />
          </section>
          <img src={dots} alt="dots" className="dots"/>
        </section>
      </section>
    </nav>
  );
}
