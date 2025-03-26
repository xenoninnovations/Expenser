import React, { useState, useEffect } from "react";
import Navbar from "../../components/NavBar/NavBar";
import "../../pages/assets/styles/global.css";
import "./book-keeping.css"; // Assuming this exists
import { collection, getDoc, doc, setDoc, getDocs } from "firebase/firestore";
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
    // businessSize: "",
    // servicesRequired: "",
    // budget: "",
    // clientSource: "",
    // preferredCommMethod: "",
    // emailConsent: "",
  });
  const [caseTypes, setCaseTypes] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //clients database
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

  useEffect(() => {
    const loadCaseTypes = async () => {
      try {
        const caseTypesRef = collection(db, "cases-types"); // Reference to "categories" collection
        const querySnapshot = await getDocs(caseTypesRef);

        // Map through documents and set case types state
        const caseTypesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCaseTypes(caseTypesList);
      } catch (error) {
        console.error("Error fetching case types: ", error);
        console.log(caseTypes);
      }
    };

    loadCaseTypes();
  }, []); // Fetch caseTypes on component load

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
            <form>
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
            </form>
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
              type="text"
              name="caseDesc"
              value={formData.caseDesc}
              onChange={handleChange}
            ></textarea>
          </label>
          {/**Supporting Attorneys */}
          <label className="label">
            Supporting Attorneys (if applicable):
            <form>
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
            </form>
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
