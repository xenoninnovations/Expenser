import "./App.css";
import { BrowserRouter, Route, Routes, Router } from "react-router-dom";
import Home from "./pages/Home";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import Moreinfo from "./pages/auth/Moreinfo";
import Forgotpassword from "./pages/auth/Forgotpassword";
import ExpenseTracker from "./pages/ExpenseTracker";
import IncomeRevenue from "./pages/IncomeRevenue";

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
        <Route path="/incomerevenue" element={<IncomeRevenue />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
