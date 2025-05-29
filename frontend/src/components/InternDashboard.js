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
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      // Try to fetch the intern's own logs and evaluations
      const [logsResponse, evalsResponse] = await Promise.allSettled([
        axios.get(`http://localhost:5678/webhook/get-intern-logs?email=${user?.email}`),
        axios.get(`http://localhost:5678/webhook/get-intern-evaluations?email=${user?.email}`)
      ]);

      // Set logs data if successful, otherwise empty array
      if (logsResponse.status === 'fulfilled' && logsResponse.value.data) {
        setMyLogs(Array.isArray(logsResponse.value.data) ? logsResponse.value.data : []);
      } else {
        setMyLogs([]);
      }

      // Set evaluations data if successful, otherwise empty array
      if (evalsResponse.status === 'fulfilled' && evalsResponse.value.data) {
        setMyEvaluations(Array.isArray(evalsResponse.value.data) ? evalsResponse.value.data : []);
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

      // Refresh data after successful submission
      setTimeout(() => {
        fetchMyData();
      }, 1000);
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

      // Refresh data after successful submission
      setTimeout(() => {
        fetchMyData();
      }, 1000);
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

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
    >
      {isDarkMode ? (
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Intern Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Intern Dashboard 👨‍💻</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your daily progress and submit your work logs</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Welcome, {user?.name || 'Intern'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">{user?.role}</p>
              </div>
              
              <ThemeToggle />
              
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
              message.includes('Failed') || message.includes('Error')
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Intern Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <TabButton id="submit-log" label="📝 Submit Daily Log" />
          <TabButton id="self-eval" label="📊 Weekly Self-Evaluation" />
          <TabButton id="my-logs" label="📋 My Logs" />
        </div>

        {/* Intern Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          {activeTab === 'submit-log' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Submit Daily Log</h2>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Daily Log'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'self-eval' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Weekly Self-Evaluation</h2>
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
                    placeholder="What do you want to focus on or accomplish next week?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Self-Rated Productivity (1-5)</label>
                  <select
                    value={selfEval.productivity}
                    onChange={(e) => setSelfEval({ ...selfEval, productivity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="1">1 - Very Low</option>
                    <option value="2">2 - Low</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - High</option>
                    <option value="5">5 - Very High</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Self-Evaluation'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'my-logs' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">My Submissions</h2>
              
              {/* My Daily Logs */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Daily Logs</h3>
                {myLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">No daily logs yet</h4>
                    <p className="text-gray-500 dark:text-gray-400">Your submitted daily logs will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myLogs.map((log, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-md font-semibold text-gray-800 dark:text-white">{log.date}</h4>
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
                            {log.timeSpent}h
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          <strong>Project:</strong> {log.projectDescription}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          <strong>Tasks:</strong> {log.tasksCompleted}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My Self Evaluations */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Self-Evaluations</h3>
                {myEvaluations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">No evaluations yet</h4>
                    <p className="text-gray-500 dark:text-gray-400">Your submitted self-evaluations will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myEvaluations.map((evaluation, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-md font-semibold text-gray-800 dark:text-white">
                            {evaluation.weekStartDate} - {evaluation.weekEndDate}
                          </h4>
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-sm">
                            Productivity: {evaluation.productivity}/5
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          <strong>Key Accomplishments:</strong> {evaluation.accomplishments}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">📋 Quick Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <p><strong>Daily Logs:</strong> Submit these every day you work. Be specific about tasks and time spent.</p>
              <p className="mt-2"><strong>Time Tracking:</strong> Include breaks in your total time, but note them in additional notes.</p>
            </div>
            <div>
              <p><strong>Self-Evaluations:</strong> Complete these weekly to reflect on your progress and set goals.</p>
              <p className="mt-2"><strong>Questions?</strong> Contact your supervisor or admin for any assistance needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternDashboard; 