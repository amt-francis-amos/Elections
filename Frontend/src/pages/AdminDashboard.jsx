import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Trophy,
  TrendingUp,
  BarChart3,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Plus,
  Settings,
  Bell
} from 'lucide-react';

// Mock data for dashboard overview
const mockStats = {
  totalElections: 12,
  activeElections: 3,
  totalCandidates: 45,
  totalVotes: 2847,
  totalUsers: 1234
};

const mockRecentActivity = [
  { id: 1, type: 'election', action: 'New election "SRC 2025" created', time: '2 hours ago', status: 'success' },
  { id: 2, type: 'candidate', action: 'Daniel Appiah registered for President', time: '4 hours ago', status: 'info' },
  { id: 3, type: 'vote', action: '127 new votes cast in Faculty Elections', time: '6 hours ago', status: 'success' },
  { id: 4, type: 'user', action: 'New user "Sarah Mitchell" registered', time: '1 day ago', status: 'info' },
  { id: 5, type: 'election', action: 'Alumni Elections completed successfully', time: '2 days ago', status: 'completed' }
];

const mockUpcomingElections = [
  { id: 1, title: 'SRC 2025 Elections', startDate: '2025-09-01', daysLeft: 37 },
  { id: 2, title: 'Faculty Board Elections', startDate: '2025-10-15', daysLeft: 81 },
  { id: 3, title: 'Sports Committee Elections', startDate: '2025-11-01', daysLeft: 98 }
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(mockStats);
  const [recentActivity] = useState(mockRecentActivity);
  const [upcomingElections] = useState(mockUpcomingElections);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const quickActions = [
    { icon: Plus, label: 'Create Election', color: 'bg-blue-500 hover:bg-blue-600', path: '/admin/elections' },
    { icon: Trophy, label: 'Add Candidate', color: 'bg-green-500 hover:bg-green-600', path: '/admin/candidates' },
    { icon: Users, label: 'Manage Users', color: 'bg-purple-500 hover:bg-purple-600', path: '/admin/users' },
    { icon: BarChart3, label: 'View Reports', color: 'bg-orange-500 hover:bg-orange-600', path: '/admin/reports' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'election': return <Calendar size={16} />;
      case 'candidate': return <Trophy size={16} />;
      case 'vote': return <BarChart3 size={16} />;
      case 'user': return <Users size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your elections.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Elections</p>
                <p className="text-3xl font-bold">{stats.totalElections}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-blue-200" />
              <span className="text-sm text-blue-100">{stats.activeElections} Active</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Candidates</p>
                <p className="text-3xl font-bold">{stats.totalCandidates}</p>
              </div>
              <Trophy className="w-8 h-8 text-green-200" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-200" />
              <span className="text-sm text-green-100">+12% this month</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Registered Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-200" />
              <span className="text-sm text-purple-100">+5% this week</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Votes</p>
                <p className="text-3xl font-bold">{stats.totalVotes.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-200" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-200" />
              <span className="text-sm text-orange-100">+234 today</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Participation</p>
                <p className="text-3xl font-bold">87%</p>
              </div>
              <Activity className="w-8 h-8 text-indigo-200" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-200" />
              <span className="text-sm text-indigo-100">Above average</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center gap-2 transition-colors`}
                >
                  <Icon size={24} />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity size={20} />
                  Recent Activity
                </h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View All <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Elections */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={20} />
                  Upcoming Elections
                </h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  Manage <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingElections.map((election) => (
                  <div key={election.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{election.title}</h4>
                      <p className="text-sm text-gray-600">
                        Starts: {new Date(election.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {election.daysLeft} days left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* System Status */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Server Status</p>
                <p className="text-xs text-gray-600">All systems operational</p>
              </div>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-600">Connected and synced</p>
              </div>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Backup Status</p>
                <p className="text-xs text-gray-600">Last backup: 2 hours ago</p>
              </div>
              <Clock className="text-yellow-500" size={20} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;