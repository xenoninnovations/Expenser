import React, { useState, useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config";

import "../assets/styles/global.css";
import "../assets/styles/auth.css";

function Forgotpassword() {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent");
    } catch (error) {
      console.error(
        "Error sending password reset email:",
        error.code,
        error.message
      );
    }
  };
  return (
    <div className="page" id="signin-page">
      <div className="signin-container">
        <div className="form-heading">
          <h1 className="form-title">Forgot Password</h1>
          <p className="form-description">
            Forgotten your password? That's okay, <br />just enter your email to recieve a reset link!
          </p>
        </div>
        <form id="signin-form" onSubmit={handlePasswordReset}>
          <input
            name="email"
            type="email"
            value={email}
            className="email"
            placeholder="Your Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="form-submit">
            Submit
          </button>
        </form>
        <section></section>
      </div>
    </div>
  );
}

export default Forgotpassword;
