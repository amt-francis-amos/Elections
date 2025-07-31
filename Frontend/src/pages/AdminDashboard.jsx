import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Trophy,
  BarChart3,
  Activity,
  Plus,
  X,
  Save,
  Bell,
  Settings,
  RefreshCw,
} from "lucide-react";
import Dashboard from "../components/Dashboard.jsx";
import Elections from "../components/Elections.jsx";
import Candidates from "../components/Candidates.jsx";
import Reports from "../components/Reports.jsx";
import UserAccount from "../components/UserAccount.jsx";

const API_BASE_URL = "https://elections-backend-j8m8.onrender.com/api";

axios.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("userToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

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

  const quickActions = [
    {
      icon: Plus,
      label: "Create Election",
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => openModal("createElection"),
    },
    {
      icon: Trophy,
      label: "Add Candidate",
      color: "bg-green-500 hover:bg-green-600",
      action: () => openModal("addCandidate"),
    },
    {
      icon: Users,
      label: "Create Voter Account",
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => openModal("createUser"),
    },
    {
      icon: BarChart3,
      label: "View Reports",
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => setActiveTab("reports"),
    },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await fetchElections();
      await fetchCandidates();
      await fetchUsers();
      await fetchVoteStats();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteStats = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/admin/stats`);
      setStats((prev) => ({ ...prev, totalVotes: data.stats.totalVotes || 0 }));
    } catch {}
  };

  const fetchElections = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/elections`);
      const electionsData = data.elections || data || [];
      setElections(
        electionsData.map((e) => ({
          ...e,
          totalVotes: e.totalVotes || 0,
          eligibleVoters: e.eligibleVoters || 0,
          totalCandidates: e.totalCandidates || e.candidatesCount || 0,
          startDate: new Date(e.startDate).toISOString().split("T")[0],
          endDate: new Date(e.endDate).toISOString().split("T")[0],
        }))
      );
      const activeCount = electionsData.filter(
        (e) => e.status === "active" || e.status === "ongoing" || e.isActive
      ).length;
      setStats((prev) => ({
        ...prev,
        totalElections: electionsData.length,
        activeElections: activeCount,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/candidates`);
      const candidatesData =
        data.candidates || Array.isArray(data) ? data : data.data || [];
      setCandidates(
        candidatesData.map((c) => ({
          ...c,
          id: c._id || c.id,
          votes: c.votes || 0,
          image: c.image || null,
        }))
      );
      setStats((prev) => ({ ...prev, totalCandidates: candidatesData.length }));
    } catch (err) {
      console.error(err);
      setCandidates([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/voters`);
      const usersData = res.data.voters || [];
      setUsers(usersData);
      setStats((prev) => ({ ...prev, totalUsers: usersData.length }));
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleCandidateImageUpload = async (candidateId, file) => {
    setImageUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const resp = await axios.put(
        `${API_BASE_URL}/admin/candidates/${candidateId}/image`,
        fd
      );
      setCandidates((cs) =>
        cs.map((c) =>
          c.id === candidateId ? { ...c, image: resp.data.imageUrl } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
    setImageUploadLoading(false);
  };

  const handleCreateUser = async () => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/admin/create-voter`, {
        name: formData.name,
        email: formData.email,
      });
      setUsers((us) => [data.voter, ...us]);
      setRecentActivity((a) => [
        {
          id: Date.now(),
          type: "user",
          action: `Voter ${data.voter.name} created`,
          time: "Just now",
          status: "success",
        },
        ...a.slice(0, 4),
      ]);
      setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const userId = selectedUser._id || selectedUser.id;
      const payload = {
        name: formData.name.trim(),
        email: formData.email?.toLowerCase().trim(),
        role: formData.role || selectedUser.role,
      };
      const { data } = await axios.put(
        `${API_BASE_URL}/admin/users/${userId}`,
        payload
      );
      setUsers((prev) =>
        prev.map((u) =>
          (u._id || u.id) === userId ? { ...u, ...data.user } : u
        )
      );
      setRecentActivity((prev) => [
        {
          id: Date.now(),
          type: "user",
          action: `User "${data.user.name}" updated`,
          time: "Just now",
          status: "info",
        },
        ...prev.slice(0, 4),
      ]);
      closeModal();
      alert("User updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const user = users.find((u) => u._id === id || u.id === id);
      const userId = user?._id || user?.id || id;
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
      setStats((prev) => ({
        ...prev,
        totalUsers: Math.max(0, prev.totalUsers - 1),
      }));
      setRecentActivity((prev) => [
        {
          id: Date.now(),
          type: "user",
          action: `User "${user?.name}" deleted`,
          time: "Just now",
          status: "completed",
        },
        ...prev.slice(0, 4),
      ]);
      alert("User deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/candidates/${id}`);
      setCandidates((cs) => cs.filter((c) => c.id !== id));
      setRecentActivity((a) => [
        {
          id: Date.now(),
          type: "candidate",
          action: `Candidate deleted`,
          time: "Just now",
          status: "completed",
        },
        ...a.slice(0, 4),
      ]);
      setStats((prev) => ({
        ...prev,
        totalCandidates: Math.max(0, prev.totalCandidates - 1),
      }));
      await fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleCreateElection = async () => {
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        startDate: formData.startDate,
        endDate: formData.endDate,
        eligibleVoters: formData.eligibleVoters
          ? parseInt(formData.eligibleVoters)
          : undefined,
      };
      const { data } = await axios.post(
        `${API_BASE_URL}/admin/elections`,
        payload
      );
      const newElection = data.election;
      setElections((prev) => [
        {
          ...newElection,
          totalVotes: newElection.totalVotes || 0,
          eligibleVoters: newElection.eligibleVoters || 0,
          totalCandidates:
            newElection.totalCandidates || newElection.candidatesCount || 0,
          startDate: new Date(newElection.startDate)
            .toISOString()
            .split("T")[0],
          endDate: new Date(newElection.endDate).toISOString().split("T")[0],
        },
        ...prev,
      ]);
      setStats((prev) => ({
        ...prev,
        totalElections: prev.totalElections + 1,
        activeElections:
          newElection.isActive ||
          newElection.status === "active" ||
          newElection.status === "ongoing"
            ? prev.activeElections + 1
            : prev.activeElections,
      }));
      setRecentActivity((prev) => [
        {
          id: Date.now(),
          type: "election",
          action: `New election "${newElection.title}" created`,
          time: "Just now",
          status: "success",
        },
        ...prev.slice(0, 4),
      ]);
      closeModal();
      alert("Election created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateElection = async () => {
    if (!selectedElection) return;
    try {
      const electionId = selectedElection._id || selectedElection.id;
      const payload = {};
      if (formData.title && formData.title !== selectedElection.title)
        payload.title = formData.title.trim();
      if (
        formData.description !== undefined &&
        formData.description !== selectedElection.description
      )
        payload.description = formData.description.trim();
      if (
        formData.startDate &&
        formData.startDate !== selectedElection.startDate
      )
        payload.startDate = formData.startDate;
      if (formData.endDate && formData.endDate !== selectedElection.endDate)
        payload.endDate = formData.endDate;
      if (
        formData.eligibleVoters &&
        parseInt(formData.eligibleVoters) !== selectedElection.eligibleVoters
      )
        payload.eligibleVoters = parseInt(formData.eligibleVoters);
      const { data } = await axios.put(
        `${API_BASE_URL}/admin/elections/${electionId}`,
        payload
      );
      const updatedElection = data.election;
      setElections((prev) =>
        prev.map((e) =>
          (e._id || e.id) === electionId
            ? {
                ...updatedElection,
                startDate: new Date(updatedElection.startDate)
                  .toISOString()
                  .split("T")[0],
                endDate: new Date(updatedElection.endDate)
                  .toISOString()
                  .split("T")[0],
                totalVotes: updatedElection.totalVotes || e.totalVotes || 0,
                eligibleVoters:
                  updatedElection.eligibleVoters || e.eligibleVoters || 0,
                totalCandidates:
                  updatedElection.totalCandidates ||
                  updatedElection.candidatesCount ||
                  e.totalCandidates ||
                  0,
              }
            : e
        )
      );
      setRecentActivity((prev) => [
        {
          id: Date.now(),
          type: "election",
          action: `Election "${updatedElection.title}" updated`,
          time: "Just now",
          status: "info",
        },
        ...prev.slice(0, 4),
      ]);
      closeModal();
      alert("Election updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteElection = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const election = elections.find((e) => (e._id || e.id) === id);
      const electionId = election?._id || election.id || id;
      await axios.delete(`${API_BASE_URL}/admin/elections/${electionId}`);
      setElections((prev) =>
        prev.filter((e) => (e._id || e.id) !== electionId)
      );
      setStats((prev) => ({
        ...prev,
        totalElections: Math.max(0, prev.totalElections - 1),
        activeElections:
          election &&
          (election.isActive ||
            election.status === "active" ||
            election.status === "ongoing")
            ? Math.max(0, prev.activeElections - 1)
            : prev.activeElections,
      }));
      setRecentActivity((prev) => [
        {
          id: Date.now(),
          type: "election",
          action: `Election "${election?.title}" deleted`,
          time: "Just now",
          status: "completed",
        },
        ...prev.slice(0, 4),
      ]);
      alert("Election deleted successfully!");
      await fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAddCandidate = async () => {
    try {
      const selected = elections.find((e) => e._id === formData.electionId);
      const payload = {
        name: formData.name,
        position: formData.position,
        electionId: selected._id,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
      };
      const { data } = await axios.post(`${API_BASE_URL}/candidates`, payload);
      const newCandidate = {
        ...data.candidate,
        id: data.candidate._id || data.candidate.id,
        electionTitle: selected.title,
        votes: 0,
      };
      setCandidates((cs) => [newCandidate, ...cs]);
      setStats((prev) => ({
        ...prev,
        totalCandidates: prev.totalCandidates + 1,
      }));
      setRecentActivity((a) => [
        {
          id: Date.now(),
          type: "candidate",
          action: `${newCandidate.name} registered`,
          time: "Just now",
          status: "success",
        },
        ...a.slice(0, 4),
      ]);
      closeModal();
      alert("Candidate added successfully!");
      await fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateCandidate = async () => {
    if (!selectedCandidate) return;
    try {
      const candidateId = selectedCandidate._id || selectedCandidate.id;
      const payload = {
        name: formData.name.trim(),
        position: formData.position.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim(),
        department: formData.department?.trim(),
        year: formData.year?.trim(),
      };
      const { data } = await axios.put(
        `${API_BASE_URL}/candidates/${candidateId}`,
        payload
      );
      setCandidates((prev) =>
        prev.map((c) =>
          (c._id || c.id) === candidateId
            ? { ...c, ...data.candidate, id: c.id || c._id }
            : c
        )
      );
      setRecentActivity((prev) => [
        {
          id: Date.now(),
          type: "candidate",
          action: `Candidate "${data.candidate.name}" updated`,
          time: "Just now",
          status: "info",
        },
        ...prev.slice(0, 4),
      ]);
      closeModal();
      alert("Candidate updated successfully!");
      await fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const exportResults = async (format, electionId = null) => {
    try {
      await axios.get(
        `${API_BASE_URL}/admin/export?format=${format}&election=${
          electionId || ""
        }`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "election":
        return <Calendar size={16} />;
      case "candidate":
        return <Trophy size={16} />;
      case "vote":
        return <BarChart3 size={16} />;
      case "user":
        return <Users size={16} />;
    }
    return <Activity size={16} />;
  };

  const getActivityColor = (status) =>
    status === "success"
      ? "bg-green-100 text-green-800"
      : status === "info"
      ? "bg-blue-100 text-blue-800"
      : status === "completed"
      ? "bg-purple-100 text-purple-800"
      : "bg-gray-100 text-gray-800";
  const getStatusColor = (status) =>
    status === "active"
      ? "bg-green-100 text-green-800"
      : status === "upcoming"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {imageUploadLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            <span className="text-gray-700">Uploading image...</span>
          </div>
        </div>
      )}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage elections, candidates, and users.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleManualRefresh}
              className={`p-2 text-gray-400 hover:text-gray-600 ${
                refreshing ? "animate-spin" : ""
              }`}
            >
              <RefreshCw size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings size={20} />
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-6 py-4 flex space-x-8">
          {
            ("dashboard",
            "elections",
            "candidates",
            "users",
            "reports".split(",").map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            )))
          }
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
            getActivityColor={getActivityColor}
            getStatusColor={getStatusColor}
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
            getStatusColor={getStatusColor}
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
            elections={elections}
          />
        )}
        {activeTab === "users" && (
          <UserAccount
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            openModal={openModal}
            onDelete={handleDeleteUser}
            onPromote={() => {}}
          />
        )}
        {activeTab === "reports" && (
          <Reports
            elections={elections}
            candidates={candidates}
            users={users}
            exportResults={exportResults}
            getStatusColor={getStatusColor}
          />
        )}
      </div>
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* modal content similar to original, adjusted as needed */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
