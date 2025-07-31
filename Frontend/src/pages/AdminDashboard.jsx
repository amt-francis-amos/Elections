import React, { useEffect, useState } from "react";
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

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed. Please log in again.');
    }
    return Promise.reject(error);
  }
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
    { icon: Plus, label: "Create Election", color: "bg-blue-500 hover:bg-blue-600", action: () => openModal("createElection") },
    { icon: Trophy, label: "Add Candidate", color: "bg-green-500 hover:bg-green-600", action: () => openModal("addCandidate") },
    { icon: UserPlus, label: "Create Voter Account", color: "bg-purple-500 hover:bg-purple-600", action: () => openModal("createUser") },
    { icon: BarChart3, label: "View Reports", color: "bg-orange-500 hover:bg-orange-600", action: () => setActiveTab("reports") },
  ];

  useEffect(() => {
    fetchAllData();
    
    const intervalId = setInterval(() => {
      fetchAllData(true); 
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const fetchAllData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    
    try {
      await Promise.all([
        fetchElections(silent),
        fetchCandidates(silent),
        fetchUsers(silent),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const fetchElections = async (silent = false) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/elections`);
      
      if (!silent) {
        console.log("Fetched elections:", data);
      }

      const electionsData = data.elections || data || [];

      const formattedElections = await Promise.all(
        electionsData.map(async (election) => {
          try {
            const voteResponse = await axios.get(`${API_BASE_URL}/votes/results/${election._id}`);
            const totalVotes = voteResponse.data?.results?.totalVotes || 0;
            
            return {
              ...election,
              totalVotes: totalVotes,
              eligibleVoters: election.eligibleVoters || 0,
              totalCandidates: election.totalCandidates || election.candidatesCount || 0,
              startDate: new Date(election.startDate).toISOString().split('T')[0],
              endDate: new Date(election.endDate).toISOString().split('T')[0],
            };
          } catch (voteErr) {
            return {
              ...election,
              totalVotes: election.totalVotes || 0,
              eligibleVoters: election.eligibleVoters || 0,
              totalCandidates: election.totalCandidates || election.candidatesCount || 0,
              startDate: new Date(election.startDate).toISOString().split('T')[0],
              endDate: new Date(election.endDate).toISOString().split('T')[0],
            };
          }
        })
      );

      setElections(formattedElections);

      const activeCount = formattedElections.filter(e => 
        e.status === 'active' || e.status === 'ongoing' || e.isActive
      ).length;

      const totalVotesAcrossElections = formattedElections.reduce(
        (sum, election) => sum + (election.totalVotes || 0), 0
      );

      setStats(prevStats => ({
        ...prevStats,
        totalElections: formattedElections.length,
        activeElections: activeCount,
        totalVotes: totalVotesAcrossElections,
      }));

    } catch (err) {
      if (!silent) {
        console.error("Error fetching elections:", err);
      }
    }
  };

  const fetchCandidates = async (silent = false) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/candidates`);
      
      if (!silent) {
        console.log("Fetched candidates:", data);
      }

      let candidatesData = [];
      
      if (data.success && data.candidates) {
        candidatesData = data.candidates;
      } else if (data.candidates) {
        candidatesData = data.candidates;
      } else if (Array.isArray(data)) {
        candidatesData = data;
      } else if (data.data && Array.isArray(data.data)) {
        candidatesData = data.data;
      }

      const formattedCandidates = await Promise.all(
        candidatesData.map(async (candidate) => {
          try {
            const voteResponse = await axios.get(
              `${API_BASE_URL}/votes/candidate/${candidate._id || candidate.id}/count`
            );
            const realVotes = voteResponse.data?.voteCount || candidate.votes || 0;
            
            return {
              ...candidate,
              id: candidate._id || candidate.id,
              votes: realVotes,
              image: candidate.image || null,
            };
          } catch (voteErr) {
            return {
              ...candidate,
              id: candidate._id || candidate.id,
              votes: candidate.votes || 0,
              image: candidate.image || null,
            };
          }
        })
      );

      setCandidates(formattedCandidates);

      setStats(prevStats => ({
        ...prevStats,
        totalCandidates: formattedCandidates.length,
      }));

    } catch (err) {
      if (!silent) {
        console.error("Error fetching candidates:", err);
        if (err.response?.status === 404) {
          console.error("Candidates endpoint not found. Make sure backend route exists.");
        }
      }
      setCandidates([]);
    }
  };

  const fetchUsers = async (silent = false) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/voters`);
      const usersData = res.data.voters || [];
      
      setUsers(usersData);
      
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: usersData.length,
      }));
    } catch (err) {
      if (!silent) {
        console.error("Error fetching users:", err);
      }
    }
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
      fd.append("candidateId", candidateId);
      const resp = await axios.put(
        `${API_BASE_URL}/admin/candidates/${candidateId}/image`,
        fd
      );
      setCandidates((cs) =>
        cs.map((c) =>
          (c.id === candidateId || c._id === candidateId) ? { ...c, image: resp.data.imageUrl } : c
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/admin/create-voter`,
        { name: formData.name, email: formData.email }
      );
      setUsers((us) => [data.voter, ...us]);
      setRecentActivity((a) => [
        { id: Date.now(), type: "user", action: `Voter ${data.voter.name} created`, time: "Just now", status: "success" },
        ...a.slice(0, 4),
      ]);
      closeModal();
      
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: prevStats.totalUsers + 1,
      }));
    } catch (err) {
      console.error(err);
      alert(`Error creating user: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) {
        alert("No user selected for update");
        return;
      }

      if (!formData.name || formData.name.trim().length < 2) {
        alert("Name must be at least 2 characters long");
        return;
      }

      if (formData.email && formData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          alert("Please provide a valid email address");
          return;
        }

        const existingUser = users.find(u => 
          u.email.toLowerCase() === formData.email.toLowerCase().trim() && 
          (u._id !== selectedUser._id && u.id !== selectedUser._id)
        );
        if (existingUser) {
          alert("Email is already taken by another user");
          return;
        }
      }

      const existingName = users.find(u => 
        u.name.toLowerCase() === formData.name.toLowerCase().trim() && 
        (u._id !== selectedUser._id && u.id !== selectedUser._id)
      );
      if (existingName) {
        alert("Name is already taken by another user");
        return;
      }

      const userId = selectedUser._id || selectedUser.id;
      
      const payload = {
        name: formData.name.trim(),
        email: formData.email ? formData.email.toLowerCase().trim() : selectedUser.email,
        role: formData.role || selectedUser.role
      };

      console.log("Updating user with payload:", payload);

      const { data } = await axios.put(
        `${API_BASE_URL}/admin/users/${userId}`,
        payload
      );

      console.log("User updated successfully:", data);

      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          const currentId = user._id || user.id;
          if (currentId === userId) {
            return {
              ...user,
              ...data.user,
              id: user.id || user._id, 
            };
          }
          return user;
        })
      );

      setRecentActivity((prevActivity) => [
        { 
          id: Date.now(), 
          type: "user", 
          action: `User "${data.user.name}" updated`, 
          time: "Just now", 
          status: "info" 
        },
        ...prevActivity.slice(0, 4),
      ]);

      closeModal();
      alert("User updated successfully!");

    } catch (err) {
      console.error("Error updating user:", err);
      
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert(`Error updating user: ${err.message}`);
      }
    }
  };

  const handlePromoteUser = async (user) => {
    try {
      if (user.role === 'admin') {
        alert("User is already an admin");
        return;
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/admin/promote`,
        { userId: user._id || user.id }
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          const currentId = u._id || u.id;
          const updatedId = data.user._id || data.user.id;
          if (currentId === updatedId) {
            return { ...u, ...data.user };
          }
          return u;
        })
      );

      setRecentActivity((prevActivity) => [
        { 
          id: Date.now(), 
          type: "user", 
          action: `User ${data.user.name} promoted to admin`, 
          time: "Just now", 
          status: "success" 
        },
        ...prevActivity.slice(0, 4),
      ]);

      alert(`${data.user.name} has been promoted to admin!`);

    } catch (err) {
      console.error("Error promoting user:", err);
      alert(`Error promoting user: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const user = users.find((u) => u._id === id || u.id === id);
      const userId = user?._id || user?.id || id;

      console.log("Deleting user with ID:", userId);

      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`);

      setUsers((prevUsers) => 
        prevUsers.filter((u) => u._id !== id && u.id !== id && u._id !== userId && u.id !== userId)
      );

      setStats(prevStats => ({
        ...prevStats,
        totalUsers: Math.max(0, prevStats.totalUsers - 1),
      }));

      setRecentActivity((prevActivity) => [
        { 
          id: Date.now(), 
          type: "user", 
          action: `User "${user?.name || 'Unknown'}" deleted`, 
          time: "Just now", 
          status: "completed" 
        },
        ...prevActivity.slice(0, 4),
      ]);

      alert("User deleted successfully!");

    } catch (err) {
      console.error("Error deleting user:", err);
      
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert(`Error deleting user: ${err.message}`);
      }
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/candidates/${id}`);
      setCandidates((cs) => cs.filter((c) => c.id !== id && c._id !== id));
      setRecentActivity((a) => [
        { id: Date.now(), type: "candidate", action: `Candidate deleted`, time: "Just now", status: "completed" },
        ...a.slice(0, 4),
      ]);
      
      setStats(prevStats => ({
        ...prevStats,
        totalCandidates: Math.max(0, prevStats.totalCandidates - 1),
      }));

      await fetchAllData(true);
    } catch (err) {
      console.error(err);
      alert(`Error deleting candidate: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCreateElection = async () => {
    try {
      if (!formData.title || !formData.startDate || !formData.endDate) {
        alert("Please fill in all required fields: Title, Start Date, and End Date");
        return;
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (startDate <= now) {
        alert("Start date must be in the future");
        return;
      }

      if (endDate <= startDate) {
        alert("End date must be after start date");
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        startDate: formData.startDate,
        endDate: formData.endDate,
        eligibleVoters: formData.eligibleVoters ? parseInt(formData.eligibleVoters) : undefined,
      };

      console.log("Creating election with payload:", payload);

      const { data } = await axios.post(`${API_BASE_URL}/admin/elections`, payload);

      console.log("Election created successfully:", data);

      const newElection = data.election;
      
      setElections((prevElections) => [
        {
          ...newElection,
          totalVotes: newElection.totalVotes || 0,
          eligibleVoters: newElection.eligibleVoters || 0,
          totalCandidates: newElection.totalCandidates || newElection.candidatesCount || 0,
          startDate: new Date(newElection.startDate).toISOString().split('T')[0],
          endDate: new Date(newElection.endDate).toISOString().split('T')[0],
        },
        ...prevElections
      ]);

      setRecentActivity((prevActivity) => [
        { 
          id: Date.now(), 
          type: "election", 
          action: `New election "${newElection.title}" created`, 
          time: "Just now", 
          status: "success" 
        },
        ...prevActivity.slice(0, 4),
      ]);

      setStats(prevStats => ({
        ...prevStats,
        totalElections: prevStats.totalElections + 1,
        activeElections: newElection.status === 'active' || newElection.status === 'ongoing' || newElection.isActive
          ? prevStats.activeElections + 1 
          : prevStats.activeElections
      }));

      closeModal();
      alert("Election created successfully!");

    } catch (err) {
      console.error("Error creating election:", err);
      
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.join('\n');
        alert(`Validation Error:\n${errorMessages}`);
      } else if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert(`Error creating election: ${err.message}`);
      }
    }
  };

  const handleUpdateElection = async () => {
    try {
      if (!selectedElection) {
        alert("No election selected for update");
        return;
      }

      if (!formData.title) {
        alert("Election title is required");
        return;
      }
      
      if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        const now = new Date();

        if (startDate <= now) {
          alert("Start date must be in the future");
          return;
        }

        if (endDate <= startDate) {
          alert("End date must be after start date");
          return;
        }
      }

      const electionId = selectedElection._id || selectedElection.id;
      
      const payload = {};
      if (formData.title && formData.title !== selectedElection.title) {
        payload.title = formData.title.trim();
      }
      if (formData.description !== undefined && formData.description !== selectedElection.description) {
        payload.description = formData.description.trim();
      }
      if (formData.startDate && formData.startDate !== selectedElection.startDate) {
        payload.startDate = formData.startDate;
      }
      if (formData.endDate && formData.endDate !== selectedElection.endDate) {
        payload.endDate = formData.endDate;
      }
      if (formData.eligibleVoters && parseInt(formData.eligibleVoters) !== selectedElection.eligibleVoters) {
        payload.eligibleVoters = parseInt(formData.eligibleVoters);
      }

      console.log("Updating election with payload:", payload);

      const { data } = await axios.put(
        `${API_BASE_URL}/admin/elections/${electionId}`,
        payload
      );

      console.log("Election updated successfully:", data);

      const updatedElection = data.election;

      setElections((prevElections) =>
        prevElections.map((election) => {
          const currentId = election._id || election.id;
          const updatedId = updatedElection._id || updatedElection.id;
          
          if (currentId === updatedId || currentId === electionId) {
            return {
              ...updatedElection,
              startDate: new Date(updatedElection.startDate).toISOString().split('T')[0],
              endDate: new Date(updatedElection.endDate).toISOString().split('T')[0],
              totalVotes: updatedElection.totalVotes || election.totalVotes || 0,
              eligibleVoters: updatedElection.eligibleVoters || election.eligibleVoters || 0,
              totalCandidates: updatedElection.totalCandidates || updatedElection.candidatesCount || election.totalCandidates || 0,
            };
          }
          return election;
        })
      );

      setRecentActivity((prevActivity) => [
        { 
          id: Date.now(), 
          type: "election", 
          action: `Election "${updatedElection.title}" updated`, 
          time: "Just now", 
          status: "info" 
        },
        ...prevActivity.slice(0, 4),
      ]);

      closeModal();
      alert("Election updated successfully!");

    } catch (err) {
      console.error("Error updating election:", err);
      
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.join('\n');
        alert(`Validation Error:\n${errorMessages}`);
      } else if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert(`Error updating election: ${err.message}`);
      }
    }
  };

  const handleDeleteElection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election? This action cannot be undone.")) {
      return;
    }

    try {
      const election = elections.find((e) => e.id === id || e._id === id);
      const electionId = election?._id || election?.id || id;

      console.log("Deleting election with ID:", electionId);

      await axios.delete(`${API_BASE_URL}/admin/elections/${electionId}`);

      setElections((prevElections) => 
        prevElections.filter((e) => e.id !== id && e._id !== id && e._id !== electionId && e.id !== electionId)
      );

      setStats(prevStats => ({
        ...prevStats,
        totalElections: Math.max(0, prevStats.totalElections - 1),
        activeElections: election?.status === 'active' || election?.status === 'ongoing' || election?.isActive
          ? Math.max(0, prevStats.activeElections - 1)
          : prevStats.activeElections
      }));

      setRecentActivity((prevActivity) => [
        { 
          id: Date.now(), 
          type: "election", 
          action: `Election "${election?.title || 'Unknown'}" deleted`, 
          time: "Just now", 
          status: "completed" 
        },
        ...prevActivity.slice(0, 4),
      ]);

      alert("Election deleted successfully!");

      await fetchAllData(true);

    } catch (err) {
      console.error("Error deleting election:", err);
      
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert(`Error deleting election: ${err.message}`);
      }
    }
  };

  const handleAddCandidate = async () => {
    try {
      if (!formData.name || !formData.position || !formData.electionId) {
        alert("Please fill in all required fields (Name, Position, Election)");
        return;
      }
      
      const selected = elections.find((e) => e._id === formData.electionId);
      if (!selected) {
        alert("Please select a valid election");
        return;
      }
      
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
      setRecentActivity((a) => [
        { id: Date.now(), type: "candidate", action: `${newCandidate.name} registered`, time: "Just now", status: "success" },
        ...a.slice(0, 4),
      ]);
      
      setStats(prevStats => ({
        ...prevStats,
        totalCandidates: prevStats.totalCandidates + 1,
      }));
      
      closeModal();
      alert("Candidate added successfully!");

      await fetchAllData(true);
      
    } catch (err) {
      console.error("Error adding candidate:", err);
      alert(`Error adding candidate: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdateCandidate = async () => {
    try {
      if (!selectedCandidate) {
        alert("No candidate selected for update");
        return;
      }

      if (!formData.name || !formData.position) {
        alert("Name and position are required");
        return;
      }

      const candidateId = selectedCandidate._id || selectedCandidate.id;
      
      const payload = {
        name: formData.name.trim(),
        position: formData.position.trim(),
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || '',
        department: formData.department?.trim() || '',
        year: formData.year?.trim() || '',
      };

      console.log("Updating candidate with payload:", payload);

      const { data } = await axios.put(
        `${API_BASE_URL}/candidates/${candidateId}`,
        payload
      );

      console.log("Candidate updated successfully:", data);

      setCandidates((prevCandidates) =>
        prevCandidates.map((candidate) => {
          const currentId = candidate._id || candidate.id;
          if (currentId === candidateId) {
            return {
              ...candidate,
              ...data.candidate,
              id: candidate.id || candidate._id,
            };
          }
          return candidate;
        })
      );

      setRecentActivity((prevActivity) => [
        { 
          id: Date.now(), 
          type: "candidate", 
          action: `Candidate "${data.candidate.name}" updated`, 
          time: "Just now", 
          status: "info" 
        },
        ...prevActivity.slice(0, 4),
      ]);

      closeModal();
      alert("Candidate updated successfully!");

      await fetchAllData(true);

    } catch (err) {
      console.error("Error updating candidate:", err);
      
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert(`Error updating candidate: ${err.message}`);
      }
    }
  };

  // Fixed exportResults function
  const exportResults = async (format, electionId = null) => {
    try {
      let url;
      let filename;
      
      if (electionId && electionId !== '' && electionId !== 'undefined' && electionId !== 'null') {
        // Export specific election results
        url = `${API_BASE_URL}/admin/export?format=${format}&election=${electionId}`;
        filename = `election_${electionId}_results.${format}`;
      } else {
        // Export all data if no specific election ID
        url = `${API_BASE_URL}/admin/export-all?format=${format}`;
        filename = `all_data_export.${format}`;
      }

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': format === 'json' ? 'application/json' : 
                   format === 'csv' ? 'text/csv' : 'text/plain'
        }
      });

      // Create download link
      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);

      // Update recent activity
      setRecentActivity((a) => [
        { 
          id: Date.now(), 
          type: "election", 
          action: electionId 
            ? `Election ${electionId} results exported as ${format.toUpperCase()}`
            : `All data exported as ${format.toUpperCase()}`, 
          time: "Just now", 
          status: "info" 
        },
        ...a.slice(0, 4),
      ]);

      console.log(`✅ Export successful: ${filename}`);
      
    } catch (err) {
      console.error("Export error:", err);
      
      let errorMessage = "Export failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = "Bad request - please check the election ID";
      } else if (err.response?.status === 404) {
        errorMessage = "Export endpoint not found";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error during export";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Export Error: ${errorMessage}`);
      
      // Log error activity
      setRecentActivity((a) => [
        { 
          id: Date.now(), 
          type: "election", 
          action: `Export failed: ${errorMessage}`, 
          time: "Just now", 
          status: "error" 
        },
        ...a.slice(0, 4),
      ]);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "election": return <Calendar size={16} />;
      case "candidate": return <Trophy size={16} />;
      case "vote":      return <BarChart3 size={16} />;
      case "user":      return <Users size={16} />;
      default:          return <Activity size={16} />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case "success":   return "bg-green-100 text-green-800";
      case "info":      return "bg-blue-100 text-blue-800";
      case "completed": return "bg-purple-100 text-purple-800";
      case "error":     return "bg-red-100 text-red-800";
      default:          return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":    return "bg-green-100 text-green-800";
      case "upcoming":  return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default:          return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage elections, candidates, and users.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleManualRefresh}
                className={`p-2 text-gray-400 hover:text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh data"
              >
                <RefreshCw size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings size={20} />
              </button>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <nav className="flex space-x-8">
              {["dashboard","elections","candidates","users","reports"].map((tab) => (
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
              ))}
            </nav>
          </div>
        </div>
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
            onPromote={handlePromoteUser}
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

      {/* Modal Component */}
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
              {/* Election Modal */}
              {(showModal === "createElection" || showModal === "editElection") && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {showModal === "createElection" ? "Create New Election" : "Edit Election"}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Election Title</label>
                      <input
                        type="text"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter election title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Enter election description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={formData.startDate || ""}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={formData.endDate || ""}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Voters</label>
                      <input
                        type="number"
                        value={formData.eligibleVoters || ""}
                        onChange={(e) => setFormData({ ...formData, eligibleVoters: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter number of eligible voters"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                    <button
                      onClick={showModal === "createElection" ? handleCreateElection : handleUpdateElection}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      {showModal === "createElection" ? "Create Election" : "Update Election"}
                    </button>
                  </div>
                </div>
              )}

              {/* Candidate Modal */}
              {(showModal === "addCandidate" || showModal === "editCandidate") && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {showModal === "addCandidate" ? "Add New Candidate" : "Edit Candidate"}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={formData.name || ""}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter candidate's full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={formData.position || ""}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="President, Vice President, etc."
                        />
                      </div>
                    </div>
                    {showModal === "addCandidate" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Election</label>
                        <select
                          value={formData.electionId || ""}
                          onChange={(e) => setFormData({ ...formData, electionId: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select an election</option>
                          {elections.map((e) => (
                            <option key={e._id} value={e._id}>{e.title}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email || ""}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="candidate@university.edu"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input
                          type="text"
                          value={formData.department || ""}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Computer Science"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone || ""}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+233 24 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="text"
                          value={formData.year || ""}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="1st Year, 2nd Year, etc."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                    <button
                      onClick={showModal === "addCandidate" ? handleAddCandidate : handleUpdateCandidate}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      {showModal === "addCandidate" ? "Add Candidate" : "Update Candidate"}
                    </button>
                  </div>
                </div>
              )}

              {/* User Modal */}
              {showModal === "createUser" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Create Voter Account</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter voter's full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter email (optional)"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={handleCreateUser} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                      <Save size={16} /> Create Voter
                    </button>
                  </div>
                </div>
              )}
              {showModal === "editUser" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter user's full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={formData.role || ""}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="voter">Voter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>User ID:</strong> {selectedUser?.userId || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Created:</strong> {selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      onClick={closeModal} 
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateUser}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      Update User
                    </button>
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