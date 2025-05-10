import "./App.css";
import { BrowserRouter, Route, Routes, Router } from "react-router-dom";
import Home from "./pages/Home";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import Moreinfo from "./pages/auth/Moreinfo";
import Forgotpassword from "./pages/auth/Forgotpassword";
import Timetracker from "./pages/time-tracking/Timetracking";
import Clientmanagement from './pages/book-keeping/Clientmanagement';
import AddClientForm from './pages/book-keeping/Addclientform';
import ClientInfo from './pages/book-keeping/ClientInfo';
import FinancesTracker from "./pages/expensetracker/FinancesTracker";
import RevenueTracker from "./pages/revenuetracker/RevenueTracker";
import Invoicing from "./pages/book-keeping/Invoicing";

// Document Drafting Routes
import UploadPDF from "./pages/doc-drafting/upload-pdf/UploadPDF";
import Templates from "./pages/doc-drafting/templates/Templates";
import DocumentLibrary from "./pages/doc-drafting/library/DocumentLibrary";
import EmailViewer from './components/EmailViewer/EmailViewer';



import React, { useEffect } from "react";

function App() {

  useEffect(() => {
    fetch("http://localhost:5000")
      .then((res) => res.text())
      .then((data) => console.log(data));
  }, []);
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/moreinfo" element={<Moreinfo />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/client/:id" element={<ClientInfo />} />
        <Route path="/finances" element={<FinancesTracker />} />
        <Route path="/timetracker" element={<Timetracker />} />
        <Route path="/clientmanagement" element={<Clientmanagement />} />
        <Route path="/addclientform" element={<AddClientForm />} />
        <Route path="/revenuetracker" element={<RevenueTracker />} />
        <Route path="/invoicing" element={<Invoicing />} />

        {/* TEMP */}
        <Route path="/document-drafting" element={<UploadPDF />} />

        
        {/* Document Drafting Routes */}
        {/* <Route path="/uploadpdf" element={<UploadPDF />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/document-library" element={<DocumentLibrary />} />
        <Route path="/email" element={<EmailViewer />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
