import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const InternDashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('submit-log');
  const [myLogs, setMyLogs] = useState([]);
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      // Try to fetch the intern's own logs and evaluations using database endpoints
      const [logsResponse, evalsResponse] = await Promise.allSettled([
        axios.get(`/webhook/get-logs-db`), // Back to get-logs-db for retrieving data
        axios.get(`/webhook/get-self-evaluations`) // Use the new self-evaluations endpoint
      ]);

      // Set logs data if successful, otherwise empty array
      if (logsResponse.status === 'fulfilled' && logsResponse.value.data) {
        // Handle the raw array format from n8n - data is nested in json property
        const logsData = logsResponse.value.data;
        const processedLogs = Array.isArray(logsData) ? logsData.map(item => item.json || item) : [];
        setMyLogs(processedLogs);
      } else {
        setMyLogs([]);
      }

      // Set evaluations data if successful, otherwise empty array
      if (evalsResponse.status === 'fulfilled' && evalsResponse.value.data) {
        console.log('Evaluations response:', evalsResponse.value.data); // Debug log
        // Handle n8n response structure - data might be nested
        let evalsData = evalsResponse.value.data;
        
        // If it's wrapped in a data property, unwrap it
        if (evalsData && evalsData.data) {
          evalsData = evalsData.data;
        }
        
        // Handle both single object and array responses
        let processedEvals = [];
        if (Array.isArray(evalsData)) {
          processedEvals = evalsData.map(item => item.json || item);
        } else if (evalsData && typeof evalsData === 'object') {
          // Single object - convert to array
          processedEvals = [evalsData.json || evalsData];
        }
        
        setMyEvaluations(processedEvals);
      } else {
        setMyEvaluations([]);
      }
    } catch (error) {
      console.error('Error fetching my data:', error);
      // Keep empty arrays as fallback
      setMyLogs([]);
      setMyEvaluations([]);
    }
  };

  const submitDailyLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/webhook/daily-logs-new', {
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

      // Refresh data after successful submission
      setTimeout(() => {
        fetchMyData();
      }, 1000);

      // Clear the message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage('Failed to submit daily log. Please try again.');
      console.error('Error submitting log:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitSelfEval = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/webhook/submit-self-evaluation', {
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

      // Refresh data after successful submission
      setTimeout(() => {
        fetchMyData();
      }, 1000);

      // Clear the message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage('Failed to submit self-evaluation. Please try again.');
      console.error('Error submitting evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600 dark:text-gray-400">Submitting your data...</span>
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
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Intern Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user?.name || 'Intern'}</p>
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
          <SidebarNavItem id="submit-log" label="Submit Daily Log" icon="📝" />
          <SidebarNavItem id="self-eval" label="Weekly Self-Evaluation" icon="📊" />
          <SidebarNavItem id="my-logs" label="My Daily Logs" icon="📋" />
          <SidebarNavItem id="my-evaluations" label="My Evaluations" icon="📈" />
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
                {activeTab === 'submit-log' && '📝 Submit Daily Log'}
                {activeTab === 'self-eval' && '📊 Weekly Self-Evaluation'}
                {activeTab === 'my-logs' && '📋 My Daily Logs'}
                {activeTab === 'my-evaluations' && '📈 My Evaluations'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {activeTab === 'submit-log' && 'Track your daily progress and submit your work logs'}
                {activeTab === 'self-eval' && 'Reflect on your weekly accomplishments and growth'}
                {activeTab === 'my-logs' && 'View and manage your submitted daily logs'}
                {activeTab === 'my-evaluations' && 'Review your weekly self-evaluations'}
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
          {activeTab === 'submit-log' && (
              <div className="max-w-4xl mx-auto">
              <form onSubmit={submitDailyLog} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={dailyLog.date}
                      onChange={(e) => setDailyLog({ ...dailyLog, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Spent (hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={dailyLog.timeSpent}
                      onChange={(e) => setDailyLog({ ...dailyLog, timeSpent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 8"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Description</label>
                  <textarea
                    value={dailyLog.projectDescription}
                    onChange={(e) => setDailyLog({ ...dailyLog, projectDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24 resize-none"
                    placeholder="Describe the main project or area you worked on today..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks Completed</label>
                  <textarea
                    value={dailyLog.tasksCompleted}
                    onChange={(e) => setDailyLog({ ...dailyLog, tasksCompleted: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24 resize-none"
                    placeholder="List the specific tasks you completed today..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Challenges Faced</label>
                  <textarea
                    value={dailyLog.challenges}
                    onChange={(e) => setDailyLog({ ...dailyLog, challenges: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-20 resize-none"
                    placeholder="Describe any challenges or obstacles you encountered..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Notes</label>
                  <textarea
                    value={dailyLog.notes}
                    onChange={(e) => setDailyLog({ ...dailyLog, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-20 resize-none"
                    placeholder="Any additional notes, learnings, or thoughts..."
                  />
                </div>

                  <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Daily Log'}
                </button>
                  </div>
              </form>
            </div>
          )}

          {activeTab === 'self-eval' && (
              <div className="max-w-4xl mx-auto">
              <form onSubmit={submitSelfEval} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Week Start Date</label>
                    <input
                      type="date"
                      value={selfEval.weekStartDate}
                      onChange={(e) => setSelfEval({ ...selfEval, weekStartDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Week End Date</label>
                    <input
                      type="date"
                      value={selfEval.weekEndDate}
                      onChange={(e) => setSelfEval({ ...selfEval, weekEndDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Accomplishments</label>
                  <textarea
                    value={selfEval.accomplishments}
                    onChange={(e) => setSelfEval({ ...selfEval, accomplishments: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24 resize-none"
                    placeholder="What were your main achievements this week?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Challenges & How You Overcame Them</label>
                  <textarea
                    value={selfEval.challenges}
                    onChange={(e) => setSelfEval({ ...selfEval, challenges: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24 resize-none"
                    placeholder="Describe any challenges and your approach to solving them..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Learnings</label>
                  <textarea
                    value={selfEval.learnings}
                    onChange={(e) => setSelfEval({ ...selfEval, learnings: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24 resize-none"
                    placeholder="What new skills or knowledge did you gain?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goals for Next Week</label>
                  <textarea
                    value={selfEval.goals}
                    onChange={(e) => setSelfEval({ ...selfEval, goals: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24 resize-none"
                      placeholder="What do you want to focus on or achieve next week?"
                      required
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Productivity Rating (1-5)</label>
                  <select
                    value={selfEval.productivity}
                    onChange={(e) => setSelfEval({ ...selfEval, productivity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                  >
                    <option value="1">1 - Very Low</option>
                    <option value="2">2 - Low</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - High</option>
                    <option value="5">5 - Very High</option>
                  </select>
                </div>

                  <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Self-Evaluation'}
                </button>
                  </div>
              </form>
            </div>
          )}

          {activeTab === 'my-logs' && (
              <div className="space-y-6">
                {myLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No daily logs</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by submitting your first daily log.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                        {myLogs.map((log, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                                  📅 {log.log_date ? new Date(log.log_date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  }) : 'No date'}
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
                        ))}
                      </div>
                )}
                          </div>
                        )}

            {activeTab === 'my-evaluations' && (
              <div className="space-y-6">
                {myEvaluations.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No evaluations</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by submitting your first weekly self-evaluation.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {myEvaluations.map((evaluation, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                                  📊 Week: {evaluation.week_start_date && evaluation.week_end_date ? 
                                    `${new Date(evaluation.week_start_date).toLocaleDateString()} - ${new Date(evaluation.week_end_date).toLocaleDateString()}` : 
                                    'Date not specified'}
                          </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Submitted on {formatLocalDate(evaluation.created_at)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              evaluation.productivity >= 4 
                                    ? 'bg-green-500 text-white' 
                                : evaluation.productivity >= 3 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-red-500 text-white'
                                }`}>
                              ⭐ {evaluation.productivity || 'N/A'}/5
                          </span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">🏆 Key Accomplishments</p>
                            <p className="text-green-800 dark:text-green-200">{evaluation.accomplishments || 'No accomplishments listed'}</p>
                              </div>
                              
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">🎯 Key Learnings</p>
                            <p className="text-blue-800 dark:text-blue-200">{evaluation.learnings || 'No learnings noted'}</p>
                              </div>
                              
                              {evaluation.challenges && (
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
                                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">⚠️ Challenges</p>
                              <p className="text-orange-800 dark:text-orange-200">{evaluation.challenges}</p>
                                </div>
                              )}
                              
                              {evaluation.goals && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">🎯 Goals for Next Week</p>
                              <p className="text-purple-800 dark:text-purple-200">{evaluation.goals}</p>
                                </div>
                              )}
                            </div>
                            
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Submitted: {formatLocalDateTime(evaluation.created_at || evaluation.timestamp)}
                          </p>
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
    </div>
  );
};

export default InternDashboard; 