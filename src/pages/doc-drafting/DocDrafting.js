import React, { useState, useRef } from "react";
import Navbar from "../../components/NavBar/NavBar";
import dots from "../../images/dots.svg";
import "../assets/styles/DocDrafting.css";
import CreatePdf from "../../components/CreatePdf/CreatePdf";
import { PDFDownloadLink } from "@react-pdf/renderer";

function DocDrafting() {
  const [formData, setFormData] = useState({
    region: "",
    courtfileno: "",
    businessName: "",
    applicant: "",
    weekDay: "",
    date: "",
    month: "",
    year: "",
    relief: "",
    reasonOne: "",
    reasonTwo: "",
    reasonThree: "",
    relies: "",
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
      region: "Ontario",
      courtfileno: "4588457",
      weekDay: "Friday",
      reasonOne: "Lorem Ipsum1",
      reasonTwo: "Lorem Ipsum2",
      reasonThree: "Lorem Ipsum3",
      date: "12",
      month: "June",
      businessName: "Business",
      applicant: "Beter",
      relief: "Lorem Ipsum Relief",
      year: "2025",
      relies: "Lorem Ipsum Relies On",
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
              <label className="field-label">Region</label>
              <input
                className="field-input"
                name="region"
                value={formData.region}
                onChange={handleChange}
                type="text"
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="field-part">
              <label className="field-label">courtfileno</label>
              <input
                className="field-input"
                name="courtfileno"
                value={formData.courtfileno}
                onChange={handleChange}
                type="text"
                placeholder="Enter court file number"
                required
              />
            </div>

          </div>
          
          <div className="field-wrap parts">
          <div className="field-wrap">
              <label className="field-label">Applicant</label>
              <input
                className="field-input"
                name="applicant"
                value={formData.applicant}
                onChange={handleChange}
                type="text"
                placeholder="Enter applicant name"
                required
              />
            </div>

            <div className="field-wrap">
              <label className="field-label">Week Day</label>
              <input
                className="field-input"
                name="weekDay"
                value={formData.weekDay}
                onChange={handleChange}
                type="text"
                placeholder="Enter Week Day"
                required
              />
            </div>

            <div className="field-wrap">
              <label className="field-label">Date</label>
              <input
                className="field-input"
                name="date"
                value={formData.date}
                onChange={handleChange}
                type="number"
                placeholder="Enter Date"
                required
              />
            </div>

            <div className="field-wrap">
              <label className="field-label">Month</label>
              <input
                className="field-input"
                name="month"
                value={formData.month}
                onChange={handleChange}
                type="text"
                placeholder="Enter Month"
                required
              />
            </div>
          </div>

          <div className="field-wrap">
            <label className="field-label">Year</label>
            <input
              className="field-input"
              name="year"
              value={formData.year}
              onChange={handleChange}
              type="text"
              placeholder="Enter address"
              required
            />
          </div>

          <div className="field-wrap">
            <label className="field-label">Court House Address</label>
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

          <div className="field-wrap">
            <label className="field-label">Relief</label>
            <input
              className="field-input"
              name="relief"
              value={formData.relief}
              onChange={handleChange}
              type="text"
              placeholder="Enter address"
              required
            />
          </div>

          <div className="field-wrap">
            <label className="field-label">Reason One</label>
            <input
              className="field-input"
              name="reasonOne"
              value={formData.reasonOne}
              onChange={handleChange}
              type="text"
              placeholder="Enter address"
              required
            />
          </div>

          <div className="field-wrap">
            <label className="field-label">Reason Two</label>
            <input
              className="field-input"
              name="reasonTwo"
              value={formData.reasonTwo}
              onChange={handleChange}
              type="text"
              placeholder="Enter address"
              required
            />
          </div>

          <div className="field-wrap">
            <label className="field-label">Relies</label>
            <input
              className="field-input"
              name="relies"
              value={formData.relies}
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
