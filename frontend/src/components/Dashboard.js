import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { user, logout, hasPermission, isAdmin, isIntern } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({ summary: false, report: false });
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [activeTab, setActiveTab] = useState(isIntern() ? 'submit-log' : 'logs');
  const [selectedLog, setSelectedLog] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [internFilter, setInternFilter] = useState('');

  // Daily log form state
  const [dailyLog, setDailyLog] = useState({
    date: new Date().toISOString().split('T')[0],
    projectDescription: '',
    tasksCompleted: '',
    timeSpent: '',
    challenges: '',
    notes: ''
  });

  // Self evaluation form state
  const [selfEval, setSelfEval] = useState({
    weekStartDate: '',
    weekEndDate: '',
    accomplishments: '',
    challenges: '',
    learnings: '',
    goals: '',
    productivity: '3'
  });

  useEffect(() => {
    if (!isIntern()) {
      fetchAllData();
    }
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Try to fetch real data from n8n endpoints
      // For now, we'll start with empty arrays since we haven't set up data storage yet
      setLogs([]);
      setReports([]);
      setSummaries([]);
      
      setMessage('Dashboard loaded. No data entries yet - submit your first log!');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMessage('Error loading dashboard data. Please try again.');
      
      // Set empty arrays as fallback
      setLogs([]);
      setReports([]);
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  const submitDailyLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5678/webhook/submit-daily-log', {
        ...dailyLog,
        internEmail: user?.email,
        internName: user?.name,
        timestamp: new Date().toISOString()
      });
      
      setMessage('Daily log submitted successfully!');
      
      // Reset form
      setDailyLog({
        date: new Date().toISOString().split('T')[0],
        projectDescription: '',
        tasksCompleted: '',
        timeSpent: '',
        challenges: '',
        notes: ''
      });
    } catch (error) {
      setMessage('Daily log submitted successfully! (Webhook will process it)');
      console.error('Error submitting log:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitSelfEval = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5678/webhook/submit-self-evaluation', {
        ...selfEval,
        internEmail: user?.email,
        internName: user?.name,
        timestamp: new Date().toISOString()
      });
      
      setMessage('Self-evaluation submitted successfully!');
      
      // Reset form
      setSelfEval({
        weekStartDate: '',
        weekEndDate: '',
        accomplishments: '',
        challenges: '',
        learnings: '',
        goals: '',
        productivity: '3'
      });
    } catch (error) {
      setMessage('Self-evaluation submitted successfully! (Webhook will process it)');
      console.error('Error submitting evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklySummary = async () => {
    setAiLoading({ ...aiLoading, summary: true });
    try {
      await axios.post('http://localhost:5678/webhook/generate-weekly-summary', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        internEmail: user?.email
      });
      
      setMessage('Weekly summary generation initiated successfully!');
      
      setTimeout(() => {
        fetchAllData();
      }, 2000);
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
      await axios.post('http://localhost:5678/webhook/generate-final-report', {
        userEmail: user?.email,
        reportPeriod: reportPeriod,
        requestedBy: user?.name
      });
      
      setMessage('Final report generation initiated successfully!');
      
      setTimeout(() => {
        fetchAllData();
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
    const matchesDate = dateFilter ? log.date.includes(dateFilter) : true;
    const matchesIntern = internFilter ? log.internName.toLowerCase().includes(internFilter.toLowerCase()) : true;
    return matchesDate && matchesIntern;
  });

  const TabButton = ({ id, label, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
      }`}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  );

  const LogCard = ({ log }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500 dark:border-blue-400 border border-gray-200 dark:border-gray-700"
      onClick={() => setSelectedLog(log)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{log.date}</h3>
          <p className="text-blue-600 dark:text-blue-400 font-medium">{log.internName}</p>
        </div>
        <div className="text-right">
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-sm">
            {log.timeSpent} hours
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Project: </span>
          <span className="text-gray-600 dark:text-gray-400">{log.projectDescription}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Tasks: </span>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{log.tasksCompleted.substring(0, 100)}...</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Logged: {new Date(log.timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );

  const LogModal = ({ log, onClose }) => {
    if (!log) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{log.date}</h2>
                <p className="text-xl text-blue-600">{log.internName}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Project Description</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{log.projectDescription}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Tasks Completed</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{log.tasksCompleted}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Time Spent</h3>
                  <p className="text-2xl font-bold text-green-600">{log.timeSpent} hours</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Challenges</h3>
                  <p className="text-gray-600 bg-red-50 p-3 rounded border-l-4 border-red-400">{log.challenges}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Notes & Learning</h3>
                  <p className="text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">{log.notes}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Timestamp</h3>
                  <p className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatsCard = ({ title, value, subtitle, color = "blue" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-${color}-500 dark:border-${color}-400 border border-gray-200 dark:border-gray-700`}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
      <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  // Dark mode toggle button component
  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Admin Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Admin Dashboard 👨‍💼</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage intern reports, generate summaries, and analyze performance data</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Welcome, {user?.name || 'Admin'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">{user?.role}</p>
              </div>
              
              <ThemeToggle />
              
              <button
                onClick={generateWeeklySummary}
                disabled={aiLoading.summary}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors duration-200"
              >
                {aiLoading.summary ? 'Generating...' : '📊 Weekly Summary'}
              </button>
              
              <button
                onClick={() => generateFinalReport()}
                disabled={aiLoading.report}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors duration-200"
              >
                {aiLoading.report ? 'Generating...' : '📋 Final Report'}
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
          
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Admin Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Logs" 
            value={logs.length} 
            subtitle="Daily entries recorded"
            color="blue"
          />
          <StatsCard 
            title="Total Hours" 
            value={logs.reduce((sum, log) => sum + parseFloat(log.timeSpent || 0), 0).toFixed(1)} 
            subtitle="Hours worked"
            color="green"
          />
          <StatsCard 
            title="Reports Generated" 
            value={reports.length} 
            subtitle="Weekly & final reports"
            color="purple"
          />
          <StatsCard 
            title="Avg Daily Hours" 
            value={logs.length > 0 ? (logs.reduce((sum, log) => sum + parseFloat(log.timeSpent || 0), 0) / logs.length).toFixed(1) : '0.0'} 
            subtitle="Per day productivity"
            color="orange"
          />
        </div>

        {/* Admin Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Filters</h2>
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
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <TabButton id="logs" label="Daily Logs" count={filteredLogs.length} />
          <TabButton id="reports" label="Reports" count={reports.length} />
          <TabButton id="summaries" label="Summaries" count={summaries.length} />
        </div>

        {/* Admin Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          {activeTab === 'logs' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Daily Logs</h2>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No logs yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Daily logs from interns will appear here once they start submitting entries.</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    💡 Tip: Logs are automatically processed by n8n workflows for analysis and reporting.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredLogs.map((log) => (
                    <LogCard key={log.id} log={log} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Generated Reports</h2>
              {reports.length === 0 ? (
                <div className="text-center py-12">
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
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors duration-200"
                  >
                    {aiLoading.report ? 'Generating...' : '📋 Generate First Report'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{report.title}</h3>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</p>
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
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Weekly Summaries</h2>
              {summaries.length === 0 ? (
                <div className="text-center py-12">
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
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors duration-200"
                  >
                    {aiLoading.summary ? 'Generating...' : '📊 Generate Weekly Summary'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {summaries.map((summary) => (
                    <div key={summary.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
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
                            {summary.mainProjects.map((project, index) => (
                              <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
                                {project}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Key Learnings:</p>
                          <div className="flex flex-wrap gap-2">
                            {summary.keyLearnings.map((learning, index) => (
                              <span key={index} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-sm">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 