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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if client already exists
      const clientRef = doc(db, "clients", formData.emailAddress);
      const clientSnap = await getDoc(clientRef);

      if (clientSnap.exists()) {
        alert("A client with this email already exists.");
        return;
      }

      // Add client data to "clients" collection
      await setDoc(clientRef, {
        clientName: formData.clientName,
        emailAddress: formData.emailAddress,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName,
        websiteUrl: formData.websiteUrl,
        industry: formData.industry,
        budget: formData.budget,
        source: formData.clientSource,
      });

      // Add case data to "cases" collection with status 'open' and client_id
      const caseRef = doc(collection(db, "cases"));

      await setDoc(caseRef, {
        name: formData.caseName,
        type: formData.caseType,
        jurisdiction: formData.jurisdiction,
        case_desc: formData.caseDesc,
        notes: formData.caseNotes,
        status: "open",
        client_id: formData.emailAddress,
        lead_attorney: formData.leadAttorney,
        supportingAttornies: {
          name: formData.attorneyName,
          contact: formData.attorneyContact,
        },
        witnesses: {
          name: formData.witnessName,
          contact: formData.witnessContact,
        },
        court_assigned_case_number: formData.courtNumber || "",
        created_at: new Date(),
      });

      alert("Client and case successfully added!");
      navigate("/");
      closeModal && closeModal();
    } catch (error) {
      console.error("Error adding client and case:", error);
      alert("An error occurred, please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
            <h3>Case Information</h3>

            <div className="form-section-content">
              {/**Case name */}
              <label className="label">
                Case name:
                <input
                  className="fields"
                  type="text"
                  name="caseName"
                  value={formData.caseName}
                  onChange={handleChange}
                  required
                />
              </label>
              {/**Case type */}
              <label className="label">
                Case type:
                <select
                  className="fields"
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
              </label>
            </div>
          </div>

          {/**Case witnesses */}
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
                    value=""
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Witness contact</label>
                  <input
                    className="fields"
                    name="witnessContact"
                    type="text"
                    value=""
                    onChange={handleChange}
                  />
                </div>
              </div>
            </label>
          </label>

          {/**Lead Attorney */}
          <label className="label">
            Lead Attorney:
            <input
              className="fields"
              type="text"
              name="leadAttorney"
              value={formData.leadAttorney}
              onChange={handleChange}
              required
            />
          </label>

          {/**Case Description */}
          <label className="label">
            Case description:
            <textarea
              className="fields"
              name="caseDesc"
              value={formData.caseDesc}
              onChange={handleChange}
            ></textarea>
          </label>

          {/**Supporting Attorneys */}
          <label className="label">
            Supporting Attorneys (if applicable):
            <label className="label">
              <div className="form-section-content">
                <div>
                  <label className="label">Attorney name</label>
                  <input
                    className="fields"
                    name="attorniesName"
                    type="text"
                    value=""
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Attorney contact</label>
                  <input
                    className="fields"
                    name="attorniesContact"
                    type="text"
                    value=""
                    onChange={handleChange}
                  />
                </div>
              </div>
            </label>
          </label>

          {/**Jurisdiction */}
          <label className="label">
            Jurisdiction:
            <input
              className="fields"
              type="text"
              name="jurisdiction"
              value={formData.jurisdiction}
              onChange={handleChange}
              required
            />
          </label>

          {/**Court assigned case number */}
          <label className="label">
            Court assigned case number (if applicable):
            <input
              className="fields"
              type="text"
              name="courtNumber"
              value={formData.courtNumber}
              onChange={handleChange}
              required
            />
          </label>

          {/**Case Notes */}
          <label className="label">
            Case notes:
            <textarea
              className="fields"
              name="caseNotes"
              value={formData.caseNotes}
              onChange={handleChange}
            ></textarea>
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
