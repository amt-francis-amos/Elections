import React from 'react'
import { candidates } from '../assets/assets'


const Vote = () => {
  const handleVote = (candidate) => {
    alert(`You voted for ${candidate.name}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">Vote for Your Leaders</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
              <img src={candidate.image} alt={candidate.name} className="w-full h-56 object-cover" />
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-800">{candidate.name}</h2>
                <p className="text-gray-500 text-sm mb-4">{candidate.position}</p>
                <button
                  onClick={() => handleVote(candidate)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Vote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Vote
