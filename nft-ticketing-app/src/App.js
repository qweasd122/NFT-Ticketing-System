import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from "./pages/HomePage";
import BuyTicketPage from "./pages/BuyTicketPage";
import InquiryPage from "./pages/InquiryPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/buyticket" element={<BuyTicketPage />} />
        <Route path="/inquiry" element={<InquiryPage />} />
      </Routes>
    </Router>
  );
}

export default App;