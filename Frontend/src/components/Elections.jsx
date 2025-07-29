
import React from 'react';
import {
  Plus,
  Search,
  Download,
  Edit,
  Trash2
} from 'lucide-react';

const Elections = ({
  elections,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  openModal,
  handleDeleteElection,
  exportResults,
  getStatusColor
}) => {
  const filteredElections = elections.filter(election => {
    const matchesSearch =
      election.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      election.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || election.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Elections Management</h2>
        <button
          onClick={() => openModal('createElection')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Create Election
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search elections..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <button
                onClick={() => exportResults('csv')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Election
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredElections.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No elections found
                  </td>
                </tr>
              ) : (
                filteredElections.map(election => (
                  <tr key={election._id || election.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{election.title}</div>
                        <div className="text-sm text-gray-500">{election.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          election.status
                        )}`}
                      >
                        {election.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{new Date(election.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-500">
                        to {new Date(election.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {election.totalVotes} / {election.eligibleVoters} votes
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${
                              election.eligibleVoters > 0
                                ? (election.totalVotes / election.eligibleVoters) * 100
                                : 0
                            }%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {election.eligibleVoters > 0
                          ? ((election.totalVotes / election.eligibleVoters) * 100).toFixed(1)
                          : 0}
                        % turnout
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('editElection', election)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => exportResults('csv', election._id || election.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteElection(election._id || election.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

export default Elections;
