import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import "../../pages/assets/styles/RevenueTracker.css";
import { db } from "../../config.js";

function EditCase({ closeModal, caseId, refreshCases }) {
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({
    caseName: "",
    caseType: "",
    jurisdiction: "",
    leadAttorney: "",
  });

  const [caseTypes, setCaseTypes] = useState([]);

  useEffect(() => {
    const loadCase = async () => {
      try {
        const caseRef = doc(db, "cases", caseId);
        const caseSnapshot = await getDoc(caseRef);
        if (caseSnapshot.exists()) {
          const data = caseSnapshot.data();
          setFormData({
            caseName: data.name,
            caseType: data.type,
            jurisdiction: data.jurisdiction,
            caseDesc: data.case_desc,
            caseNotes: data.notes,
            leadAttorney: data.lead_attorney,
            courtNumber: data.court_assigned_case_number,
            supportingAttornies: {
              attorneyName: data.supportingAttornies?.name || "",
              attorneyContact: data.supportingAttornies?.contact || "",
            },
            witnesses: {
              witnessName: data.witnesses?.name || "",
              witnessContact: data.witnesses?.contact || "",
            },
          });
        } else {
          console.error("No such case found!");
        }
      } catch (error) {
        console.error("Error fetching case: ", error);
      }
    };

    loadCase();
  }, [caseId]);

  useEffect(() => {
    const loadCaseTypes = async () => {
      try {
        const caseTypesRef = collection(db, "cases-types"); // Pass db here correctly
        const querySnapshot = await getDocs(caseTypesRef);

        // Map through documents and set categories state
        const caseTypesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Case Type", // Default name if missing
        }));
        setCaseTypes(caseTypesList);
      } catch (error) {
        console.error("Error fetching case types: ", error);
      }
    };

    loadCaseTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const caseRef = doc(db, "cases", caseId);
      // Transform formData to match the database structure
      const updatedData = {
        name: formData.caseName,
        type: formData.caseType,
        jurisdiction: formData.jurisdiction,
        case_desc: formData.caseDesc,
        notes: formData.caseNotes,
        lead_attorney: formData.leadAttorney,
        court_assigned_case_number: formData.courtNumber,
        supportingAttornies: {
          name: formData.supportingAttornies.attorneyName,
          contact: formData.supportingAttornies.attorneyContact,
        },
        witnesses: {
          name: formData.witnesses.witnessName,
          contact: formData.witnesses.witnessContact,
        }
      };

      await updateDoc(caseRef, updatedData);
      console.log("Case updated successfully");

      // Close modal and refresh expenses after submission
      closeModal();
      refreshCases && refreshCases();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Case Information</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section-content">
            <label className="label">
              Case name:
              <input
                className="field"
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
                className="field"
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

          <label className="label">Case witnesses (if applicable):</label>
          <div className="form-section-content">
            <label className="label">
              Witness name
              <input
                className="field"
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
            </label>
            <label className="label">
              Witness contact
              <input
                className="field"
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
            </label>
          </div>

          <label className="label">
            Lead Attorney:
            <input
              className={`field fields ${errors.leadAttorney ? "error" : ""}`}
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
              className="field"
              name="caseDesc"
              value={formData.caseDesc}
              onChange={handleChange}
            ></textarea>
          </label>

          <label className="label">Supporting Attorneys (if applicable):</label>

          <div className="form-section-content">
            <label className="label">
              Attorney name
              <input
                className="field"
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
            </label>
            <label className="label">
              Attorney contact
              <input
                className="field"
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
            </label>
          </div>

          <label className="label">
            Jurisdiction:
            <input
              className={`field fields ${errors.jurisdiction ? "error" : ""}`}
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
              className="field"
              type="text"
              name="courtNumber"
              value={formData.courtNumber}
              onChange={handleChange}
            />
          </label>

          <label className="label">
            Case notes:
            <textarea
              className="field"
              name="caseNotes"
              value={formData.caseNotes}
              onChange={handleChange}
            ></textarea>
          </label>

          <button type="submit" className="modal-button save">
            Save Changes
          </button>
        </form>
        <button className="cancel-button" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
}

export default EditCase;
