import "./App.css";
import { BrowserRouter, Route, Routes, Router } from "react-router-dom";
import Home from "./pages/Home";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import Moreinfo from "./pages/auth/Moreinfo";
import Forgotpassword from "./pages/auth/Forgotpassword";
import ExpenseTracker from "./pages/ExpenseTracker";
import Timetracker from "./pages/time-tracking/Timetracking";
import Clientmanagement from './pages/book-keeping/Clientmanagement';
import AddClientForm from './pages/book-keeping/Addclientform';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/moreinfo" element={<Moreinfo />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/expensetracker" element={<ExpenseTracker />} />
        <Route path="/timetracker" element={ <Timetracker /> } />
        <Route path="/clientmanagement" element={ <Clientmanagement /> } />
        <Route path="/addclientform" element={ <AddClientForm /> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
