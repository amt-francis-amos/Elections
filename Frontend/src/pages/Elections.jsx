import React from 'react';
import { candidates } from '../assets/assets'


const Elections = () => {
  return (
    <div className="min-h-screen bg-gray-100">
     
      <section className="relative h-[80vh] w-full">
    
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')",
          }}
        ></div>

   
        <div className="absolute inset-0 bg-black opacity-60"></div>

   
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">2025 Elections</h1>
          <p className="text-lg md:text-xl mb-6">
            Make your voice count. Vote for a better tomorrow.
          </p>
        
        </div>
      </section>

      
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Meet the Candidates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white shadow-lg rounded-xl overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-full h-60 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">{candidate.name}</h3>
                <p className="text-gray-600">{candidate.position}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Elections;
