import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Trophy,
  BarChart3,
  Activity,
  CheckCircle
} from 'lucide-react';

const Dashboard = ({ stats, recentActivity, elections, quickActions, getActivityIcon, getActivityColor, getStatusColor }) => {
  return (
    <div className="space-y-8">
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
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Registered Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Votes</p>
              <p className="text-3xl font-bold">{stats.totalVotes}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white"
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Participation</p>
              <p className="text-3xl font-bold">
                {stats.totalUsers > 0 ? Math.round((stats.totalVotes / stats.totalUsers) * 100) : 0}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-indigo-200" />
          </div>
        </motion.div>
      </motion.div>

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
                onClick={action.action}
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
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={20} />
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} />
              Active Elections
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {elections.filter(e => e.status === 'active' || e.status === 'upcoming').length === 0 ? (
                <p className="text-gray-500 text-center py-8">No active elections</p>
              ) : (
                elections.filter(e => e.status === 'active' || e.status === 'upcoming').slice(0, 3).map((election) => (
                  <div key={election.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{election.title}</h4>
                      <p className="text-sm text-gray-600">
                        {election.totalVotes} votes • {election.totalCandidates} candidates
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                        {election.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;