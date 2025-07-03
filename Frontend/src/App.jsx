import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'



const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
     <div className="flex-grow">
       <Routes>
        <Route path='/'  element={<Home />} />
      </Routes>
     </div>
    </div>
  )
}

export default App