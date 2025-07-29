import React from "react";
import { FiEdit, FiTrash, FiImage } from "react-icons/fi";

const Candidates = ({
  candidates,
  searchTerm,
  setSearchTerm,
  openModal,
  handleDeleteCandidate,
  onImageUpload,
}) => {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter candidates safely
  const filteredCandidates = (candidates || []).filter(
    (candidate) =>
      candidate &&
      candidate.name &&
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border p-2 rounded w-full max-w-sm"
        />
        <button
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => openModal("addCandidate")}
        >
          Add Candidate
        </button>
      </div>

      {filteredCandidates.length === 0 ? (
        <p className="text-gray-500">No candidates found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate._id}
              className="border rounded-lg shadow-md p-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                {candidate.image && (
                  <img
                    src={candidate.image}
                    alt={`${candidate.name}'s portrait`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">{candidate.party}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiEdit
                  className="cursor-pointer text-blue-500 hover:scale-110 transition"
                  onClick={() => openModal("editCandidate", candidate)}
                />
                <FiTrash
                  className="cursor-pointer text-red-500 hover:scale-110 transition"
                  onClick={() => handleDeleteCandidate(candidate._id)}
                />
                <FiImage
                  className="cursor-pointer text-green-500 hover:scale-110 transition"
                  onClick={() => openModal("uploadImage", candidate)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;
