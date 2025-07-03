import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Vote from './pages/Vote'

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vote" element={<Vote />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
