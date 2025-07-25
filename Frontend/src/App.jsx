import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Vote from './pages/Vote'
import Elections from './pages/Elections'
import Candidates from './pages/Candidates'
import Results from './pages/Results'
import Footer from './components/Footer'

const App = () => (
  <div className="flex flex-col min-h-screen bg-white text-gray-900">
    <Navbar />
    <main className="flex-grow">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/vote/elections" element={<Elections />} />
        <Route path="/vote/candidates" element={<Candidates />} />
        <Route path="/vote/results" element={<Results />} />
      </Routes>
    </main>
    <Footer />
  </div>
)

export default App
