import React, { useState, useEffect } from "react";
import Navbar from "../../components/NavBar/NavBar";
import "../../pages/assets/styles/global.css";
import "./book-keeping.css"; // Assuming this exists
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";
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
    budget: "",
    source: "",
    caseName: "",
    caseType: "",
    jurisdiction: "",
    caseDesc: "",
    caseNotes: "",
    leadAttorney: "",
    supportingAttornies: {
      attorneyName: "",
      attorneyContact: "",
    },
    witnesses: {
      witnessName: "",
      witnessContact: "",
    },
  });
  const [caseTypes, setCaseTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // Client Information Validation
    if (!formData.clientName.trim()) {
      tempErrors.clientName = "Client name is required";
      isValid = false;
    }

    if (!formData.emailAddress.trim()) {
      tempErrors.emailAddress = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      tempErrors.emailAddress = "Email is invalid";
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      tempErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
      tempErrors.phoneNumber = "Phone number must be 10 digits";
      isValid = false;
    }

    // Case Information Validation
    if (!formData.caseName.trim()) {
      tempErrors.caseName = "Case name is required";
      isValid = false;
    }

    if (!formData.caseType) {
      tempErrors.caseType = "Case type is required";
      isValid = false;
    }

    if (!formData.jurisdiction.trim()) {
      tempErrors.jurisdiction = "Jurisdiction is required";
      isValid = false;
    }

    if (!formData.leadAttorney.trim()) {
      tempErrors.leadAttorney = "Lead attorney is required";
      isValid = false;
    }

    // Optional field validations
    if (formData.websiteUrl && !/^https?:\/\/.*/.test(formData.websiteUrl)) {
      tempErrors.websiteUrl = "Website URL must start with http:// or https://";
      isValid = false;
    }

    if (formData.budget && isNaN(formData.budget)) {
      tempErrors.budget = "Budget must be a number";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // First validate the form
    const isValid = validateForm();

    if (!isValid) {
      setIsSubmitting(false);
      return; // Stop submission if validation fails
    }

    try {
      // Check if client already exists
      const clientRef = doc(db, "clients", formData.emailAddress);
      const clientSnap = await getDoc(clientRef);

      if (clientSnap.exists()) {
        setErrors({
          ...errors,
          emailAddress: "A client with this email already exists",
        });
        setIsSubmitting(false);
        return;
      }

      // Create client data object
      const clientData = {
        clientName: formData.clientName,
        emailAddress: formData.emailAddress,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName || "",
        websiteUrl: formData.websiteUrl || "",
        industry: formData.industry || "",
        budget: formData.budget || "",
        source: formData.source || "",
      };

      // Create case data object
      const caseData = {
        name: formData.caseName,
        type: formData.caseType,
        jurisdiction: formData.jurisdiction,
        case_desc: formData.caseDesc || "",
        notes: formData.caseNotes || "",
        status: "open",
        client_id: formData.emailAddress,
        lead_attorney: formData.leadAttorney,
        supportingAttornies: {
          name: formData.supportingAttornies.attorneyName || "",
          contact: formData.supportingAttornies.attorneyContact || "",
        },
        witnesses: {
          name: formData.witnesses.witnessName || "",
          contact: formData.witnesses.witnessContact || "",
        },
        court_assigned_case_number: formData.courtNumber || "",
        created_at: new Date(),
      };

      // Transaction to ensure both writes succeed or none do
      await setDoc(clientRef, clientData);
      const caseRef = doc(collection(db, "cases"));
      await setDoc(caseRef, caseData);

      alert("Client and case successfully added!");
      navigate("/");
      closeModal && closeModal();
    } catch (error) {
      console.error("Error adding client and case:", error);
      setErrors({
        submit: "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  useEffect(() => {
    const loadCaseTypes = async () => {
      const querySnapshot = await getDocs(collection(db, "cases-types"));
      const types = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCaseTypes(types);
    };
    loadCaseTypes();
  }, []);

  const handleDemo = () => {
    setFormData({
      clientName: "Jane Doe",
      emailAddress: "jane@doe.com",
      phoneNumber: "4161234567",
      companyName: "Jane Doe Inc.",
      websiteUrl: "https://www.janedoe.com",
      industry: "Food and Beverage",
      budget: "100000",
      source: "Referral",
      caseName: "Jane Doe v. John Doe",
      caseType: 0,
      jurisdiction: "Ontario",
      caseDesc: "Jane Doe is suing John Doe for $100,000",
      caseNotes: "Jane Doe is suing John Doe for $100,000",
      leadAttorney: "John Doe",
      courtNumber: "1234567890",
      supportingAttornies: {
        attorneyName: "Melissa Stephens",
        attorneyContact: "4161234567",
      },
      witnesses: {
        witnessName: "Caleb Smith",
        witnessContact: "5634234567",
      },
    });
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
                  className={`fields ${errors.clientName ? "error" : ""}`}
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                />
                {errors.clientName && (
                  <span className="error-message">{errors.clientName}</span>
                )}
              </label>
              <label className="label">
                Email Address:
                <input
                  className={`fields ${errors.emailAddress ? "error" : ""}`}
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  required
                />
                {errors.emailAddress && (
                  <span className="error-message">{errors.emailAddress}</span>
                )}
              </label>
            </div>

            <div className="form-section">
              <div className="form-section-content">
                <label className="label">
                  Phone Number:
                  <input
                    className={`fields ${errors.phoneNumber ? "error" : ""}`}
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                  {errors.phoneNumber && (
                    <span className="error-message">{errors.phoneNumber}</span>
                  )}
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
                  className={`fields ${errors.websiteUrl ? "error" : ""}`}
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                />
                {errors.websiteUrl && (
                  <span className="error-message">{errors.websiteUrl}</span>
                )}
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
                  className={`fields ${errors.budget ? "error" : ""}`}
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                />
                {errors.budget && (
                  <span className="error-message">{errors.budget}</span>
                )}
              </label>
              <label className="label">
                Client Source:
                <input
                  className="fields"
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Case Information</h3>

            <div className="form-section-content">
              <label className="label">
                Case name:
                <input
                  className={`fields ${errors.caseName ? "error" : ""}`}
                  type="text"
                  name="caseName"
                  value={formData.caseName}
                  onChange={handleChange}
                  required
                />
                {errors.caseName && (
                  <span className="error-message">{errors.caseName}</span>
                )}
              </label>
              <label className="label">
                Case type:
                <select
                  className={`fields ${errors.caseType ? "error" : ""}`}
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select a case type
                  </option>
                  {caseTypes.map((caseType) => (
                    <option key={caseType.id} value={caseType.name}>
                      {caseType.name}
                    </option>
                  ))}
                </select>
                {errors.caseType && (
                  <span className="error-message">{errors.caseType}</span>
                )}
              </label>
            </div>
          </div>

          <label className="label">
            Case witnesses (if applicable):
            <label className="label">
              <div className="form-section-content">
                <div>
                  <label className="label">Witness name </label>
                  <input
                    className="fields"
                    name="witnessName"
                    type="text"
                    value={formData.witnesses.witnessName}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        witnesses: {
                          ...formData.witnesses,
                          witnessName: e.target.value,
                        },
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="label">Witness contact</label>
                  <input
                    className="fields"
                    name="witnessContact"
                    type="text"
                    value={formData.witnesses.witnessContact}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        witnesses: {
                          ...formData.witnesses,
                          witnessContact: e.target.value,
                        },
                      });
                    }}
                  />
                </div>
              </div>
            </label>
          </label>

          <label className="label">
            Lead Attorney:
            <input
              className={`fields ${errors.leadAttorney ? "error" : ""}`}
              type="text"
              name="leadAttorney"
              value={formData.leadAttorney}
              onChange={handleChange}
              required
            />
            {errors.leadAttorney && (
              <span className="error-message">{errors.leadAttorney}</span>
            )}
          </label>

          <label className="label">
            Case description:
            <textarea
              className="fields"
              name="caseDesc"
              value={formData.caseDesc}
              onChange={handleChange}
            ></textarea>
          </label>

          <label className="label">
            Supporting Attorneys (if applicable):
            <label className="label">
              <div className="form-section-content">
                <div>
                  <label className="label">Attorney name</label>
                  <input
                    className="fields"
                    name="attorneyName"
                    type="text"
                    value={formData.supportingAttornies.attorneyName}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        supportingAttornies: {
                          ...formData.supportingAttornies,
                          attorneyName: e.target.value,
                        },
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="label">Attorney contact</label>
                  <input
                    className="fields"
                    name="attorneyContact"
                    type="text"
                    value={formData.supportingAttornies.attorneyContact}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        supportingAttornies: {
                          ...formData.supportingAttornies,
                          attorneyContact: e.target.value,
                        },
                      });
                    }}
                  />
                </div>
              </div>
            </label>
          </label>

          <label className="label">
            Jurisdiction:
            <input
              className={`fields ${errors.jurisdiction ? "error" : ""}`}
              type="text"
              name="jurisdiction"
              value={formData.jurisdiction}
              onChange={handleChange}
              required
            />
            {errors.jurisdiction && (
              <span className="error-message">{errors.jurisdiction}</span>
            )}
          </label>

          <label className="label">
            Court assigned case number (if applicable):
            <input
              className="fields"
              type="text"
              name="courtNumber"
              value={formData.courtNumber}
              onChange={handleChange}
            />
          </label>

          <label className="label">
            Case notes:
            <textarea
              className="fields"
              name="caseNotes"
              value={formData.caseNotes}
              onChange={handleChange}
            ></textarea>
          </label>

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <button
            type="submit"
            className="add-expense-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            className="add-expense-button demo"
            onClick={() => handleDemo()}
          >
            Demo
          </button>
        </form>
      </div>
    </div>
  );
}

export default Addclientform;
