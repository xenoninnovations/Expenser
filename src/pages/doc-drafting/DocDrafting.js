import React, { useState, useRef } from "react";
import Navbar from "../../components/NavBar/NavBar";
import dots from "../../images/dots.svg";
import "../assets/styles/DocDrafting.css";
import CreatePdf from "../../components/CreatePdf/CreatePdf";
import { PDFDownloadLink } from "@react-pdf/renderer";

function DocDrafting() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",
    address: "",
  });

  const pdfDownloadRef = useRef(null); // Reference for triggering the PDF download

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents page refresh
    if (pdfDownloadRef.current) {
      pdfDownloadRef.current.click(); // Simulates a click on the PDF download link
    }
  };

  const fillDemo = (e) => {
    e.preventDefault();
    setFormData({
      firstName: "John",
      lastName: "Doe",
      businessName: "Canadian Valley",
      email: "john@vally.ca",
      phone: "4165555555",
      address: "123 Valley St., Toronto, ON A1B 2C3",
    });
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="header">
          <h3>Document Drafting</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>
        <form className="form-doc" onSubmit={handleSubmit}>
          <div className="field-wrap parts">
            <div className="field-part">
              <label className="field-label">First Name</label>
              <input
                className="field-input"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                type="text"
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="field-part">
              <label className="field-label">Last Name</label>
              <input
                className="field-input"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          <div className="field-wrap">
            <label className="field-label">Business Name (if applicable)</label>
            <input
              className="field-input"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              type="text"
              placeholder="Business name"
            />
          </div>
          <div className="field-wrap">
            <label className="field-label">Email Address</label>
            <input
              className="field-input"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="field-wrap">
            <label className="field-label">Phone Number</label>
            <input
              className="field-input"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="number"
              placeholder="Enter phone number"
              required
            />
          </div>
          <div className="field-wrap">
            <label className="field-label">Address</label>
            <input
              className="field-input"
              name="address"
              value={formData.address}
              onChange={handleChange}
              type="text"
              placeholder="Enter address"
              required
            />
          </div>

          {/* Invisible PDF Download Link - Clicked when form is submitted */}
          <PDFDownloadLink
            document={<CreatePdf formData={formData} />}
            fileName={`${formData.firstName}_${formData.lastName}_Contract.pdf`}
          >
            {({ loading, url, blob }) => (
              <a
                href={url}
                download={`${formData.firstName}_${formData.lastName}_Contract.pdf`}
                style={{ display: "none" }}
                ref={pdfDownloadRef}
              >
                Download PDF
              </a>
            )}
          </PDFDownloadLink>

          <button type="submit" className="form-submit">
            Submit
          </button>
          <button type="button" className="form-submit" onClick={fillDemo}>
            Demo
          </button>
        </form>
      </div>
    </div>
  );
}

export default DocDrafting;
