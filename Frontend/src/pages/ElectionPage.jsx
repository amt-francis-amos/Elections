import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  BarChart3
} from 'lucide-react';

const ElectionsPage = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "draft"
  });

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch("https://elections-backend-j8m8.onrender.com/api/elections", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch elections");
        const data = await response.json();
        setElections(data);
      } catch (error) {
        console.error("Error fetching elections:", error);
        showMessage("Failed to load elections", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setElectionForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateElection = async () => {
    if (!electionForm.title || !electionForm.startDate || !electionForm.endDate) {
      return showMessage("Please fill in all required fields", "error");
    }

    if (new Date(electionForm.startDate) >= new Date(electionForm.endDate)) {
      return showMessage("End date must be after start date", "error");
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("https://elections-backend-j8m8.onrender.com/api/elections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(electionForm),
      });

      const data = await response.json();

      if (!response.ok) {
        return showMessage(data.message || "Failed to create election", "error");
      }

      setElections(prev => [data.election, ...prev]);
      setElectionForm({ title: "", description: "", startDate: "", endDate: "", status: "draft" });
      setShowModal(false);
      showMessage("Election created successfully!", "success");
    } catch (error) {
      console.error("Error creating election:", error);
      showMessage("Error creating election", "error");
    }
  };

  const handleDeleteElection = (id) => {
    setElections(prev => prev.filter(e => e._id !== id));
    showMessage("Election deleted successfully", "success");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} />;
      case "upcoming":
        return <Clock size={16} />;
      case "completed":
        return <CheckCircle size={16} />;
      case "draft":
        return <AlertCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const filteredElections = elections.filter(election =>
    election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    election.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading elections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Elections Management</h1>
            <p className="text-gray-600 mt-1">Create and manage election campaigns</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            New Election
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{message.text}</span>
          </motion.div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Elections" value={elections.length} icon={<Calendar className="text-blue-500" />} />
          <StatCard title="Active Elections" value={elections.filter(e => e.status === "active").length} icon={<CheckCircle className="text-green-500" />} />
          <StatCard title="Total Candidates" value={elections.reduce((sum, e) => sum + (e.candidatesCount || 0), 0)} icon={<Users className="text-purple-500" />} />
          <StatCard title="Total Votes" value={elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0)} icon={<BarChart3 className="text-orange-500" />} />
        </div>

        {/* Search */}
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search elections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Election Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredElections.map(election => (
            <div key={election._id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{election.title}</h3>
                  <p className="text-sm text-gray-600">{election.description}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(election.status)}`}>
                  {getStatusIcon(election.status)}
                  {election.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Info label="Start Date" value={new Date(election.startDate).toLocaleDateString()} />
                <Info label="End Date" value={new Date(election.endDate).toLocaleDateString()} />
              </div>

              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span><Users size={16} className="inline mr-1" /> {election.candidatesCount || 0} Candidates</span>
                <span><BarChart3 size={16} className="inline mr-1" /> {election.totalVotes || 0} Votes</span>
              </div>

              <div className="flex justify-end gap-2">
                <button className="text-blue-600 hover:underline" title="View"><Eye size={16} /></button>
                <button className="text-green-600 hover:underline" title="Edit"><Edit size={16} /></button>
                <button onClick={() => handleDeleteElection(election._id)} className="text-red-600 hover:underline" title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Create New Election</h3>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Election Title" name="title" value={electionForm.title} onChange={handleInputChange} required />
              <Textarea label="Description" name="description" value={electionForm.description} onChange={handleInputChange} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" name="startDate" type="date" value={electionForm.startDate} onChange={handleInputChange} required />
                <Input label="End Date" name="endDate" type="date" value={electionForm.endDate} onChange={handleInputChange} required />
              </div>
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select name="status" value={electionForm.status} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2">
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleCreateElection} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="w-8 h-8">{icon}</div>
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);

const Input = ({ label, name, value, onChange, type = "text", required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2"
    />
  </div>
);

const Textarea = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2"
      rows={3}
    />
  </div>
);

export default ElectionsPage;
