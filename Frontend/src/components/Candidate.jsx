import React from 'react';
import {
  UserPlus,
  Search,
  Edit,
  UserMinus,
  Users,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Candidates = ({ 
  candidates, 
  searchTerm, 
  setSearchTerm, 
  openModal, 
  handleDeleteCandidate 
}) => {
  const filteredCandidates = candidates.filter(candidate => {
    return candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           candidate.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           candidate.electionTitle?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Candidates Management</h2>
        <button
          onClick={() => openModal('addCandidate')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <UserPlus size={20} />
          Add Candidate
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredCandidates.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No candidates found
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-gray-400" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('editCandidate', candidate)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{candidate.position}</p>
                  <p className="text-sm text-gray-600">{candidate.electionTitle}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail size={14} />
                    <span>{candidate.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={14} />
                    <span>{candidate.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} />
                    <span>{candidate.department} • {candidate.year}</span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Votes Received</span>
                      <span className="text-lg font-bold text-blue-600">{candidate.votes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Candidates;