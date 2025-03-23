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
import ExpenseTracker from "./pages/expensetracker/ExpenseTracker";
import RevenueTracker from "./pages/revenuetracker/RevenueTracker";
import UploadForm from "./pages/doc-drafting/pdf-upload/pdfupload";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/moreinfo" element={<Moreinfo />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/client/:id" element={<ClientInfo />} />
        <Route path="/expensetracker" element={<ExpenseTracker />} />
        <Route path="/timetracker" element={ <Timetracker /> } />
        <Route path="/clientmanagement" element={ <Clientmanagement /> } />
        <Route path="/addclientform" element={ <AddClientForm /> } />
        <Route path="/revenuetracker" element={<RevenueTracker />} />
        <Route path="/uploadfile" element={<UploadForm />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;