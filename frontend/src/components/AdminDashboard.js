import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({ summary: false, report: false });
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateFilter, setDateFilter] = useState('');
  const [internFilter, setInternFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Helper function to format dates in local timezone
  const formatLocalDateTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatLocalDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Try to fetch real data from n8n endpoints
      const [logsResponse, reportsResponse, summariesResponse] = await Promise.allSettled([
        axios.get('/webhook/get-logs-db'),
        axios.get('/webhook/get-reports'),
        axios.get('/webhook/get-summaries')
      ]);

      // Set logs data if successful, otherwise empty array
      if (logsResponse.status === 'fulfilled' && logsResponse.value.data) {
        const logsData = logsResponse.value.data;
        const processedLogs = Array.isArray(logsData) ? logsData.map(item => item.json || item) : [];
        setLogs(processedLogs);
      } else {
        setLogs([]);
      }

      // Set reports data if successful, otherwise empty array
      if (reportsResponse.status === 'fulfilled' && reportsResponse.value.data) {
        setReports(Array.isArray(reportsResponse.value.data) ? reportsResponse.value.data : []);
      } else {
        setReports([]);
      }

      // Set summaries data if successful, otherwise empty array
      if (summariesResponse.status === 'fulfilled' && summariesResponse.value.data) {
        setSummaries(Array.isArray(summariesResponse.value.data) ? summariesResponse.value.data : []);
      } else {
        setSummaries([]);
      }
      
      setMessage(`Admin dashboard loaded successfully! Found ${logs.length} log entries.`);
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMessage('Dashboard loaded. Unable to fetch data from n8n - please check your workflows are running.');
      
      // Set empty arrays as fallback
      setLogs([]);
      setReports([]);
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const generateWeeklySummary = async () => {
    setAiLoading({ ...aiLoading, summary: true });
    try {
      await axios.post('/webhook/generate-weekly-summary', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        internEmail: user?.email
      });
      
      setMessage('Weekly summary generation initiated successfully!');
      
      setTimeout(() => {
        fetchAllData();
      }, 2000);

      // Clear the message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage('Weekly summary generation initiated. Check back in a few minutes.');
      console.error('Error generating summary:', error);
    } finally {
      setAiLoading({ ...aiLoading, summary: false });
    }
  };

  const generateFinalReport = async (reportPeriod = 'full') => {
    setAiLoading({ ...aiLoading, report: true });
    try {
      await axios.post('/webhook/generate-final-report', {
        userEmail: user?.email,
        reportPeriod: reportPeriod,
        requestedBy: user?.name
      });
      
      setMessage('Final report generation initiated successfully!');
      
      setTimeout(() => {
        fetchAllData();
      }, 3000);

      // Clear the message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage('Final report generation initiated. This may take a few minutes.');
      console.error('Error generating report:', error);
    } finally {
      setAiLoading({ ...aiLoading, report: false });
    }
  };

  const handleLogout = () => {
    logout();
  };

  const filteredLogs = logs.filter(log => {
    const matchesDate = dateFilter ? (log.log_date || log.date || '').includes(dateFilter) : true;
    const matchesIntern = internFilter ? (log.intern_name || log.internName || '').toLowerCase().includes(internFilter.toLowerCase()) : true;
    return matchesDate && matchesIntern;
  });

  // Sidebar navigation component
  const SidebarNavItem = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center ${sidebarOpen ? 'px-4 py-3' : 'px-2 py-2 justify-center'} text-left transition-all duration-200 rounded-lg ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title={!sidebarOpen ? label : ''}
    >
      <span className={`${sidebarOpen ? 'text-xl' : 'text-lg'} flex-shrink-0 transition-all duration-200`}>{icon}</span>
      {sidebarOpen && (
        <span className="font-medium ml-3 transition-opacity duration-300">{label}</span>
      )}
    </button>
  );

  const ThemeToggle = () => (
    <button
      onClick={() => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
      }}
      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
    >
      {document.documentElement.classList.contains('dark') ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );

  const StatsCard = ({ title, value, subtitle, color = "blue", icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-3">
        <div className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-gray-800 dark:text-white font-medium mb-1">{title}</div>
      <div className="text-gray-600 dark:text-gray-400 text-sm">{subtitle}</div>
    </div>
  );

  const LogCard = ({ log }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
            📅 {log.intern_name || log.internName} - {log.log_date ? formatLocalDate(log.log_date) : 'No date'}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Submitted on {formatLocalDate(log.created_at)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            ⏱️ {log.time_spent || log.timeSpent}h
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">🚀 Project Description</p>
          <p className="text-purple-800 dark:text-purple-200">{log.project_description || log.projectDescription}</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">✅ Tasks Completed</p>
          <p className="text-green-800 dark:text-green-200">{log.tasks_completed || log.tasksCompleted}</p>
        </div>
        
        {(log.challenges || log.challenges) && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">⚠️ Challenges</p>
            <p className="text-orange-800 dark:text-orange-200">{log.challenges}</p>
          </div>
        )}
        
        {(log.notes || log.notes) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">📝 Notes</p>
            <p className="text-blue-800 dark:text-blue-200">{log.notes}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Submitted: {formatLocalDateTime(log.created_at || log.timestamp)}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-96' : 'w-16'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out`}>
        {/* Sidebar Header */}
        <div className={`${sidebarOpen ? 'p-6' : 'p-3'} border-b border-gray-200 dark:border-gray-700 transition-all duration-300`}>
          <div className="flex flex-col items-center justify-center">
            <img 
              src="/wolff-logics-logo.png" 
              alt="Wolff Logics" 
              className={`${sidebarOpen ? 'h-16 mb-4' : 'h-6 mb-2'} w-auto transition-all duration-300`}
            />
            {sidebarOpen && (
              <div className="text-center transition-opacity duration-300">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user?.name || 'Admin'}</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 mt-2"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className={`${sidebarOpen ? 'p-4 space-y-2' : 'p-2 space-y-3'} transition-all duration-300 flex-1`}>
          <SidebarNavItem id="dashboard" label="Overview" icon="📊" />
          <SidebarNavItem id="logs" label="All Daily Logs" icon="📋" />
          <SidebarNavItem id="reports" label="Generated Reports" icon="📄" />
          <SidebarNavItem id="summaries" label="Weekly Summaries" icon="📈" />
          <SidebarNavItem id="analytics" label="Analytics" icon="📊" />
          <SidebarNavItem id="users" label="User Management" icon="👥" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            {/* Empty left space */}
            <div className="flex-1"></div>
            
            {/* Centered heading */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {activeTab === 'dashboard' && '📊 Admin Overview'}
                {activeTab === 'logs' && '📋 All Daily Logs'}
                {activeTab === 'reports' && '📄 Generated Reports'}
                {activeTab === 'summaries' && '📈 Weekly Summaries'}
                {activeTab === 'analytics' && '📊 Analytics Dashboard'}
                {activeTab === 'users' && '👥 User Management'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {activeTab === 'dashboard' && 'Monitor system performance and key metrics'}
                {activeTab === 'logs' && 'View and manage all intern daily log submissions'}
                {activeTab === 'reports' && 'Access AI-generated reports and summaries'}
                {activeTab === 'summaries' && 'Review weekly progress summaries'}
                {activeTab === 'analytics' && 'Analyze trends and performance data'}
                {activeTab === 'users' && 'Manage intern accounts and permissions'}
              </p>
            </div>
            
            {/* User info on absolute far right */}
            <div className="flex items-center space-x-4 flex-1 justify-end">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">{user?.role}</p>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {message && (
            <div className="max-w-7xl mx-auto">
              <div className={`mt-4 p-3 rounded-lg ${
                message.includes('Failed') || message.includes('Error')
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              }`}>
                {message}
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Admin Stats Overview */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard 
                    title="Total Logs" 
                    value={logs.length} 
                    subtitle="Daily entries recorded"
                    color="blue"
                    icon="📋"
                  />
                  <StatsCard 
                    title="Total Hours" 
                    value={logs.reduce((sum, log) => sum + parseFloat(log.time_spent || log.timeSpent || 0), 0).toFixed(1)} 
                    subtitle="Hours worked"
                    color="green"
                    icon="⏱️"
                  />
                  <StatsCard 
                    title="Reports Generated" 
                    value={reports.length} 
                    subtitle="Weekly & final reports"
                    color="purple"
                    icon="📄"
                  />
                  <StatsCard 
                    title="Avg Daily Hours" 
                    value={logs.length > 0 ? (logs.reduce((sum, log) => sum + parseFloat(log.time_spent || log.timeSpent || 0), 0) / logs.length).toFixed(1) : '0.0'} 
                    subtitle="Per day productivity"
                    color="orange"
                    icon="📊"
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">🚀 Quick Actions</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={generateWeeklySummary}
                      disabled={aiLoading.summary}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg disabled:opacity-50 transition-colors duration-200 text-center"
                    >
                      <div className="text-2xl mb-2">📊</div>
                      <div className="font-medium">{aiLoading.summary ? 'Generating...' : 'Generate Weekly Summary'}</div>
                      <div className="text-sm opacity-90">AI-powered analysis</div>
                    </button>
                    
                    <button
                      onClick={() => generateFinalReport()}
                      disabled={aiLoading.report}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg disabled:opacity-50 transition-colors duration-200 text-center"
                    >
                      <div className="text-2xl mb-2">📋</div>
                      <div className="font-medium">{aiLoading.report ? 'Generating...' : 'Generate Final Report'}</div>
                      <div className="text-sm opacity-90">Comprehensive summary</div>
                    </button>
                    
                    <button
                      onClick={fetchAllData}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-colors duration-200 text-center"
                    >
                      <div className="text-2xl mb-2">🔄</div>
                      <div className="font-medium">Refresh Data</div>
                      <div className="text-sm opacity-90">Update all information</div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">📈 Recent Activity</h3>
                  {logs.slice(0, 3).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-4">📊</div>
                      <p className="text-gray-500 dark:text-gray-400">No recent activity to display</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {logs.slice(0, 3).map((log, index) => (
                        <LogCard key={index} log={log} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-6">
                {/* Admin Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">🔍 Filters</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Date</label>
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Intern</label>
                      <input
                        type="text"
                        placeholder="Enter intern name..."
                        value={internFilter}
                        onChange={(e) => setInternFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={fetchAllData}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full transition-colors duration-200"
                      >
                        🔄 Refresh Data
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logs Display */}
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No logs found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Daily logs from interns will appear here once they start submitting entries.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {filteredLogs.map((log, index) => (
                      <LogCard key={index} log={log} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                {reports.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="mb-4">
                      <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports generated yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">AI-generated reports will appear here once you generate them.</p>
                    <button
                      onClick={() => generateFinalReport()}
                      disabled={aiLoading.report}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 transition-colors duration-200"
                    >
                      {aiLoading.report ? 'Generating...' : '📋 Generate First Report'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{report.title}</h3>
                            <p className="text-blue-600 dark:text-blue-400 font-medium">{report.type?.charAt(0).toUpperCase() + report.type?.slice(1)}</p>
                          </div>
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                            {report.date}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{report.summary}</p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-6 text-sm text-gray-500 dark:text-gray-400">
                            <span><strong>{report.hoursWorked}</strong> hours worked</span>
                            <span><strong>{report.tasksCompleted}</strong> tasks completed</span>
                          </div>
                          
                          {report.fileName && (
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                              📄 Download Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summaries' && (
              <div className="space-y-6">
                {summaries.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="mb-4">
                      <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No summaries available yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">AI-powered weekly summaries will analyze daily logs and highlight key accomplishments.</p>
                    <button
                      onClick={generateWeeklySummary}
                      disabled={aiLoading.summary}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 transition-colors duration-200"
                    >
                      {aiLoading.summary ? 'Generating...' : '📊 Generate Weekly Summary'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {summaries.map((summary, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{summary.week}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            summary.productivity === 'Very High' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            summary.productivity === 'High' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {summary.productivity} Productivity
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.totalHours}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.totalTasks}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.avgDailyHours}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Hours</p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Main Projects:</p>
                            <div className="flex flex-wrap gap-2">
                              {summary.mainProjects?.map((project, idx) => (
                                <span key={idx} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
                                  {project}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Key Learnings:</p>
                            <div className="flex flex-wrap gap-2">
                              {summary.keyLearnings?.map((learning, idx) => (
                                <span key={idx} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-sm">
                                  {learning}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500 dark:text-gray-400">Advanced analytics and reporting features coming soon!</p>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">User Management</h3>
                <p className="text-gray-500 dark:text-gray-400">User administration features coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 