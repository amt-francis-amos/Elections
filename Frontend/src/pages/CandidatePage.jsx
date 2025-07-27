import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const CandidatesPage = () => {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);

  const userToken = localStorage.getItem('userToken');

  // Fetch elections
  const fetchElections = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/elections', {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch elections');
      }

      const data = await response.json();
      setElections(data);
    } catch (error) {
      toast.error('Failed to load elections');
      console.error('Election fetch error:', error);
    }
  };

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/candidates/${selectedElectionId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      toast.error('Failed to load candidates');
      console.error('Candidate fetch error:', error);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      fetchCandidates();
    }
  }, [selectedElectionId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">View Candidates</h1>

      <label className="block mb-4">
        <span className="text-lg font-medium">Select an Election</span>
        <select
          value={selectedElectionId}
          onChange={(e) => setSelectedElectionId(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">-- Choose an election --</option>
          {elections.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
      </label>

      {candidates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {candidates.map((candidate) => (
            <div
              key={candidate._id}
              className="border p-4 rounded shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{candidate.name}</h2>
              <p className="text-gray-600">{candidate.party}</p>
              <p className="mt-2 text-sm text-gray-500">{candidate.description}</p>
            </div>
          ))}
        </div>
      ) : selectedElectionId ? (
        <p className="text-center text-gray-500 mt-6">No candidates found for this election.</p>
      ) : null}
    </div>
  );
};

export default CandidatesPage;
