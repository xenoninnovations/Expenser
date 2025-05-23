import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import React, { useEffect, useState } from "react";

// Add error handler for Chrome extension errors
const handleChromeExtensionError = (error) => {
  if (error.message && error.message.includes('runtime.lastError')) {
    return true; // Prevent debugger from pausing
  }
  return false; // Let other errors pause the debugger
};

// Add global error handler
window.addEventListener('error', (event) => {
  if (handleChromeExtensionError(event.error)) {
    event.preventDefault();
  }
});

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        console.log('=== CLIENT: Server Connection ===');
        console.log('Attempting to connect to:', process.env.REACT_APP_API_URL);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/test`);
        const data = await response.json();

        console.log('=== CLIENT: Server Response ===');
        console.log('Status:', response.status);
        console.log('Data:', data);

        setServerStatus('connected');
      } catch (error) {
        console.error('=== CLIENT: Server Connection Error ===');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        setServerStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    checkServerStatus();
  }, []);
  

  if (isLoading) {
    return <LoadingSpinner size="large" text="Initializing application..." />;
  }

  if (serverStatus === 'error') {
    return (
      <div className="server-error">
        <h2>Server Connection Error</h2>
        <p>Unable to connect to the server. Please check if the server is running.</p>
        <button onClick={() => window.location.reload()}>Retry Connection</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/moreinfo" element={<Moreinfo />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          <Route path="/timetracker" element={<Timetracker />} />
          <Route path="/clientmanagement" element={<Clientmanagement />} />
          <Route path="/addclient" element={<AddClientForm />} />
          <Route path="/client/:id" element={<ClientInfo />} />
          <Route path="/expensetracker" element={<ExpenseTracker />} />
          <Route path="/revenuetracker" element={<RevenueTracker />} />

          {/* Document Drafting Routes */}
          <Route path="/document-drafting" element={<UploadPDF />} />
          <Route path="/document-drafting/upload" element={<UploadPDF />} />
          <Route path="/document-drafting/templates" element={<Templates />} />
          <Route path="/document-drafting/library" element={<DocumentLibrary />} />

          {/* Email Routes */}
          <Route path="/emailviewer" element={<EmailViewer />} />

          {/* Catch all route for 404 */}
          <Route path="*" element={
            <div className="not-found">
              <h2>404 - Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
