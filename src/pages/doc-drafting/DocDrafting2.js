import React, { useState, useRef } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Navbar from "../../components/NavBar/NavBar";
import dots from "../../images/dots.svg";
import "../assets/styles/DocDrafting.css";
import NoticeOfApplication from "../../components/OntarioForms/NoticeOfApplication";
import NoticeOfAppeal from "../../components/OntarioForms/NoticeOfAppeal";
import SupplimentaryAppeal from "../../components/OntarioForms/SupplimentaryAppeal"

// Sample list of forms
const formsList = [
  {
    title: "Notice of Application",
    fields: ["region", "courtfileno", "applicant", "date", "month", "year", "address"],
    pdfComponent: NoticeOfApplication,
  },
  {
    title: "Notice of Appeal",
    fields: ["region", "courtfileno", "applicant", "judge", "offences", "location", "address", "date"],
    pdfComponent: NoticeOfAppeal,
  },

  {
    title: "Supplementary Notice of Appeal",
    fields: ["region", "courtfileno", "applicant", "date_filed", "additional_grounds", "location", "date"],
    pdfComponent: SupplimentaryAppeal,
  },
  
  // Add more forms as needed
];

function DocDrafting2() {
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({});
  const pdfDownloadRef = useRef(null);

  const handleFormSelect = (e) => {
    const form = formsList.find((f) => f.title === e.target.value);
    setSelectedForm(form);
    setFormData({}); // Reset form data when a new form is selected
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pdfDownloadRef.current) {
      pdfDownloadRef.current.click();
    }
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
          <div className="field-wrap">
            <label className="field-label">Select Document</label>
            <select className="field-input" onChange={handleFormSelect} required>
              <option value="">Select a document</option>
              {formsList.map((form) => (
                <option key={form.title} value={form.title}>
                  {form.title}
                </option>
              ))}
            </select>
          </div>

          {selectedForm &&
            selectedForm.fields.map((field) => (
              <div className="field-wrap" key={field}>
                <label className="field-label">{field}</label>
                <input
                  className="field-input"
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  type="text"
                  placeholder={`Enter ${field}`}
                  required
                />
              </div>
            ))}

          {selectedForm && (
            <>
              <PDFDownloadLink
                document={<selectedForm.pdfComponent formData={formData} />}
                fileName={`${selectedForm.title.replace(/\s+/g, "_")}.pdf`}
              >
                {({ loading, url }) => (
                  <a
                    href={url}
                    download={`${selectedForm.title.replace(/\s+/g, "_")}.pdf`}
                    style={{ display: "none" }}
                    ref={pdfDownloadRef}
                  >
                    Download PDF
                  </a>
                )}
              </PDFDownloadLink>

              <button type="submit" className="form-submit">
                Generate PDF
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default DocDrafting2;
