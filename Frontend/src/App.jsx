import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Vote from './pages/Vote';
import Elections from './pages/Elections';
import Candidates from './pages/Candidates';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard'; // ✅ NEW IMPORT

const App = () => (
  <div className="flex flex-col min-h-screen bg-white text-gray-900">
    <Navbar />
    <main className="flex-grow">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/vote/elections" element={<Elections />} />
        <Route path="/vote/candidates" element={<Candidates />} />
        <Route path="/vote/results" element={<Results />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* ✅ NEW ROUTE */}
      </Routes>
    </main>
    <Footer />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  </div>
);

export default App;
