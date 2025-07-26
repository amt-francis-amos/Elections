import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Users, Calendar, Eye, BarChart3, Settings, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState("elections");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "upcoming"
  });
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
    description: "",
    electionId: ""
  });

 
  const createApiInstance = () => {
    
    const token = "mock-token";
    
    return {
      get: async (url) => {
       
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (url === "/users") {
          return {
            data: {
              users: [
                { _id: "1", name: "John Doe", email: "john@example.com", role: "voter", createdAt: "2024-01-15" },
                { _id: "2", name: "Jane Admin", email: "jane@example.com", role: "admin", createdAt: "2024-01-10" },
                { _id: "3", name: "Bob Smith", email: "bob@example.com", role: "voter", createdAt: "2024-01-20" }
              ]
            }
          };
        }
        
        if (url === "/elections") {
          return {
            data: {
              elections: [
                {
                  _id: "e1",
                  title: "Presidential Election 2024",
                  description: "Choose the next president",
                  startDate: "2024-11-01",
                  endDate: "2024-11-15",
                  status: "active",
                  totalVotes: 1250,
                  candidatesCount: 3
                },
                {
                  _id: "e2",
                  title: "Local Mayor Election",
                  description: "Elect your local mayor",
                  startDate: "2024-12-01",
                  endDate: "2024-12-10",
                  status: "upcoming",
                  totalVotes: 0,
                  candidatesCount: 2
                }
              ]
            }
          };
        }
        
        if (url.includes("/elections/") && url.includes("/candidates")) {
          return {
            data: {
              candidates: [
                { _id: "c1", name: "Alice Johnson", party: "Democratic Party", description: "Experienced leader", votes: 650, electionId: "e1" },
                { _id: "c2", name: "Bob Wilson", party: "Republican Party", description: "Business background", votes: 600, electionId: "e1" },
                { _id: "c3", name: "Carol Davis", party: "Independent", description: "Community organizer", votes: 0, electionId: "e1" }
              ]
            }
          };
        }
      },
      
      post: async (url, data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { data: { success: true, message: "Operation successful" } };
      },
      
      put: async (url, data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { data: { success: true, message: "Updated successfully" } };
      },
      
      delete: async (url) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { data: { success: true, message: "Deleted successfully" } };
      }
    };
  };

  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const api = createApiInstance();
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (err) {
      setMessage("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      setLoading(true);
      const api = createApiInstance();
      const res = await api.get("/elections");
      setElections(res.data.elections);
    } catch (err) {
      setMessage("Failed to load elections.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async (electionId) => {
    try {
      setLoading(true);
      const api = createApiInstance();
      const res = await api.get(`/elections/${electionId}/candidates`);
      setCandidates(res.data.candidates);
    } catch (err) {
      setMessage("Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  };

  
  const promoteHandler = async (userId) => {
    try {
      const api = createApiInstance();
      await api.post("/admin/promote", { userId });
      setMessage("User promoted successfully!");
      fetchUsers();
    } catch (err) {
      setMessage("Promotion failed.");
    }
  };

  const deleteUserHandler = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const api = createApiInstance();
      await api.delete(`/admin/users/${userId}`);
      setMessage("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      setMessage("Delete failed.");
    }
  };


  const createElection = async (e) => {
    e.preventDefault();
    try {
      const api = createApiInstance();
      await api.post("/elections", electionForm);
      setMessage("Election created successfully!");
      setShowElectionModal(false);
      setElectionForm({ title: "", description: "", startDate: "", endDate: "", status: "upcoming" });
      fetchElections();
    } catch (err) {
      setMessage("Failed to create election.");
    }
  };

  const updateElectionStatus = async (electionId, status) => {
    try {
      const api = createApiInstance();
      await api.put(`/elections/${electionId}/status`, { status });
      setMessage(`Election ${status} successfully!`);
      fetchElections();
    } catch (err) {
      setMessage("Failed to update election status.");
    }
  };

  const deleteElection = async (electionId) => {
    if (!window.confirm("Are you sure you want to delete this election?")) return;
    
    try {
      const api = createApiInstance();
      await api.delete(`/elections/${electionId}`);
      setMessage("Election deleted successfully!");
      fetchElections();
    } catch (err) {
      setMessage("Failed to delete election.");
    }
  };


  const createCandidate = async (e) => {
    e.preventDefault();
    try {
      const api = createApiInstance();
      await api.post(`/elections/${candidateForm.electionId}/candidates`, candidateForm);
      setMessage("Candidate added successfully!");
      setShowCandidateModal(false);
      setCandidateForm({ name: "", party: "", description: "", electionId: "" });
      if (selectedElection) {
        fetchCandidates(selectedElection._id);
      }
    } catch (err) {
      setMessage("Failed to add candidate.");
    }
  };

  const deleteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to remove this candidate?")) return;
    
    try {
      const api = createApiInstance();
      await api.delete(`/candidates/${candidateId}`);
      setMessage("Candidate removed successfully!");
      if (selectedElection) {
        fetchCandidates(selectedElection._id);
      }
    } catch (err) {
      setMessage("Failed to remove candidate.");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchElections();
  }, []);

  const StatusBadge = ({ status }) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage elections, candidates, and users</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Super Admin
              </div>
            </div>
          </div>
        </div>
      </div>

    
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {message}
            <button 
              onClick={() => setMessage("")}
              className="ml-auto text-blue-500 hover:text-blue-700"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: "elections", label: "Elections", icon: Calendar },
              { id: "users", label: "Users", icon: Users },
              { id: "analytics", label: "Analytics", icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-3 py-2 font-medium text-sm rounded-md transition-colors ${
                  activeTab === id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

       
        {activeTab === "elections" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Elections Management</h2>
              <button
                onClick={() => setShowElectionModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Election
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading elections...</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {elections.map((election) => (
                  <div key={election._id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{election.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{election.description}</p>
                        <StatusBadge status={election.status} />
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>Start: {new Date(election.startDate).toLocaleDateString()}</div>
                      <div>End: {new Date(election.endDate).toLocaleDateString()}</div>
                      <div>Candidates: {election.candidatesCount}</div>
                      <div>Total Votes: {election.totalVotes}</div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedElection(election);
                          fetchCandidates(election._id);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        View Candidates
                      </button>
                      
                      <div className="flex space-x-1">
                        {election.status === "upcoming" && (
                          <button
                            onClick={() => updateElectionStatus(election._id, "active")}
                            className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded text-sm transition-colors"
                          >
                            Start
                          </button>
                        )}
                        
                        {election.status === "active" && (
                          <button
                            onClick={() => updateElectionStatus(election._id, "completed")}
                            className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-2 rounded text-sm transition-colors"
                          >
                            End
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteElection(election._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            
            {selectedElection && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    Candidates for {selectedElection.title}
                  </h3>
                  <button
                    onClick={() => {
                      setCandidateForm({ ...candidateForm, electionId: selectedElection._id });
                      setShowCandidateModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Candidate
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {candidates.map((candidate) => (
                    <div key={candidate._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                          <p className="text-sm text-blue-600">{candidate.party}</p>
                        </div>
                        <button
                          onClick={() => deleteCandidate(candidate._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{candidate.description}</p>
                      <div className="text-sm font-medium text-gray-900">
                        Votes: {candidate.votes || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="text-sm text-gray-600">
                Total Users: {users.length}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {user.role !== "admin" && (
                              <button
                                onClick={() => promoteHandler(user._id)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                Promote
                              </button>
                            )}
                            <button
                              onClick={() => deleteUserHandler(user._id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Overview</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Elections</p>
                    <p className="text-2xl font-bold text-gray-900">{elections.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Elections</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {elections.filter(e => e.status === "active").length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Votes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {elections.reduce((sum, e) => sum + e.totalVotes, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Election Status Overview</h3>
              <div className="space-y-4">
                {elections.map((election) => (
                  <div key={election._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{election.title}</h4>
                      <p className="text-sm text-gray-600">
                        {election.totalVotes} votes • {election.candidatesCount} candidates
                      </p>
                    </div>
                    <StatusBadge status={election.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    
      {showElectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Election</h3>
            <form onSubmit={createElection}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Election Title
                  </label>
                  <input
                    type="text"
                    required
                    value={electionForm.title}
                    onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    value={electionForm.description}
                    onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={electionForm.startDate}
                      onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={electionForm.endDate}
                      onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Create Election
                </button>
                <button
                  type="button"
                  onClick={() => setShowElectionModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

  
      {showCandidateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Candidate</h3>
            <form onSubmit={createCandidate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party/Affiliation
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateForm.party}
                    onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    value={candidateForm.description}
                    onChange={(e) => setCandidateForm({ ...candidateForm, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Add Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
                