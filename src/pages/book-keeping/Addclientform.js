import React, { useState, useEffect } from "react";
import Navbar from "../../components/NavBar/NavBar";
import "../../pages/assets/styles/global.css";
import "../../pages/assets/styles/book-keeping.css";

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
import Modal from "../../components/Modal/Modal";

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
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Canada"
    },
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
    opposingParty: {
      opposingPartyName: "",
      opposingPartyEmailAddress: "",
    },
  });
  const [caseTypes, setCaseTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const checkForConflicts = async (opposingParty) => {
    console.log("Checking conflicts for:", opposingParty);

    if (!opposingParty.opposingPartyEmailAddress) {
      return false;
    }

    try {
      // Check if opposing party exists as a client
      const clientConflictQuery = query(
        collection(db, "clients"),
        where("emailAddress", "==", opposingParty.opposingPartyEmailAddress)
      );
      const clientConflictSnapshot = await getDocs(clientConflictQuery);

      // If we found a conflict, we also need to update the existing client's conflict status
      if (!clientConflictSnapshot.empty) {
        // Update the existing client's conflict status
        const existingClientDoc = clientConflictSnapshot.docs[0];
        await setDoc(doc(db, "clients", existingClientDoc.id), {
          ...existingClientDoc.data(),
          hasConflict: true,
        });
      }

      // Check if opposing party is involved in other cases
      const opposingPartyQuery = query(
        collection(db, "opposing"),
        where(
          "opposingPartyEmailAddress",
          "==",
          opposingParty.opposingPartyEmailAddress
        )
      );
      const opposingPartySnapshot = await getDocs(opposingPartyQuery);

      const hasConflict =
        !clientConflictSnapshot.empty || !opposingPartySnapshot.empty;
      console.log("Has conflict:", hasConflict);

      return hasConflict;
    } catch (error) {
      console.error("Error checking for conflicts:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Check for conflicts first
      const hasConflict = await checkForConflicts(formData.opposingParty);
      console.log("Conflict check result:", hasConflict);

      if (hasConflict) {
        setShowConflictModal(true);
        setPendingSubmission({ hasConflict });
        setIsSubmitting(false);
        return;
      }

      // If no conflict, proceed with submission
      await submitForm(false);
    } catch (error) {
      console.error("Error during submission:", error);
      setErrors({
        submit: "Failed to submit form. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const submitForm = async (hasConflict) => {
    try {
      // Create client data object with conflict flag
      const clientData = {
        clientName: formData.clientName,
        emailAddress: formData.emailAddress,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName || "",
        websiteUrl: formData.websiteUrl || "",
        industry: formData.industry || "",
        budget: formData.budget || "",
        source: formData.source || "",
        address: formData.address,
        hasConflict: hasConflict,
      };

      console.log("Saving client with data:", clientData);

      // Create the client document
      const clientRef = doc(db, "clients", formData.emailAddress);
      await setDoc(clientRef, clientData);

      // Create case with reference to opposing party and conflict status
      const caseRef = doc(collection(db, "cases"));
      const caseData = {
        name: formData.caseName,
        type: formData.caseType,
        jurisdiction: formData.jurisdiction,
        case_desc: formData.caseDesc || "",
        notes: formData.caseNotes || "",
        status: "Open",
        client_id: formData.emailAddress,
        lead_attorney: formData.leadAttorney,
        supportingAttornies: formData.supportingAttornies,
        witnesses: formData.witnesses,
        court_assigned_case_number: formData.courtNumber || "",
        created_at: new Date(),
        has_conflict: hasConflict,
        opposing_party_id: formData.opposingParty.opposingPartyEmailAddress,
        conflict_details: hasConflict
          ? {
              detected_at: new Date(),
              type: "opposing_party_conflict",
              opposing_party_email:
                formData.opposingParty.opposingPartyEmailAddress,
            }
          : null,
      };
      await setDoc(caseRef, caseData);

      // Store opposing party with reference to case and conflict status
      const opposingPartyRef = doc(collection(db, "opposing"));
      const opposingPartyData = {
        opposingPartyName: formData.opposingParty.opposingPartyName,
        opposingPartyEmailAddress:
          formData.opposingParty.opposingPartyEmailAddress,
        case_id: caseRef.id,
        client_id: formData.emailAddress,
        has_conflict: hasConflict,
      };
      await setDoc(opposingPartyRef, opposingPartyData);

      // Instead of navigating immediately, show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error during submission:", error);
      setErrors({
        submit: "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmConflict = async () => {
    setShowConflictModal(false);
    setIsSubmitting(true);
    await submitForm(true);
  };

  const handleCancelConflict = () => {
    setShowConflictModal(false);
    setPendingSubmission(null);
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
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
      clientName: "John Smith",
      emailAddress: "john.smith@example.com",
      phoneNumber: "4161234567",
      companyName: "Smith Enterprises",
      websiteUrl: "https://www.smithenterprises.ca",
      industry: "Technology",
      budget: "50000",
      source: "Referral",
      address: {
        street: "123 King Street West, Suite 100",
        city: "Toronto",
        state: "ON",
        zipCode: "M5H 3T9",
        country: "Canada"
      },
      caseName: "Smith v. Johnson",
      caseType: "Civil",
      jurisdiction: "Ontario Superior Court",
      caseDesc: "Contract dispute",
      caseNotes: "Initial consultation completed",
      leadAttorney: "Jane Wilson",
      courtNumber: "CV-2023-12345",
      supportingAttornies: {
        attorneyName: "Mike Brown",
        attorneyContact: "4169876543",
      },
      witnesses: {
        witnessName: "Sarah Davis",
        witnessContact: "6471234567",
      },
      opposingParty: {
        opposingPartyName: "Robert Johnson",
        opposingPartyEmailAddress: "robert.johnson@example.com",
      },
    });
  };

  const handleOpposingDemo = () => {
    setFormData({
      clientName: "Marie Tremblay",
      emailAddress: "marie.tremblay@example.com",
      phoneNumber: "5149876543",
      companyName: "Tremblay Legal Services",
      websiteUrl: "https://www.tremblaylegal.ca",
      industry: "Legal Services",
      budget: "75000",
      source: "Direct Contact",
      address: {
        street: "456 René-Lévesque Boulevard West, Suite 200",
        city: "Montreal",
        state: "QC",
        zipCode: "H2Z 1A1",
        country: "Canada"
      },
      caseName: "Tremblay v. Dubois",
      caseType: "Civil",
      jurisdiction: "Quebec Superior Court",
      caseDesc: "Property dispute",
      caseNotes: "Settlement negotiations in progress",
      leadAttorney: "Jean-Pierre Bouchard",
      courtNumber: "SC-2023-78901",
      supportingAttornies: {
        attorneyName: "Sophie Lavoie",
        attorneyContact: "5145551234",
      },
      witnesses: {
        witnessName: "Jacques Gagnon",
        witnessContact: "4381234567",
      },
      opposingParty: {
        opposingPartyName: "Pierre Dubois",
        opposingPartyEmailAddress: "pierre.dubois@example.com",
      },
    });
  };

  // Add handler for success modal close
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate(`/client/${formData.emailAddress}`);
    closeModal && closeModal();
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <form onSubmit={handleSubmit} className="clientSubmit">
          {/* Client Basic Information Section */}
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
              
              {/* Address Fields - Updated for Canadian format */}
              <label className="label">
                Street Address:
                <input
                  className="fields"
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main Street, Apt 4B"
                />
              </label>
              <label className="label">
                City:
                <input
                  className="fields"
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </label>
              <label className="label">
                Province/Territory:
                <select
                  className="fields"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                >
                  <option value="">Select Province/Territory</option>
                  <option value="AB">Alberta</option>
                  <option value="BC">British Columbia</option>
                  <option value="MB">Manitoba</option>
                  <option value="NB">New Brunswick</option>
                  <option value="NL">Newfoundland and Labrador</option>
                  <option value="NS">Nova Scotia</option>
                  <option value="NT">Northwest Territories</option>
                  <option value="NU">Nunavut</option>
                  <option value="ON">Ontario</option>
                  <option value="PE">Prince Edward Island</option>
                  <option value="QC">Quebec</option>
                  <option value="SK">Saskatchewan</option>
                  <option value="YT">Yukon</option>
                </select>
              </label>
              <label className="label">
                Postal Code:
                <input
                  className="fields"
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  placeholder="e.g., A1A 1A1"
                  maxLength="7"
                />
              </label>
              <label className="label">
                Country:
                <input
                  className="fields"
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  readOnly
                  disabled
                />
              </label>
            </div>
          </div>

          {/* Client Additional Information Section */}
          <div className="form-section">
            <h3>Additional Client Information</h3>
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

          {/* Case Basic Information Section */}
          <div className="form-section">
            <h3>Case Details</h3>
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
                Court assigned case number:
                <input
                  className="fields"
                  type="text"
                  name="courtNumber"
                  value={formData.courtNumber}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          {/* Case Description Section */}
          <div className="form-section">
            <h3>Case Description</h3>
            <div className="form-section-content">
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
                Case notes:
                <textarea
                  className="fields"
                  name="caseNotes"
                  value={formData.caseNotes}
                  onChange={handleChange}
                ></textarea>
              </label>
            </div>
          </div>

          {/* Attorney Information Section */}
          <div className="form-section">
            <h3>Attorney Information</h3>
            <div className="form-section-content">
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
            </div>

            <h4>Supporting Attorneys</h4>
            <div className="form-section-content">
              <label className="label">
                Attorney name:
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
              </label>
              <label className="label">
                Attorney contact:
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
              </label>
            </div>
          </div>

          {/* Witnesses Section */}
          <div className="form-section">
            <h3>Witnesses</h3>
            <div className="form-section-content">
              <label className="label">
                Witness name:
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
              </label>
              <label className="label">
                Witness contact:
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
              </label>
            </div>
          </div>

          {/* Opposing Party Section */}
          <div className="form-section">
            <h3>Opposing Party Information</h3>
            <div className="form-section-content">
              <label className="label">
                Full Name:
                <input
                  className={`fields ${
                    errors.opposingPartyName ? "error" : ""
                  }`}
                  type="text"
                  name="opposingPartyName"
                  value={formData.opposingParty.opposingPartyName || ""}
                  onChange={handleChange}
                />
                {errors.opposingPartyName && (
                  <span className="error-message">
                    {errors.opposingPartyName}
                  </span>
                )}
              </label>
              <label className="label">
                Email Address:
                <input
                  className="fields"
                  type="text"
                  name="opposingPartyEmailAddress"
                  value={formData.opposingParty.opposingPartyEmailAddress || ""}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <div className="button-container">
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
              Add Client Demo
            </button>
            <button
              type="button"
              className="add-expense-button demo"
              onClick={() => handleOpposingDemo()}
            >
              Add Opposing Party Demo
            </button>
          </div>
        </form>
      </div>

      {/* Add success modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Success"
        text="Client and case have been successfully added!"
      >
        <div className="button-group">
          <button className="modal-button save" onClick={handleSuccessClose}>
            Continue
          </button>
        </div>
      </Modal>

      {/* Existing conflict modal */}
      <Modal
        isOpen={showConflictModal}
        onClose={handleCancelConflict}
        title="Conflict Warning"
        text="WARNING: Potential conflict detected! This opposing party is either an existing client or involved in another case. Do you want to proceed anyway?"
      >
        <div className="button-group">
          <button className="modal-button del" onClick={handleConfirmConflict}>
            Proceed Anyway
          </button>
          <button className="cancel-button" onClick={handleCancelConflict}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Addclientform;
