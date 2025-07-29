import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Trophy,
  BarChart3,
  Plus,
  Settings,
  Bell,
  X,
  Save,
  UserPlus,
} from "lucide-react";
import Dashboard from "../components/Dashboard.jsx";
import Elections from "../components/Elections.jsx";
import Candidates from "../components/Candidates.jsx";
import Reports from "../components/Reports.jsx";
import UserAccount from "../components/UserAccount.jsx";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const BASE = "https://elections-backend-j8m8.onrender.com/api/admin";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalCandidates: 0,
    totalVotes: 0,
    totalUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  const quickActions = [
    { icon: Plus, label: "Create Election", color: "bg-blue-500 hover:bg-blue-600", action: () => openModal("createElection") },
    { icon: Trophy, label: "Add Candidate", color: "bg-green-500 hover:bg-green-600", action: () => openModal("addCandidate") },
    { icon: UserPlus, label: "Create Voter Account", color: "bg-purple-500 hover:bg-purple-600", action: () => openModal("createUser") },
    { icon: BarChart3, label: "View Reports", color: "bg-orange-500 hover:bg-orange-600", action: () => setActiveTab("reports") },
  ];

  useEffect(() => {
    setLoading(true);
    axios.get(`${BASE}/voters`)
      .then(res => setUsers(res.data.voters))
      .catch(() => {})
      .finally(() => setLoading(false));
    axios.get(`${BASE}/election`)
      .then(res => {
        const list = res.data.elections || res.data;
        setElections(list);
        setStats(s => ({
          ...s,
          totalElections: list.length,
          activeElections: list.filter(e => e.status === "active").length,
        }));
      })
      .catch(() => {});
  }, []);

  const openModal = (type, data = null) => {
    setShowModal(type);
    setFormData(data ? { ...data } : {});
    if (type === "editElection") setSelectedElection(data);
    if (type === "editCandidate") setSelectedCandidate(data);
    if (type === "editUser") setSelectedUser(data);
  };
  const closeModal = () => {
    setShowModal(null);
    setSelectedElection(null);
    setSelectedCandidate(null);
    setSelectedUser(null);
    setFormData({});
  };

  const handleCandidateImageUpload = async (candidateId, file) => {
    setImageUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("candidateId", candidateId);
      const resp = await axios.put(
        `${BASE}/candidates/${candidateId}/image`,
        fd
      );
      setCandidates(cs =>
        cs.map(c =>
          c._id === candidateId ? { ...c, image: resp.data.imageUrl } : c
        )
      );
    } catch {}
    setImageUploadLoading(false);
  };

  const handleCreateUser = async () => {
    try {
      const { data } = await axios.post(`${BASE}/create-voter`, {
        name: formData.name,
        email: formData.email,
      });
      setUsers(us => [data.voter, ...us]);
      setRecentActivity(a => [
        { id: Date.now(), type: "user", action: `Voter ${data.voter.name} created`, time: "Just now", status: "success" },
        ...a.slice(0, 4),
      ]);
      closeModal();
    } catch {}
  };

  const handlePromoteUser = async (user) => {
    try {
      const { data } = await axios.post(`${BASE}/promote`, { userId: user._id });
      setUsers(us => us.map(u => u._id === data.user._id ? data.user : u));
      setRecentActivity(a => [
        { id: Date.now(), type: "user", action: `User ${data.user.name} promoted to admin`, time: "Just now", status: "success" },
        ...a.slice(0, 4),
      ]);
    } catch {}
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${BASE}/users/${id}`);
      setUsers(us => us.filter(u => u._id !== id));
      setRecentActivity(a => [
        { id: Date.now(), type: "user", action: `User deleted`, time: "Just now", status: "completed" },
        ...a.slice(0, 4),
      ]);
    } catch {}
  };

  const handleCreateElection = async () => {
    try {
      const { data } = await axios.post(`${BASE}/election`, {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        eligibleVoters: formData.eligibleVoters,
      });
      setElections(es => [data.election, ...es]);
      setRecentActivity(a => [
        { id: Date.now(), type: "election", action: `New election "${data.election.title}" created`, time: "Just now", status: "success" },
        ...a.slice(0, 4),
      ]);
      closeModal();
    } catch {}
  };

  const handleUpdateElection = async () => {
    try {
      const { data } = await axios.put(
        `${BASE}/election/${selectedElection._id}`,
        formData
      );
      setElections(es => es.map(e => e._id === data.election._id ? data.election : e));
      setRecentActivity(a => [
        { id: Date.now(), type: "election", action: `Election "${data.election.title}" updated`, time: "Just now", status: "info" },
        ...a.slice(0, 4),
      ]);
      closeModal();
    } catch {}
  };

  const handleDeleteElection = async (id) => {
    if (!window.confirm("Delete this election?")) return;
    try {
      await axios.delete(`${BASE}/election/${id}`);
      setElections(es => es.filter(e => e._id !== id));
      setRecentActivity(a => [
        { id: Date.now(), type: "election", action: `Election deleted`, time: "Just now", status: "completed" },
        ...a.slice(0, 4),
      ]);
    } catch {}
  };

  const handleAddCandidate = async () => {
    if (!formData.name || !formData.position || !formData.electionId) {
      alert("Please fill in all required fields (Name, Position, Election)");
      return;
    }
    try {
      const { data } = await axios.post(`${BASE}/candidates`, {
        name: formData.name,
        position: formData.position,
        electionId: formData.electionId,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
      });
      setCandidates(cs => [data.candidate, ...cs]);
      setRecentActivity(a => [
        { id: Date.now(), type: "candidate", action: `${data.candidate.name} registered`, time: "Just now", status: "success" },
        ...a.slice(0, 4),
      ]);
      closeModal();
    } catch {
      alert("Error adding candidate");
    }
  };

  const handleUpdateCandidate = async () => {
    try {
      const { data } = await axios.put(
        `${BASE}/candidates/${selectedCandidate._id}`,
        formData
      );
      setCandidates(cs => cs.map(c => c._id === data.candidate._id ? data.candidate : c));
      setRecentActivity(a => [
        { id: Date.now(), type: "candidate", action: `Candidate ${data.candidate.name} updated`, time: "Just now", status: "info" },
        ...a.slice(0, 4),
      ]);
      closeModal();
    } catch {}
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    try {
      await axios.delete(`${BASE}/candidates/${id}`);
      setCandidates(cs => cs.filter(c => c._id !== id));
      setRecentActivity(a => [
        { id: Date.now(), type: "candidate", action: `Candidate removed`, time: "Just now", status: "completed" },
        ...a.slice(0, 4),
      ]);
    } catch {}
  };

  const exportResults = async (format, electionId = null) => {
    try {
      await axios.get(
        `${BASE}/export?format=${format}&election=${electionId || ""}`
      );
      setRecentActivity(a => [
        { id: Date.now(), type: "election", action: `Results exported as ${format.toUpperCase()}`, time: "Just now", status: "info" },
        ...a.slice(0, 4),
      ]);
    } catch {}
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "election": return <Calendar size={16} />;
      case "candidate": return <Trophy size={16} />;
      case "vote": return <BarChart3 size={16} />;
      case "user": return <Users size={16} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {imageUploadLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Uploading image...</span>
          </div>
        </div>
      )}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage elections, candidates, and users.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600"><Bell size={20} /><span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span></button>
            <button className="p-2 text-gray-400 hover:text-gray-600"><Settings size={20} /></button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-6 py-4 flex space-x-8">
          {["dashboard", "elections", "candidates", "users", "reports"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-medium capitalize ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <Dashboard
            stats={stats}
            recentActivity={recentActivity}
            elections={elections}
            quickActions={quickActions}
            getActivityIcon={getActivityIcon}
          />
        )}
        {activeTab === "elections" && (
          <Elections
            elections={elections}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            openModal={openModal}
            handleDeleteElection={handleDeleteElection}
            exportResults={exportResults}
          />
        )}
        {activeTab === "candidates" && (
          <Candidates
            candidates={candidates}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            openModal={openModal}
            handleDeleteCandidate={handleDeleteCandidate}
            onImageUpload={handleCandidateImageUpload}
          />
        )}
        {activeTab === "users" && (
          <UserAccount
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            openModal={openModal}
            onPromote={handlePromoteUser}
            onDelete={handleDeleteUser}
          />
        )}
        {activeTab === "reports" && (
          <Reports
            elections={elections}
            candidates={candidates}
            users={users}
            exportResults={exportResults}
          />
        )}
      </div>
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              {(showModal === "createElection" || showModal === "editElection") && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">{showModal === "createElection" ? "Create New Election" : "Edit Election"}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Election Title</label>
                      <input type="text" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter election title"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" placeholder="Enter election description"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" value={formData.startDate || ""} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" value={formData.endDate || ""} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Voters</label>
                      <input type="number" value={formData.eligibleVoters || ""} onChange={e => setFormData({ ...formData, eligibleVoters: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter number of eligible voters"/>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={showModal === "createElection" ? handleCreateElection : handleUpdateElection} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Save size={16}/>{showModal === "createElection" ? "Create Election" : "Update Election"}</button>
                  </div>
                </div>
              )}
              {(showModal === "addCandidate" || showModal === "editCandidate") && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">{showModal === "addCandidate" ? "Add New Candidate" : "Edit Candidate"}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter candidate's full name"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input type="text" value={formData.position || ""} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus_BORDER_TRANSPARENT" placeholder="President, Vice President, etc."/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Election</label>
                      <select value={formData.electionId || ""} onChange={e => setFormData({ ...formData, electionId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select an election</option>
                        {elections.map(e => (
                          <option key={e._id} value={e._id}>{e.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="candidate@university.edu"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input type="text" value={formData.department || ""} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus_BORDER_TRANSPARENT" placeholder="Computer Science"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="tel" value={formData.phone || ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus_RING_BLUE_500 focus_BORDER_TRANSPARENT" placeholder="+233 24 123 4567"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input type="text" value={formData.year || ""} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus_RING_BLUE_500 focus_BORDER_TRANSPARENT" placeholder="1st Year, 2nd Year, etc."/>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover_BG_GRAY_50">Cancel</button>
                    <button onClick={showModal === "addCandidate" ? handleAddCandidate : handleUpdateCandidate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover-bg-green-700 flex items-center gap-2"><Save size={16}/>{showModal === "addCandidate" ? "Add Candidate" : "Update Candidate"}</button>
                  </div>
                </div>
              )}
              {showModal === "createUser" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Create Voter Account</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus_RING_PURPLE_500 focus_BORDER_TRANSPARENT" placeholder="Enter voter's full name"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                      <input type="email" value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus_RING_PURPLE_500 focus_BORDER_TRANSPARENT" placeholder="Enter email (optional)"/>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover_BG_GRAY_50">Cancel</button>
                    <button onClick={handleCreateUser} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover_BG_PURPLE_700 flex items-center gap-2"><Save size={16}/>Create Voter</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
