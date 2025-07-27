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
  Download,
  User,
  Trophy,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";

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

const mockCandidates = [
  { _id: "1", name: "Daniel Appiah", position: "President", description: "Dedicated to serving students with integrity and innovation.", electionId: "1", votes: 0 },
  { _id: "2", name: "Sarah Mitchell", position: "Vice President", description: "Committed to transparency and student welfare.", electionId: "1", votes: 0 },
  { _id: "3", name: "Michael Chen", position: "Secretary", description: "Experienced in student governance and communication.", electionId: "1", votes: 0 },
  { _id: "4", name: "Dr. Emma Thompson", position: "Dean", description: "Leading academic excellence for over 15 years.", electionId: "2", votes: 0 },
  { _id: "5", name: "Jennifer Adams", position: "Treasurer", description: "Financial expertise and transparent budgeting.", electionId: "1", votes: 0 },
  { _id: "6", name: "Robert Wilson", position: "Chairman", description: "Bringing fresh perspectives to alumni engagement.", electionId: "3", votes: 156 },
];


const createApiInstance = () => ({
  get: async (url) => {
    await new Promise((res) => setTimeout(res, 500));
    if (url.endsWith("/users") || url === "/users") {
      return { data: { users: [...mockUsers] } };
    }
    if (url.endsWith("/elections") || url === "/elections") {
      return { data: { elections: [...mockElections] } };
    }
    if (url.endsWith("/candidates") || url === "/candidates") {
      return { data: { candidates: [...mockCandidates] } };
    }
    return { data: {} };
  },
  post: async (url, body) => {
    await new Promise((res) => setTimeout(res, 500));
    if (url.endsWith("/candidates") || url === "/candidates") {
      const newCandidate = { ...body, _id: Date.now().toString(), votes: 0 };
      mockCandidates.push(newCandidate);
      return { data: newCandidate };
    }
    return { data: {} };
  },
  delete: async (url) => {
    await new Promise((res) => setTimeout(res, 500));
    if (url.includes("/candidates/")) {
      const id = url.split("/").pop();
      const idx = mockCandidates.findIndex((c) => c._id === id);
      if (idx > -1) mockCandidates.splice(idx, 1);
      return { status: 200 };
    }
    return { status: 404 };
  },
});

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [electionForm, setElectionForm] = useState({ title: "", description: "", startDate: "", endDate: "", status: "upcoming" });
  const [candidateForm, setCandidateForm] = useState({ name: "", position: "President", description: "", electionId: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const api = createApiInstance();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [uRes, eRes, cRes] = await Promise.all([
          api.get("/users"),
          api.get("/elections"),
          api.get("/candidates"),
        ]);
        setUsers(uRes.data?.users || []);
        setElections(eRes.data?.elections || []);
        setCandidates(cRes.data?.candidates || []);
      } catch (err) {
        showMessage("Error loading data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter((p) => ({ ...p, [name]: value }));
  };

  const handleCreateElection = () => {
    if (!electionForm.title || !electionForm.startDate || !electionForm.endDate) {
      return showMessage("Please fill in all required fields", "error");
    }
    const newE = { ...electionForm, _id: Date.now().toString(), totalVotes: 0 };
    setElections((p) => [...p, newE]);
    setElectionForm({ title: "", description: "", startDate: "", endDate: "", status: "upcoming" });
    setShowElectionModal(false);
    showMessage("Election created!", "success");
  };

  const handleCreateCandidate = async () => {
    if (!candidateForm.name || !candidateForm.position || !candidateForm.electionId) {
      return showMessage("Please fill in all required fields", "error");
    }
    setLoading(true);
    try {
      const res = await api.post("/candidates", candidateForm);
      setCandidates((p) => [...p, res.data]);
      setCandidateForm({ name: "", position: "President", description: "", electionId: "" });
      setShowCandidateModal(false);
      showMessage("Candidate added!", "success");
    } catch {
      showMessage("Error adding candidate", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = (id) => {
    setElections((p) => p.filter((e) => e._id !== id));
    setCandidates((p) => p.filter((c) => c.electionId !== id));
    showMessage("Election deleted", "success");
  };

  const handleDeleteCandidate = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/candidates/${id}`);
      setCandidates((p) => p.filter((c) => c._id !== id));
      showMessage("Candidate removed", "success");
    } catch {
      showMessage("Failed to delete candidate", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (st) => {
    switch (st) {
      case "upcoming":
      case "active":
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

  const getStatusIcon = (st) => {
    switch (st) {
      case "upcoming":
      case "active":
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
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-100">Total Elections</p>
              <p className="text-3xl font-bold">{elections.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
          <p className="text-xs text-blue-100 mt-2">
            {elections.filter((e) => ["active","upcoming"].includes(e.status)).length} Active
          </p>
        </div>
  
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-green-100">Total Candidates</p>
              <p className="text-3xl font-bold">{candidates.length}</p>
            </div>
            <Trophy className="w-8 h-8 text-green-200" />
          </div>
          <p className="text-xs text-green-100 mt-2">
            Across {elections.length} elections
          </p>
        </div>
  
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-purple-100">Registered Users</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
          <p className="text-xs text-purple-100 mt-2">
            {users.filter((u) => u.status === "active").length} Active
          </p>
        </div>
       
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-orange-100">Total Votes Cast</p>
              <p className="text-3xl font-bold">
                {elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-200" />
          </div>
          <p className="text-xs text-orange-100 mt-2">
            {candidates.reduce((sum, c) => sum + (c.votes || 0), 0)} Individual
          </p>
        </div>
      </div>

   
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity /> Recent Activity
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <div>
              <p className="text-sm text-gray-900">New election "{elections[0]?.title}" created</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <div>
              <p className="text-sm text-gray-900">
                Candidate "{candidates[0]?.name}" registered for {candidates[0]?.position}
              </p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            <div>
              <p className="text-sm text-gray-900">New user "{users[0]?.name}" registered</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <div>
              <p className="text-sm text-gray-900">
                {mockElections[2].title} completed with {mockElections[2].totalVotes} votes
              </p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderElections = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Elections Management</h2>
          <p className="text-gray-600">Create and manage election campaigns</p>
        </div>
        <button onClick={() => setShowElectionModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus /> New Election
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Election","Duration","Status","Candidates","Votes","Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {elections.map((e) => (
              <tr key={e._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{e.title}</div>
                    <div className="text-sm text-gray-500">{e.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(e.startDate).toLocaleDateString()} to {new Date(e.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${getStatusColor(e.status)}`}>
                    {getStatusIcon(e.status)} {e.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {candidates.filter((c) => c.electionId === e._id).length}
                </td>
                <td className="px-6 py-4 text-sm">{e.totalVotes || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button title="View"><Eye /></button>
                    <button title="Edit"><Edit /></button>
                    <button title="Delete" onClick={() => handleDeleteElection(e._id)}><Trash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Candidates Management</h2>
          <p className="text-gray-600">Manage candidate registrations</p>
        </div>
        <button onClick={() => setShowCandidateModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus /> Add Candidate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((c) => {
          const el = elections.find((e) => e._id === c.electionId);
          return (
            <div key={c._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-blue-600 text-sm">{c.position}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{c.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Election:</span><span className="font-medium">{el?.title || "Unknown"}</span></div>
                  <div className="flex justify-between"><span>Votes:</span><span className="font-semibold">{c.votes || 0}</span></div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2">
                <button title="View"><Eye /></button>
                <button title="Edit"><Edit /></button>
                <button title="Remove" onClick={() => handleDeleteCandidate(c._id)}><Trash2 /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Users Management</h2>
          <p className="text-gray-600">View and manage registered users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["User","Contact","Join Date","Status","Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users
              .filter(
                (u) =>
                  u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-sm text-gray-500">ID: {u._id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2 text-sm">
                    <Mail className="text-gray-400" /> {u.email}
                  </td>
                  <td className="px-6 py-4 text-sm">{new Date(u.joinDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${getStatusColor(u.status)}`}>
                      {getStatusIcon(u.status)} {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2 text-gray-500">
                    <button title="View"><Eye /></button>
                    <button title="Edit"><Edit /></button>
                    <button title="Delete"><Trash2 /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
    
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="text-white" />
            </div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <AlertCircle className="text-gray-400 cursor-pointer" />
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="text-white" />
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <nav className="flex space-x-6 mb-8">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  activeTab === t.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                <Icon /> {t.label}
              </button>
            );
          })}
        </nav>

      
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}

     
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle /> : <XCircle />}
            <span>{message.text}</span>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Create New Election</h3>
              <p className="text-sm text-gray-600">Set up a new election</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={electionForm.title}
                  onChange={(e) => handleInputChange(e, setElectionForm)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Election Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={electionForm.description}
                  onChange={(e) => handleInputChange(e, setElectionForm)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Description (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={electionForm.startDate}
                    onChange={(e) => handleInputChange(e, setElectionForm)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={electionForm.endDate}
                    onChange={(e) => handleInputChange(e, setElectionForm)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={electionForm.status}
                  onChange={(e) => handleInputChange(e, setElectionForm)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowElectionModal(false);
                  setElectionForm({ title: "", description: "", startDate: "", endDate: "", status: "upcoming" });
                }}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button onClick={handleCreateElection} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

     
      {showCandidateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Add New Candidate</h3>
              <p className="text-sm text-gray-600">Register a candidate</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={candidateForm.name}
                  onChange={(e) => handleInputChange(e, setCandidateForm)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  placeholder="Candidate Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  name="position"
                  value={candidateForm.position}
                  onChange={(e) => handleInputChange(e, setCandidateForm)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  placeholder="Position"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={candidateForm.description}
                  onChange={(e) => handleInputChange(e, setCandidateForm)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Description (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Election <span className="text-red-500">*</span>
                </label>
                <select
                  name="electionId"
                  value={candidateForm.electionId}
                  onChange={(e) => handleInputChange(e, setCandidateForm)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Election</option>
                  {elections
                    .filter((el) => el.status !== "completed")
                    .map((el) => (
                      <option key={el._id} value={el._id}>
                        {el.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCandidateModal(false);
                  setCandidateForm({ name: "", position: "President", description: "", electionId: "" });
                }}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button onClick={handleCreateCandidate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
