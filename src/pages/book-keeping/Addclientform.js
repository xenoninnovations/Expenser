import React, { useState } from "react";
import Navbar from "../../components/NavBar/NavBar";
import "../../pages/assets/styles/global.css";
import "./book-keeping.css"; // Assuming this exists
import { collection, getDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../../config";
import { useNavigate } from "react-router-dom";

function Addclientform({ closeModal }) {
  let navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: "",
    emailAddress: "",
    phoneNumber: "",
    companyName: "",
    websiteUrl: "",
    industry: "",
    businessSize: "",
    servicesRequired: "",
    budget: "",
    clientSource: "",
    preferredCommMethod: "",
    emailConsent: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const documentRef = doc(db, "clients", formData["emailAddress"]);
      const document = await getDoc(documentRef);
  
      if (document.exists()) {
        alert("A client with this email already exists.");
      } else {
        await setDoc(documentRef, formData);
      }

    } catch (error) {
      console.error("Failed to add client", error);

    } finally {
      navigate("/clientmanagement");
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <form onSubmit={handleSubmit} className="clientSubmit">
          <div className="form-section">
            <h3>Client Information</h3>
            <div className="form-section-content">
              <label className="label">
                Full Name:
                <input
                  className="fields"
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="label">
                Email Address:
                <input
                  className="fields"
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="form-section">
              <div className="form-section-content">
                <label className="label">
                  Phone Number:
                  <input
                    className="fields"
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="label">
                  Company Name:
                  <input
                    className="fields"
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-content">
              <label className="label">
                Website URL:
                <input
                  className="fields"
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                />
              </label>
              <label className="label">
                Industry:
                <input
                  className="fields"
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                />
              </label>
              
            </div>

            

            <div className="form-section-content">
            <label className="label">
                Budget:
                <input
                  className="fields"
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </label>
              <label className="label">
                Client Source:
                <input
                  className="fields"
                  type="text"
                  name="clientSource"
                  value={formData.clientSource}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          <div className="form-section">
          <h3>Business Information</h3>

          <div className="form-section-content">
            <label className="label">
                Business Size:
                <input
                  className="fields"
                  type="text"
                  name="businessSize"
                  value={formData.businessSize}
                  onChange={handleChange}
                />
              </label>
              <label className="label">
                Services Required:
                <textarea
                  className="fields"
                  name="servicesRequired"
                  value={formData.servicesRequired}
                  onChange={handleChange}
                ></textarea>
              </label>
            </div>
          </div>
          <label className="label">
            Preferred Communication Method:
            <select
              className="fields"
              name="preferredCommMethod"
              value={formData.preferredCommMethod}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="Video Call">Video Call</option>
            </select>
          </label>
          <label className="label">
            Email Consent:
            <input
              className="fields"
              type="checkbox"
              name="emailConsent"
              checked={formData.emailConsent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emailConsent: e.target.checked,
                })
              }
            />
          </label>
          <button type="submit" className="add-expense-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Addclientform;
