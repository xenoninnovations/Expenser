import React, { useState } from "react";
import Navbar from "../../components/NavBar/NavBar";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config";
import { useNavigate } from "react-router-dom";

import "../assets/styles/global.css";
import "../assets/styles/auth.css";

function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/signin');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="page" id="signin-page">
      <div className="signin-container">
        <div className="form-heading">
          <h1 className="form-title">Create an account</h1>
          <p className="form-description">
            Just some basic stuff, <br /> make sure not to share this
            information with anyone!
          </p>
        </div>
        <form id="signin-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            value={email}
            className="email"
            placeholder="Your Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            name="password"
            type="password"
            value={password}
            className="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="form-submit">Submit</button>
        </form>
        <p className="form-description">
            If you already have an account <a href='/signin'>Sign In</a>
          </p>
        <section></section>
      </div>
    </div>
  );
}

export default Home;
