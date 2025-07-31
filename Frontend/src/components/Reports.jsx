import React, { useState } from 'react';
import {
  PieChart,
  BarChart3,
  Download,
  Users2,
  Users,
  Trophy,
  AlertTriangle,
  CheckCircle,
  FileText,
  Crown,
  Award,
  Target,
  Calendar
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://elections-backend-j8m8.onrender.com/api';

const Reports = ({ 
  elections = [], 
  candidates = [], 
  users = [], 
  exportResults, 
  getStatusColor 
}) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [winners, setWinners] = useState({});
  const [exportingStates, setExportingStates] = useState({});

  const setLoading = (electionId, action, state) => {
    setLoadingStates(prev => ({
      ...prev,
      [`${electionId}_${action}`]: state
    }));
  };

  const isLoading = (electionId, action) => {
    return loadingStates[`${electionId}_${action}`] || false;
  };

  // Helper function to get election ID consistently
  const getElectionId = (election) => {
    return election.id || election._id;
  };

  // Helper function to validate election ID
  const validateElectionId = (electionId) => {
    if (!electionId || electionId === 'undefined' || electionId === 'null') {
      throw new Error('Invalid election ID');
    }
    return electionId;
  };

  const handleExportResults = async (electionId, format = 'json') => {
    try {
      // Validate election ID first
      const validElectionId = validateElectionId(electionId);
      const key = `${validElectionId}_${format}`;
      setExportingStates(prev => ({ ...prev, [key]: true }));
      
      const response = await axios.get(
        `${API_BASE_URL}/votes/${validElectionId}/export?format=${format}`,
        { 
          responseType: 'blob',
          headers: {
            'Accept': format === 'json' ? 'application/json' : 
                     format === 'csv' ? 'text/csv' : 'text/plain'
          }
        }
      );

      let blob;
      let fileName;
      let mimeType;

      if (format === 'json') {
        if (response.data instanceof Blob) {
          const text = await response.data.text();
          try {
            const jsonData = JSON.parse(text);
            blob = new Blob([JSON.stringify(jsonData, null, 2)], {
              type: 'application/json'
            });
          } catch {
            blob = new Blob([text], { type: 'application/json' });
          }
        } else {
          blob = new Blob([JSON.stringify(response.data, null, 2)], {
            type: 'application/json'
          });
        }
        fileName = `election_results_${validElectionId}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        blob = response.data instanceof Blob ? response.data : 
               new Blob([response.data], { type: 'text/csv' });
        fileName = `election_results_${validElectionId}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'txt') {
        blob = response.data instanceof Blob ? response.data : 
               new Blob([response.data], { type: 'text/plain' });
        fileName = `election_results_${validElectionId}.txt`;
        mimeType = 'text/plain';
      }

      if (blob.size === 0) {
        throw new Error('No data received from server');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      alert(`Results exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error.message === 'Invalid election ID') {
        errorMessage = 'Invalid election ID. Please try refreshing the page.';
      } else if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Export endpoint not found. Please check if the backend supports this feature.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error occurred while exporting results.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server responded with status ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.message || 'Export failed';
      }
      
      alert(`Error exporting results: ${errorMessage}`);
    } finally {
      const key = `${electionId}_${format}`;
      setExportingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleGetFinalResults = async (electionId) => {
    try {
      const validElectionId = validateElectionId(electionId);
      setLoading(validElectionId, 'final', true);
      
      const response = await axios.get(`${API_BASE_URL}/votes/${validElectionId}/final-results`);
      
      if (response.data.success) {
        setWinners(prev => ({
          ...prev,
          [validElectionId]: response.data
        }));
        alert('Final results loaded successfully!');
      }
    } catch (error) {
      console.error('Get final results error:', error);
      let errorMessage = error.message;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert(`Error loading final results: ${errorMessage}`);
    } finally {
      setLoading(electionId, 'final', false);
    }
  };

  const handleDeclareWinners = async (electionId, confirmDeclaration = false) => {
    try {
      const validElectionId = validateElectionId(electionId);
      setLoading(validElectionId, 'declare', true);
      
      const response = await axios.post(
        `${API_BASE_URL}/votes/${validElectionId}/declare-winners`,
        { confirmDeclaration }
      );
      
      if (response.data.success) {
        if (response.data.requiresConfirmation) {
          const confirmMessage = `
            WARNING: Issues detected before declaring winners:
            
            Clear Winners: ${response.data.summary.clearWinners}
            Tied Positions: ${response.data.summary.tiedPositions}
            Warnings: ${response.data.summary.warningsCount}
            
            Issues:
            ${response.data.warnings.join('\n')}
            
            Do you want to proceed with declaration anyway?
          `;
          
          if (window.confirm(confirmMessage)) {
            await handleDeclareWinners(validElectionId, true);
          }
        } else {
          setWinners(prev => ({
            ...prev,
            [validElectionId]: response.data
          }));
          alert(`Winners declared successfully! ${response.data.summary.clearWinners} position(s) declared.`);
        }
      }
    } catch (error) {
      console.error('Declare winners error:', error);
      let errorMessage = error.message;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert(`Error declaring winners: ${errorMessage}`);
    } finally {
      setLoading(electionId, 'declare', false);
    }
  };

  const handleCheckWinnersDeclaration = async (electionId) => {
    try {
      const validElectionId = validateElectionId(electionId);
      setLoading(validElectionId, 'check', true);
      
      const response = await axios.get(`${API_BASE_URL}/votes/${validElectionId}/winners-declaration`);
      
      if (response.data.success) {
        if (response.data.declared) {
          setWinners(prev => ({
            ...prev,
            [validElectionId]: response.data
          }));
          alert('Winners declaration loaded successfully!');
        } else {
          alert('Winners have not been declared for this election yet.');
        }
      }
    } catch (error) {
      console.error('Check declaration error:', error);
      let errorMessage = error.message;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert(`Error checking declaration: ${errorMessage}`);
    } finally {
      setLoading(electionId, 'check', false);
    }
  };

  const getElectionWinners = (electionId) => {
    return winners[electionId];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <button
          onClick={() => exportResults('csv')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Download size={16} />
          Export All Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart size={20} />
            Voter Turnout by Election
          </h3>
          <div className="space-y-4">
            {elections.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No elections data available</p>
            ) : (
              elections.map((election) => {
                const electionId = getElectionId(election);
                if (!electionId) {
                  console.warn('Election missing ID:', election);
                  return null;
                }
                
                return (
                  <div key={electionId}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{election.title}</span>
                      <span className="text-sm text-gray-500">
                        {election.eligibleVoters > 0 ? ((election.totalVotes / election.eligibleVoters) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${election.eligibleVoters > 0 ? (election.totalVotes / election.eligibleVoters) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {election.totalVotes} of {election.eligibleVoters} eligible voters
                    </div>
                  </div>
                );
              }).filter(Boolean)
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Election Statistics
          </h3>
          <div className="space-y-4">
            {elections.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No elections data available</p>
            ) : (
              elections.map((election) => {
                const electionId = getElectionId(election);
                if (!electionId) {
                  console.warn('Election missing ID:', election);
                  return null;
                }

                return (
                  <div key={electionId} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{election.title}</h4>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(election.status)}`}>
                          {election.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Candidates:</span>
                        <span className="ml-2 font-medium">{election.totalCandidates || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Votes:</span>
                        <span className="ml-2 font-medium">{election.totalVotes || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Eligible Voters:</span>
                        <span className="ml-2 font-medium">{election.eligibleVoters || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleExportResults(electionId, 'json')}
                        disabled={exportingStates[`${electionId}_json`] || !electionId}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Download size={14} />
                        {exportingStates[`${electionId}_json`] ? 'Exporting...' : 'JSON'}
                      </button>
                      <button
                        onClick={() => handleExportResults(electionId, 'csv')}
                        disabled={exportingStates[`${electionId}_csv`] || !electionId}
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FileText size={14} />
                        {exportingStates[`${electionId}_csv`] ? 'Exporting...' : 'CSV'}
                      </button>
                      <button
                        onClick={() => handleExportResults(electionId, 'txt')}
                        disabled={exportingStates[`${electionId}_txt`] || !electionId}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FileText size={14} />
                        {exportingStates[`${electionId}_txt`] ? 'Exporting...' : 'TXT'}
                      </button>
                    </div>
                  </div>
                );
              }).filter(Boolean)
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Crown size={20} />
          Winner Declaration & Final Results
        </h3>
        <div className="space-y-6">
          {elections.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No elections available for winner declaration</p>
          ) : (
            elections.map((election) => {
              const electionId = getElectionId(election);
              if (!electionId) {
                console.warn('Election missing ID:', election);
                return null;
              }

              const electionWinners = getElectionWinners(electionId);
              
              return (
                <div key={electionId} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{election.title}</h4>
                      <p className="text-sm text-gray-600">
                        Status: <span className={`px-2 py-1 rounded text-xs ${getStatusColor(election.status)}`}>
                          {election.status}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Total Votes: {election.totalVotes || 0} | Candidates: {election.totalCandidates || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Election ID: {electionId}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleGetFinalResults(electionId)}
                        disabled={isLoading(electionId, 'final') || !electionId}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <Target size={14} />
                        {isLoading(electionId, 'final') ? 'Loading...' : 'Final Results'}
                      </button>
                      <button
                        onClick={() => handleDeclareWinners(electionId)}
                        disabled={isLoading(electionId, 'declare') || !electionId}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <Crown size={14} />
                        {isLoading(electionId, 'declare') ? 'Declaring...' : 'Declare Winners'}
                      </button>
                      <button
                        onClick={() => handleCheckWinnersDeclaration(electionId)}
                        disabled={isLoading(electionId, 'check') || !electionId}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle size={14} />
                        {isLoading(electionId, 'check') ? 'Checking...' : 'Check Declaration'}
                      </button>
                    </div>
                  </div>

                  {electionWinners && (
                    <div className="mt-4 border-t pt-4">
                      {electionWinners.declared ? (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="font-medium text-green-800">Winners Officially Declared</span>
                            <span className="text-xs text-gray-500">
                              on {new Date(electionWinners.declaration?.declaredAt).toLocaleDateString()}
                            </span>
                          </div>

                          {Object.keys(electionWinners.winners || {}).length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <Award size={16} className="text-yellow-600" />
                                Declared Winners
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(electionWinners.winners).map(([position, winner]) => (
                                  <div key={position} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Trophy size={14} className="text-green-600" />
                                      <span className="font-medium text-green-800">{position}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">{winner.name}</p>
                                    <p className="text-xs text-gray-600">
                                      {winner.votes} votes ({winner.percentage}%)
                                    </p>
                                    {winner.email && (
                                      <p className="text-xs text-gray-600">{winner.email}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {Object.keys(electionWinners.ties || {}).length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-yellow-600" />
                                Tied Positions (Requiring Runoff)
                              </h5>
                              <div className="space-y-3">
                                {Object.entries(electionWinners.ties).map(([position, tie]) => (
                                  <div key={position} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="font-medium text-yellow-800 mb-2">{position}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {tie.candidates.map((candidate, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                          <span className="text-sm text-gray-900">{candidate.name}</span>
                                          <span className="text-xs text-gray-600">
                                            {candidate.votes} votes ({candidate.percentage}%)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {electionWinners.warnings && electionWinners.warnings.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-orange-600" />
                                Warnings
                              </h5>
                              <ul className="space-y-1">
                                {electionWinners.warnings.map((warning, index) => (
                                  <li key={index} className="text-sm text-orange-700 bg-orange-50 px-3 py-1 rounded">
                                    {warning}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar size={16} className="text-blue-600" />
                            <span className="font-medium text-blue-800">Final Results Preview</span>
                          </div>

                          {electionWinners.summary && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                              <h5 className="font-medium text-blue-900 mb-2">Election Summary</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-blue-700">Total Votes:</span>
                                  <span className="ml-1 font-medium">{electionWinners.summary.totalVotes}</span>
                                </div>
                                <div>
                                  <span className="text-blue-700">Unique Voters:</span>
                                  <span className="ml-1 font-medium">{electionWinners.summary.uniqueVoters}</span>
                                </div>
                                <div>
                                  <span className="text-blue-700">Turnout:</span>
                                  <span className="ml-1 font-medium">{electionWinners.summary.turnoutRate}%</span>
                                </div>
                                <div>
                                  <span className="text-blue-700">Positions:</span>
                                  <span className="ml-1 font-medium">{electionWinners.summary.positionsCount}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {electionWinners.winners && Object.keys(electionWinners.winners).length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2">Potential Winners</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(electionWinners.winners).map(([position, winner]) => (
                                  <div key={position} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Trophy size={14} className="text-gray-600" />
                                      <span className="font-medium text-gray-800">{position}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">{winner.name}</p>
                                    <p className="text-xs text-gray-600">
                                      {winner.votes} votes ({winner.percentage}%)
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }).filter(Boolean)
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Elections</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-medium">{elections.filter(e => e.status === 'active').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Upcoming</span>
              <span className="font-medium">{elections.filter(e => e.status === 'upcoming').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium">{elections.filter(e => e.status === 'completed').length}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{elections.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users2 size={20} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Candidates</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Registered</span>
              <span className="font-medium">{candidates.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Votes</span>
              <span className="font-medium">
                {candidates.length > 0 ? Math.round(candidates.reduce((sum, c) => sum + (c.votes || 0), 0) / candidates.length) : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Top Performer</span>
              <span className="font-medium">
                {candidates.length > 0 ? Math.max(...candidates.map(c => c.votes || 0)) : 0} votes
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users size={20} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Users</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Users</span>
              <span className="font-medium">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-medium">{users.filter(u => u.status === 'active').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Voters</span>
              <span className="font-medium">{users.filter(u => u.role === 'voter').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admins</span>
              <span className="font-medium">{users.filter(u => u.role === 'admin').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users2 size={20} />
          Top Performing Candidates
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Election</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No candidates data available
                  </td>
                </tr>
              ) : (
                candidates
                  .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                  .slice(0, 10)
                  .map((candidate, index) => (
                    <tr key={candidate.id || candidate._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">#{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <Users size={16} className="text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-sm text-gray-500">{candidate.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{candidate.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{candidate.electionTitle}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {candidate.votes || 0} votes
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;