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
          setFormData(caseSnapshot.data());
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
        const caseTypesRef = collection(db, "caseTypes"); // Pass db here correctly
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
      await updateDoc(caseRef, formData);
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
