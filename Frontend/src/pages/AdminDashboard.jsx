import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Eye,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Clock,
  User,
  Trophy,
  TrendingUp,
  Activity
} from "lucide-react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "upcoming",
  });

  const [candidateForm, setCandidateForm] = useState({
    name: "",
    position: "President",
    description: "",
    electionId: "",
  });

  const createApiInstance = () => {
  return {
    get: async (url) => {
      await new Promise((res) => setTimeout(res, 800));
      if (url === "/users") {
        return { data: { users: [...mockUsers] } };
      }
      if (url === "/elections") {
        return { data: { elections: [...mockElections] } };
      }
      if (url === "/candidates") {
        return { data: { candidates: [...mockCandidates] } };
      }
      return { data: {} };
    },
    post: async (url, body) => {
      await new Promise((res) => setTimeout(res, 800));
      if (url === "/candidates") {
        const newCandidate = { ...body, _id: Date.now().toString(), votes: 0 };
        mockCandidates.push(newCandidate);
        return { data: newCandidate };
      }
      return { data: {} };
    },
    delete: async (url) => {
      await new Promise((res) => setTimeout(res, 800));
      const id = url.split("/").pop();
      if (url.startsWith("/candidates/")) {
        const index = mockCandidates.findIndex((c) => c._id === id);
        if (index > -1) mockCandidates.splice(index, 1);
        return { status: 200 };
      }
      return { status: 404 };
    },
  };
};

const mockCandidates = [
  { _id: "1", name: "Daniel Appiah", position: "President", description: "Dedicated to serving students with integrity and innovation.", electionId: "1", votes: 0 },
  { _id: "2", name: "Sarah Mitchell", position: "Vice President", description: "Committed to transparency and student welfare.", electionId: "1", votes: 0 },
  { _id: "3", name: "Michael Chen", position: "Secretary", description: "Experienced in student governance and communication.", electionId: "1", votes: 0 },
  { _id: "4", name: "Dr. Emma Thompson", position: "Dean", description: "Leading academic excellence for over 15 years.", electionId: "2", votes: 0 },
  { _id: "5", name: "Jennifer Adams", position: "Treasurer", description: "Financial expertise and transparent budgeting.", electionId: "1", votes: 0 },
  { _id: "6", name: "Robert Wilson", position: "Chairman", description: "Bringing fresh perspectives to alumni engagement.", electionId: "3", votes: 156 },
];

const mockUsers = [
  { _id: "1", name: "Alice Johnson", email: "alice@example.com", joinDate: "2024-01-15", status: "active" },
  { _id: "2", name: "Bob Smith", email: "bob@example.com", joinDate: "2024-02-20", status: "active" },
  { _id: "3", name: "Carol Davis", email: "carol@example.com", joinDate: "2024-03-10", status: "inactive" },
  { _id: "4", name: "David Wilson", email: "david@example.com", joinDate: "2024-03-25", status: "active" },
  { _id: "5", name: "Emma Thompson", email: "emma@example.com", joinDate: "2024-04-05", status: "active" },
  { _id: "6", name: "Frank Miller", email: "frank@example.com", joinDate: "2024-04-12", status: "inactive" },
];

