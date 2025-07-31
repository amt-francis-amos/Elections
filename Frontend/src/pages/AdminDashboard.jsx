import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Trophy,
  TrendingUp,
  BarChart3,
  Activity,
  ArrowRight,
  CheckCircle,
  Eye,
  Plus,
  Settings,
  Bell,
  Edit,
  Trash2,
  Download,
  UserPlus,
  UserMinus,
  Search,
  X,
  Save,
  PieChart,
  Users2,
  MapPin,
  Mail,
  Phone,
  Upload,
  Camera,
  RefreshCw,
} from "lucide-react";
import Dashboard from "../components/Dashboard.jsx";
import Elections from "../components/Elections.jsx";
import Candidates from "../components/Candidates.jsx";
import Reports from "../components/Reports.jsx";
import UserAccount from "../components/UserAccount.jsx";

const API_BASE_URL = 'https://elections-backend-j8m8.onrender.com/api';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token") || localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

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
  const [refreshing, setRefreshing] = useState(false);

  const isFetching = useRef(false);

  const quickActions = [
    { icon: Plus, label: "Create Election", color: "bg-blue-500 hover:bg-blue-600", action: () => openModal("createElection") },
    { icon: Trophy, label: "Add Candidate", color: "bg-green-500 hover:bg-green-600", action: () => openModal("addCandidate") },
    { icon: UserPlus, label: "Create Voter Account", color: "bg-purple-500 hover:bg-purple-600", action: () => openModal("createUser") },
    { icon: BarChart3, label: "View Reports", color: "bg-orange-500 hover:bg-orange-600", action: () => setActiveTab("reports") },
  ];

  const fetchVoteStats = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/admin/stats`);
    if (data.success) {
      setStats(prev => ({ ...prev, totalVotes: data.stats.totalVotes || 0 }));
    }
  };

  const fetchElections = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/elections`);
    const list = data.elections || data || [];
    const formatted = await Promise.all(list.map(async e => {
      try {
        const res = await axios.get(`${API_BASE_URL}/votes/results/${e._id}`);
        return {
          ...e,
          totalVotes: res.data.results?.totalVotes || 0,
          eligibleVoters: e.eligibleVoters || 0,
          totalCandidates: e.totalCandidates || e.candidatesCount || 0,
          startDate: new Date(e.startDate).toISOString().split('T')[0],
          endDate: new Date(e.endDate).toISOString().split('T')[0],
        };
      } catch {
        return {
          ...e,
          totalVotes: e.totalVotes || 0,
          eligibleVoters: e.eligibleVoters || 0,
          totalCandidates: e.totalCandidates || e.candidatesCount || 0,
          startDate: new Date(e.startDate).toISOString().split('T')[0],
          endDate: new Date(e.endDate).toISOString().split('T')[0],
        };
      }
    }));
    setElections(formatted);
    const activeCount = formatted.filter(e => e.status === 'active' || e.status === 'ongoing' || e.isActive).length;
    const votesSum = formatted.reduce((sum, e) => sum + (e.totalVotes || 0), 0);
    setStats(prev => ({
      ...prev,
      totalElections: formatted.length,
      activeElections: activeCount,
      totalVotes: votesSum,
    }));
  };

  const fetchCandidates = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/candidates`);
    let list = [];
    if (data.success && data.candidates) list = data.candidates;
    else if (data.candidates) list = data.candidates;
    else if (Array.isArray(data)) list = data;
    else if (data.data && Array.isArray(data.data)) list = data.data;
    const formatted = await Promise.all(list.map(async c => {
      try {
        const res = await axios.get(`${API_BASE_URL}/votes/candidate/${c._id || c.id}/count`);
        return { ...c, id: c._id || c.id, votes: res.data.voteCount || c.votes || 0, image: c.image || null };
      } catch {
        return { ...c, id: c._id || c.id, votes: c.votes || 0, image: c.image || null };
      }
    }));
    setCandidates(formatted);
    setStats(prev => ({ ...prev, totalCandidates: formatted.length }));
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/voters`);
    const list = res.data.voters || [];
    setUsers(list);
    setStats(prev => ({ ...prev, totalUsers: list.length }));
  };

  const fetchAllData = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      await fetchElections();
      await fetchCandidates();
      await fetchUsers();
      await fetchVoteStats();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchAllData();
    const id = setInterval(fetchAllData, 120000);
    return () => clearInterval(id);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

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

  const handleCandidateImageUpload = async (id, file) => {
    setImageUploadLoading(true);
    const fd = new FormData();
    fd.append("image", file);
    fd.append("candidateId", id);
    const res = await axios.put(`${API_BASE_URL}/admin/candidates/${id}/image`, fd);
    setCandidates(cs => cs.map(c => (c.id === id ? { ...c, image: res.data.imageUrl } : c)));
    setImageUploadLoading(false);
  };

  const handleCreateUser = async () => {
    const { data } = await axios.post(`${API_BASE_URL}/admin/create-voter`, {
      name: formData.name,
      email: formData.email,
    });
    setUsers(us => [data.voter, ...us]);
    setRecentActivity(a => [{ id: Date.now(), type: "user", action: `Voter ${data.voter.name} created`, time: "Just now", status: "success" }, ...a.slice(0,4)]);
    setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
    closeModal();
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    const userId = selectedUser._id || selectedUser.id;
    const payload = {
      name: formData.name.trim(),
      email: formData.email?.toLowerCase().trim() || selectedUser.email,
      role: formData.role || selectedUser.role
    };
    const { data } = await axios.put(`${API_BASE_URL}/admin/users/${userId}`, payload);
    setUsers(us => us.map(u => (u._id === userId || u.id === userId ? { ...u, ...data.user } : u)));
    setRecentActivity(a => [{ id: Date.now(), type: "user", action: `User "${data.user.name}" updated`, time: "Just now", status: "info" }, ...a.slice(0,4)]);
    closeModal();
  };
  const handlePromoteUser = async user => {
    if (user.role === 'admin') return;
    const { data } = await axios.post(`${API_BASE_URL}/admin/promote`, { userId: user._id || user.id });
    setUsers(us => us.map(u => (u._id === data.user._id ? data.user : u)));
    setRecentActivity(a => [{ id: Date.now(), type: "user", action: `User ${data.user.name} promoted to admin`, time: "Just now", status: "success" }, ...a.slice(0,4)]);
  };

  const handleDeleteUser = async id => {
    const user = users.find(u => u._id === id || u.id === id);
    const userId = user?._id || user?.id || id;
    await axios.delete(`${API_BASE_URL}/admin/users/${userId}`);
    setUsers(us => us.filter(u => u._id !== userId && u.id !== userId));
    setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    setRecentActivity(a => [{ id: Date.now(), type: "user", action: `User "${user?.name}" deleted`, time: "Just now", status: "completed" }, ...a.slice(0,4)]);
  };

  const handleDeleteCandidate = async id => {
    await axios.delete(`${API_BASE_URL}/candidates/${id}`);
    setCandidates(cs => cs.filter(c => c.id !== id));
    setRecentActivity(a => [{ id: Date.now(), type: "candidate", action: `Candidate deleted`, time: "Just now", status: "completed" }, ...a.slice(0,4)]);
    setStats(prev => ({ ...prev, totalCandidates: prev.totalCandidates - 1 }));
    fetchAllData();
  };

  const handleCreateElection = async () => {
    const { data } = await axios.post(`${API_BASE_URL}/admin/elections`, {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      startDate: formData.startDate,
      endDate: formData.endDate,
      eligibleVoters: formData.eligibleVoters ? parseInt(formData.eligibleVoters) : undefined,
    });
    const e = data.election;
    setElections(es => [{ ...e, totalVotes: 0, eligibleVoters: e.eligibleVoters || 0, totalCandidates: e.totalCandidates || e.candidatesCount || 0, startDate: new Date(e.startDate).toISOString().split('T')[0], endDate: new Date(e.endDate).toISOString().split('T')[0] }, ...es]);
    setStats(prev => ({ ...prev, totalElections: prev.totalElections + 1 }));
    setRecentActivity(a => [{ id: Date.now(), type: "election", action: `New election "${e.title}" created`, time: "Just now", status: "success" }, ...a.slice(0,4)]);
    closeModal();
  };

  const handleUpdateElection = async () => {
    if (!selectedElection) return;
    const id = selectedElection._id || selectedElection.id;
    const payload = {};
    if (formData.title && formData.title !== selectedElection.title) payload.title = formData.title.trim();
    if (formData.description !== undefined && formData.description !== selectedElection.description) payload.description = formData.description.trim();
    if (formData.startDate && formData.startDate !== selectedElection.startDate) payload.startDate = formData.startDate;
    if (formData.endDate && formData.endDate !== selectedElection.endDate) payload.endDate = formData.endDate;
    if (formData.eligibleVoters && parseInt(formData.eligibleVoters) !== selectedElection.eligibleVoters) payload.eligibleVoters = parseInt(formData.eligibleVoters);
    const { data } = await axios.put(`${API_BASE_URL}/admin/elections/${id}`, payload);
    const e = data.election;
    setElections(es => es.map(ev => (ev._id === id || ev.id === id ? { ...e, startDate: new Date(e.startDate).toISOString().split('T')[0], endDate: new Date(e.endDate).toISOString().split('T')[0], totalVotes: e.totalVotes || ev.totalVotes || 0, eligibleVoters: e.eligibleVoters || ev.eligibleVoters || 0, totalCandidates: e.totalCandidates || e.candidatesCount || ev.totalCandidates || 0 } : ev)));
    setRecentActivity(a => [{ id: Date.now(), type: "election", action: `Election "${e.title}" updated`, time: "Just now", status: "info" }, ...a.slice(0,4)]);
    closeModal();
  };

  const handleDeleteElection = async id => {
    const e = elections.find(ev => ev._id === id || ev.id === id);
    const eid = e?._id || e?.id || id;
    await axios.delete(`${API_BASE_URL}/admin/elections/${eid}`);
    setElections(es => es.filter(ev => ev._id !== eid && ev.id !== eid));
    setStats(prev => ({ ...prev, totalElections: prev.totalElections - 1 }));
    setRecentActivity(a => [{ id: Date.now(), type: "election", action: `Election "${e?.title}" deleted`, time: "Just now", status: "completed" }, ...a.slice(0,4)]);
    fetchAllData();
  };

  const handleAddCandidate = async () => {
    const payload = {
      name: formData.name,
      position: formData.position,
      electionId: formData.electionId,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      year: formData.year,
    };
    const { data } = await axios.post(`${API_BASE_URL}/candidates`, payload);
    const c = data.candidate;
    const election = elections.find(e => e._id === formData.electionId);
    setCandidates(cs => [{ ...c, id: c._id || c.id, electionTitle: election?.title || "", votes: 0 }, ...cs]);
    setStats(prev => ({ ...prev, totalCandidates: prev.totalCandidates + 1 }));
    setRecentActivity(a => [{ id: Date.now(), type: "candidate", action: `${c.name} registered`, time: "Just now", status: "success" }, ...a.slice(0,4)]);
    closeModal();
    fetchAllData();
  };

  const handleUpdateCandidate = async () => {
    if (!selectedCandidate) return;
    const id = selectedCandidate._id || selectedCandidate.id;
    const payload = {
      name: formData.name.trim(),
      position: formData.position.trim(),
      email: formData.email?.trim() || '',
      phone: formData.phone?.trim() || '',
      department: formData.department?.trim() || '',
      year: formData.year?.trim() || '',
    };
    const { data } = await axios.put(`${API_BASE_URL}/candidates/${id}`, payload);
    setCandidates(cs => cs.map(c => (c._id === id || c.id === id ? { ...c, ...data.candidate } : c)));
    setRecentActivity(a => [{ id: Date.now(), type: "candidate", action: `Candidate "${data.candidate.name}" updated`, time: "Just now", status: "info" }, ...a.slice(0,4)]);
    closeModal();
    fetchAllData();
  };

  const exportResults = format => {
    axios.get(`${API_BASE_URL}/admin/export?format=${format}`);
    setRecentActivity(a => [{ id: Date.now(), type: "election", action: `Results exported as ${format.toUpperCase()}`, time: "Just now", status: "info" }, ...a.slice(0,4)]);
  };

  const getActivityIcon = type => {
    switch (type) {
      case "election": return <Calendar size={16} />;
      case "candidate": return <Trophy size={16} />;
      case "vote":      return <BarChart3 size={16} />;
      case "user":      return <Users size={16} />;
      default:          return <Activity size={16} />;
    }
  };

  const getActivityColor = status => {
    switch (status) {
      case "success":   return "bg-green-100 text-green-800";
      case "info":      return "bg-blue-100 text-blue-800";
      case "completed": return "bg-purple-100 text-purple-800";
      default:          return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case "active":    return "bg-green-100 text-green-800";
      case "upcoming":  return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default:          return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

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
            <button onClick={handleManualRefresh} className={`p-2 text-gray-400 hover:text-gray-600 ${refreshing ? 'animate-spin' : ''}`} disabled={refreshing} title="Refresh data">
              <RefreshCw size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 relative"><Bell size={20} /><span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span></button>
            <button className="p-2 text-gray-400 hover:text-gray-600"><Settings size={20} /></button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-6 py-4 flex space-x-8">
          {["dashboard","elections","candidates","users","reports"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-sm font-medium capitalize ${activeTab===tab?"text-blue-600 border-b-2 border-blue-600":"text-gray-500 hover:text-gray-700"}`}>
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab==="dashboard" && <Dashboard stats={stats} recentActivity={recentActivity} elections={elections} quickActions={quickActions} getActivityIcon={getActivityIcon} getActivityColor={getActivityColor} getStatusColor={getStatusColor} />}
        {activeTab==="elections" && <Elections elections={elections} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterStatus={filterStatus} setFilterStatus={setFilterStatus} openModal={openModal} handleDeleteElection={handleDeleteElection} exportResults={exportResults} getStatusColor={getStatusColor} />}
        {activeTab==="candidates" && <Candidates candidates={candidates} searchTerm={searchTerm} setSearchTerm={setSearchTerm} openModal={openModal} handleDeleteCandidate={handleDeleteCandidate} onImageUpload={handleCandidateImageUpload} elections={elections} />}
        {activeTab==="users" && <UserAccount users={users} searchTerm={searchTerm} setSearchTerm={setSearchTerm} openModal={openModal} onDelete={handleDeleteUser} onPromote={handlePromoteUser} />}
        {activeTab==="reports" && <Reports elections={elections} candidates={candidates} users={users} exportResults={exportResults} getStatusColor={getStatusColor} />}
      </div>
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}>
              {/* modal contents (omitted for brevity; same structure as above) */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
