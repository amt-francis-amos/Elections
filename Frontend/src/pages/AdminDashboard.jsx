

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
} from "lucide-react";

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
        await new Promise((res) => setTimeout(res, 500));
        if (url === "/users") {
          return {
            data: {
              users: [
                { _id: "1", name: "Alice Johnson", email: "alice@example.com" },
                { _id: "2", name: "Bob Smith", email: "bob@example.com" },
              ],
            },
          };
        }
        if (url === "/elections") {
          return {
            data: {
              elections: [
                { _id: "1", title: "SRC 2025 Elections", description: "Election for SRC executives.", startDate: "2025-09-01", endDate: "2025-09-03", status: "upcoming" },
              ],
            },
          };
        }
        if (url === "/candidates") {
          return {
            data: {
              candidates: [
                { _id: "1", name: "Daniel Appiah", position: "President", description: "I aim to serve.", electionId: "1" },
              ],
            },
          };
        }
        return { data: {} };
      },
    };
  };

  const api = createApiInstance();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [usersRes, electionsRes, candidatesRes] = await Promise.all([
        api.get("/users"),
        api.get("/elections"),
        api.get("/candidates"),
      ]);
      setUsers(usersRes.data.users);
      setElections(electionsRes.data.elections);
      setCandidates(candidatesRes.data.candidates);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleInputChange = (e, formSetter) => {
    const { name, value } = e.target;
    formSetter((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateElection = () => {
    setElections((prev) => [...prev, { ...electionForm, _id: Date.now().toString() }]);
    setElectionForm({ title: "", description: "", startDate: "", endDate: "", status: "upcoming" });
    setShowElectionModal(false);
    setMessage("Election created successfully!");
  };

  const handleCreateCandidate = () => {
    setCandidates((prev) => [...prev, { ...candidateForm, _id: Date.now().toString() }]);
    setCandidateForm({ name: "", position: "President", description: "", electionId: "" });
    setShowCandidateModal(false);
    setMessage("Candidate created successfully!");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab("elections")} className={activeTab === "elections" ? "font-bold" : ""}>Elections</button>
        <button onClick={() => setActiveTab("candidates")} className={activeTab === "candidates" ? "font-bold" : ""}>Candidates</button>
        <button onClick={() => setActiveTab("users")} className={activeTab === "users" ? "font-bold" : ""}>Users</button>
      </div>

      {loading && <p>Loading...</p>}
      {message && <div className="bg-green-100 text-green-800 p-2 rounded mb-4">{message}</div>}

      {activeTab === "elections" && (
        <div>
          <button onClick={() => setShowElectionModal(true)} className="bg-blue-500 text-white px-3 py-1 rounded mb-2 flex items-center gap-1"><Plus size={16} /> New Election</button>
          <ul>
            {elections.map((e) => (
              <li key={e._id}>{e.title} - {e.status}</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "candidates" && (
        <div>
          <button onClick={() => setShowCandidateModal(true)} className="bg-blue-500 text-white px-3 py-1 rounded mb-2 flex items-center gap-1"><Plus size={16} /> New Candidate</button>
          <ul>
            {candidates.map((c) => (
              <li key={c._id}>{c.name} - {c.position}</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <ul>
            {users.map((u) => (
              <li key={u._id}>{u.name} - {u.email}</li>
            ))}
          </ul>
        </div>
      )}

      {showElectionModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2">Create Election</h3>
            <input name="title" value={electionForm.title} onChange={(e) => handleInputChange(e, setElectionForm)} placeholder="Title" className="border p-1 w-full mb-2" />
            <textarea name="description" value={electionForm.description} onChange={(e) => handleInputChange(e, setElectionForm)} placeholder="Description" className="border p-1 w-full mb-2" />
            <input type="date" name="startDate" value={electionForm.startDate} onChange={(e) => handleInputChange(e, setElectionForm)} className="border p-1 w-full mb-2" />
            <input type="date" name="endDate" value={electionForm.endDate} onChange={(e) => handleInputChange(e, setElectionForm)} className="border p-1 w-full mb-2" />
            <button onClick={handleCreateElection} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
            <button onClick={() => setShowElectionModal(false)} className="ml-2 text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {showCandidateModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2">Create Candidate</h3>
            <input name="name" value={candidateForm.name} onChange={(e) => handleInputChange(e, setCandidateForm)} placeholder="Name" className="border p-1 w-full mb-2" />
            <input name="position" value={candidateForm.position} onChange={(e) => handleInputChange(e, setCandidateForm)} placeholder="Position" className="border p-1 w-full mb-2" />
            <textarea name="description" value={candidateForm.description} onChange={(e) => handleInputChange(e, setCandidateForm)} placeholder="Description" className="border p-1 w-full mb-2" />
            <select name="electionId" value={candidateForm.electionId} onChange={(e) => handleInputChange(e, setCandidateForm)} className="border p-1 w-full mb-2">
              <option value="">Select Election</option>
              {elections.map((e) => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
            <button onClick={handleCreateCandidate} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
            <button onClick={() => setShowCandidateModal(false)} className="ml-2 text-gray-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
