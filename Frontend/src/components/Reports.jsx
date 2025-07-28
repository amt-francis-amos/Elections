import React from 'react';
import {
  PieChart,
  BarChart3,
  Download,
  Users2,
  Users
} from 'lucide-react';

const Reports = ({ 
  elections = [], 
  candidates = [], 
  users = [], 
  exportResults, 
  getStatusColor 
}) => {
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
              elections.map((election) => (
                <div key={election.id}>
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
              ))
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
              elections.map((election) => (
                <div key={election.id} className="border-l-4 border-blue-500 pl-4">
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
                  
                  <div className="mt-3">
                    <button
                      onClick={() => exportResults('csv', election.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Download size={14} />
                      Export Results
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
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
                    <tr key={candidate.id} className="hover:bg-gray-50">
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