const mockElections = [
  { _id: "1", title: "SRC 2025 Elections", description: "Election for Student Representative Council executives.", startDate: "2025-09-01", endDate: "2025-09-03", status: "upcoming", totalVotes: 0 },
  { _id: "2", title: "Faculty Board Elections", description: "Annual faculty board member elections.", startDate: "2025-10-15", endDate: "2025-10-17", status: "draft", totalVotes: 0 },
  { _id: "3", title: "Alumni Association Elections", description: "Alumni association leadership elections.", startDate: "2025-08-01", endDate: "2025-08-03", status: "completed", totalVotes: 342 },
  { _id: "4", title: "Sports Committee Elections", description: "University sports committee elections.", startDate: "2025-11-01", endDate: "2025-11-02", status: "upcoming", totalVotes: 0 },
];


  const api = createApiInstance();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, electionsRes, candidatesRes] = await Promise.all([
          api.get("/users"),
          api.get("/elections"),
          api.get("/candidates"),
        ]);
        setUsers(usersRes.data.users);
        setElections(electionsRes.data.elections);
        setCandidates(candidatesRes.data.candidates);
      } catch (error) {
        showMessage("Error loading data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e, formSetter) => {
    const { name, value } = e.target;
    formSetter((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateElection = () => {
    if (!electionForm.title || !electionForm.startDate || !electionForm.endDate) {
      showMessage("Please fill in all required fields", "error");
      return;
    }
    
    const newElection = { 
      ...electionForm, 
      _id: Date.now().toString(),
      totalVotes: 0
    };
    setElections((prev) => [...prev, newElection]);
    setElectionForm({ title: "", description: "", startDate: "", endDate: "", status: "upcoming" });
    setShowElectionModal(false);
    showMessage("Election created successfully!", "success");
  };

  const handleCreateCandidate = async () => {
  if (!candidateForm.name || !candidateForm.position || !candidateForm.electionId) {
    showMessage("Please fill in all required fields", "error");
    return;
  }

  setLoading(true);
  try {
    const response = await api.post("/candidates", candidateForm);
    setCandidates(prev => [...prev, response.data]);
    setCandidateForm({ name: "", position: "President", description: "", electionId: "" });
    setShowCandidateModal(false);
    showMessage("Candidate added successfully!", "success");
  } catch (error) {
    showMessage("Error adding candidate", "error");
  } finally {
    setLoading(false);
  }
};


  const handleDeleteElection = (electionId) => {
    setElections(prev => prev.filter(e => e._id !== electionId));
    setCandidates(prev => prev.filter(c => c.electionId !== electionId));
    showMessage("Election deleted successfully!", "success");
  };

  const handleDeleteCandidate = async (candidateId) => {
  setLoading(true);
  try {
    await api.delete(`/candidates/${candidateId}`);
    setCandidates(prev => prev.filter(c => c._id !== candidateId));
    showMessage("Candidate removed successfully!", "success");
  } catch (error) {
    showMessage("Failed to delete candidate", "error");
  } finally {
    setLoading(false);
  }
};

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(""), 4000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
      case "upcoming":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
      case "upcoming":
        return <CheckCircle size={14} />;
      case "completed":
        return <CheckCircle size={14} />;
      case "draft":
        return <Clock size={14} />;
      case "inactive":
        return <XCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Elections</p>
              <p className="text-3xl font-bold">{elections.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
          <div className="mt-4">
            <p className="text-blue-100 text-xs">
              {elections.filter(e => e.status === 'active' || e.status === 'upcoming').length} Active
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Candidates</p>
              <p className="text-3xl font-bold">{candidates.length}</p>
            </div>
            <Trophy className="w-8 h-8 text-green-200" />
          </div>
          <div className="mt-4">
            <p className="text-green-100 text-xs">
              Across {elections.length} elections
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Registered Users</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
          <div className="mt-4">
            <p className="text-purple-100 text-xs">
              {users.filter(u => u.status === 'active').length} Active users
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Votes Cast</p>
              <p className="text-3xl font-bold">{elections.reduce((sum, e) => sum + e.totalVotes, 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-200" />
          </div>
          <div className="mt-4">
            <p className="text-orange-100 text-xs">
              {candidates.reduce((sum, c) => sum + c.votes, 0)} Individual votes
            </p>
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New election "SRC 2025 Elections" created</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Candidate "Daniel Appiah" registered for President</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New user "Alice Johnson" registered</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Alumni Association Elections completed with 342 votes</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowElectionModal(true)}
              className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900">Create New Election</span>
            </button>
            <button
              onClick={() => setShowCandidateModal(true)}
              className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5 text-green-600" />
              <span className="text-gray-900">Add Candidate</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5 text-purple-600" />
              <span className="text-gray-900">Export Reports</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Connection</span>
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle size={16} />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email Service</span>
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle size={16} />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Backup Status</span>
              <span className="flex items-center gap-1 text-blue-600">
                <Clock size={16} />
                Last: 2h ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderElections = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Elections Management</h2>
          <p className="text-gray-600">Create and manage election campaigns</p>
        </div>
        <button
          onClick={() => setShowElectionModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          New Election
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Election</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {elections.map((election) => (
                <tr key={election._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{election.title}</div>
                      <div className="text-sm text-gray-500">{election.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span>{new Date(election.startDate).toLocaleDateString()}</span>
                      <span className="text-gray-500">to {new Date(election.endDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                      {getStatusIcon(election.status)}
                      {election.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {candidates.filter(c => c.electionId === election._id).length}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {election.totalVotes || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-800 p-1"
                        title="Edit Election"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Election"
                        onClick={() => handleDeleteElection(election._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Candidates Management</h2>
          <p className="text-gray-600">Manage candidate registrations and profiles</p>
        </div>
        <button
          onClick={() => setShowCandidateModal(true)}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Candidate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => {
          const election = elections.find(e => e._id === candidate.electionId);
          return (
            <div key={candidate._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{candidate.position}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{candidate.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Election:</span>
                    <span className="text-gray-900 font-medium">{election?.title || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Votes:</span>
                    <span className="text-blue-600 font-semibold">{candidate.votes || 0}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end gap-2">
                <button 
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="View Profile"
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="text-gray-600 hover:text-gray-800 p-1"
                  title="Edit Candidate"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Remove Candidate"
                  onClick={() => handleDeleteCandidate(candidate._id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-600">View and manage registered users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user._id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Profile"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-800 p-1"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "elections", label: "Elections", icon: Calendar },
    { id: "candidates", label: "Candidates", icon: Trophy },
    { id: "users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
     
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <AlertCircle size={20} />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
     
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

   
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}

      
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {message.text}
          </div>
        )}

       
        {!loading && (
          <>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "elections" && renderElections()}
            {activeTab === "candidates" && renderCandidates()}
            {activeTab === "users" && renderUsers()}
          </>
        )}
      </div>

  
      {showElectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Election</h3>
              <p className="text-sm text-gray-600 mt-1">Set up a new election campaign</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Election Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={electionForm.title}
                  onChange={(e) => handleInputChange(e, setElectionForm)}
                  placeholder="Enter election title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={electionForm.description}
                  onChange={(e) => handleInputChange(e, setElectionForm)}
                  placeholder="Enter election description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={electionForm.startDate}
                    onChange={(e) => handleInputChange(e, setElectionForm)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={electionForm.endDate}
                    onChange={(e) => handleInputChange(e, setElectionForm)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={electionForm.status}
                  onChange={(e) => handleInputChange(e, setElectionForm)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowElectionModal(false);
                  setElectionForm({ title: "", description: "", startDate: "", endDate: "", status: "upcoming" });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateElection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Election
              </button>
            </div>
          </div>
        </div>
      )}

    
      {showCandidateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Candidate</h3>
              <p className="text-sm text-gray-600 mt-1">Register a candidate for an election</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Candidate Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={candidateForm.name}
                  onChange={(e) => handleInputChange(e, setCandidateForm)}
                  placeholder="Enter candidate name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  name="position"
                  value={candidateForm.position}
                  onChange={(e) => handleInputChange(e, setCandidateForm)}
                  placeholder="Enter position (e.g., President, Vice President)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={candidateForm.description}
                  onChange={(e) => handleInputChange(e, setCandidateForm)}
                  placeholder="Enter candidate description or manifesto"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Election <span className="text-red-500">*</span>
                </label>
                <select
                  name="electionId"
                  value={candidateForm.electionId}
                  onChange={(e) => handleInputChange(e, setCandidateForm)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Election</option>
                  {elections.filter(e => e.status !== 'completed').map((election) => (
                    <option key={election._id} value={election._id}>
                      {election.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCandidateModal(false);
                  setCandidateForm({ name: "", position: "President", description: "", electionId: "" });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCandidate}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;