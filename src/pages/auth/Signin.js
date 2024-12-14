import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../../config";

function Moreinfo() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState("");
    const user = auth.currentUser;
  
    let navigate = useNavigate();

    const handleSignin = async (e) => {
      e.preventDefault();

      try {
        await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log('Welcome, ', user.uid);
      navigate("/")

      } catch (err) {
        console.log("Could not validate credentials")
      }

    }
  return (
    <div>
            <div className="page" id="signin-page">
      <div className="signin-container">
        <div className="form-heading">
          <h1 className="form-title">Sign in</h1>
        </div>
        <form id="signin-form" onSubmit={handleSignin}>
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
            If you don't have an account <a href='/signup'>Signup</a>
            <br />
            If you don't remember your password <a href='/forgotpassword'>Forgot Password</a>
          </p>

        <section></section>
      </div>
    </div>
    </div>
  )
}

export default Moreinfo