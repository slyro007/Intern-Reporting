import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    internName: 'Srujan Jalagam',
    projectDescription: '',
    tasksCompleted: '',
    timeSpent: '',
    challenges: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({ summary: false, report: false });
  const [message, setMessage] = useState('');

  // Mock user for now (replace with real auth later)
  const user = {
    id: '1',
    name: 'Srujan Jalagam',
    email: 'srujan@wolfflogics.com'
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const webhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/intern-logs';
      
      await axios.post(webhookUrl, {
        ...formData,
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
        timestamp: new Date().toISOString(),
        week: getWeekNumber(new Date(formData.date))
      });

      setMessage('Log entry submitted successfully!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        internName: user?.name || '',
        projectDescription: '',
        tasksCompleted: '',
        timeSpent: '',
        challenges: '',
        notes: ''
      });
    } catch (error) {
      setMessage('Error submitting log entry. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklySummary = async () => {
    setAiLoading({ ...aiLoading, summary: true });
    try {
      const response = await axios.post('http://localhost:5678/webhook/generate-weekly-summary', {});
      setMessage(`Weekly summary generated successfully: ${response.data.fileName}`);
    } catch (error) {
      setMessage('Error generating weekly summary. Please try again.');
      console.error('Error generating summary:', error);
    } finally {
      setAiLoading({ ...aiLoading, summary: false });
    }
  };

  const generateFinalReport = async (reportPeriod = 'full') => {
    setAiLoading({ ...aiLoading, report: true });
    try {
      const response = await axios.post('http://localhost:5678/webhook/generate-final-report', {
        userEmail: user?.email,
        reportPeriod: reportPeriod
      });
      setMessage(`Final report generated successfully: ${response.data.fileName}`);
    } catch (error) {
      setMessage('Error generating final report. Please try again.');
      console.error('Error generating report:', error);
    } finally {
      setAiLoading({ ...aiLoading, report: false });
    }
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img 
                  src="/logo.png" 
                  alt="Wolff Logics Logo" 
                  className="h-16 w-auto mr-4 rounded-lg shadow-md"
                />
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">Wolff Logics</h1>
                  <p className="text-blue-100 text-lg">Daily Log System</p>
                </div>
              </div>
              
              {/* User Info */}
              <div className="text-right">
                <p className="text-white font-medium">{user?.name}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-blue-50 text-sm">Track daily progress, tasks, and professional development</p>
            </div>
          </div>

          <div className="px-8 py-8">
            {message && (
              <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border-red-400' 
                  : 'bg-green-50 text-green-700 border-green-400'
              }`}>
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${
                    message.includes('Error') ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {message.includes('Error') ? (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{message}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Card */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="internName" className="block text-sm font-medium text-gray-700 mb-2">
                      Team Member
                    </label>
                    <select
                      id="internName"
                      name="internName"
                      value={formData.internName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    >
                      <option value="Srujan Jalagam">Srujan Jalagam</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timeSpent" className="block text-sm font-medium text-gray-700 mb-2">
                      Time Spent (hours)
                    </label>
                    <input
                      type="number"
                      id="timeSpent"
                      name="timeSpent"
                      value={formData.timeSpent}
                      onChange={handleChange}
                      step="0.5"
                      min="0"
                      max="24"
                      required
                      placeholder="e.g., 8"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Project Work Card */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Project Work
                </h3>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Project/Area Worked On
                    </label>
                    <input
                      type="text"
                      id="projectDescription"
                      name="projectDescription"
                      value={formData.projectDescription}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Computer setups with immy.bot, Client deployments, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="tasksCompleted" className="block text-sm font-medium text-gray-700 mb-2">
                      Tasks Completed Today
                    </label>
                    <textarea
                      id="tasksCompleted"
                      name="tasksCompleted"
                      value={formData.tasksCompleted}
                      onChange={handleChange}
                      required
                      rows="4"
                      placeholder="List the specific tasks you completed today..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Challenges & Learning Card */}
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Challenges & Learning
                </h3>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="challenges" className="block text-sm font-medium text-gray-700 mb-2">
                      Challenges Encountered
                    </label>
                    <textarea
                      id="challenges"
                      name="challenges"
                      value={formData.challenges}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Any issues, roadblocks, or difficulties faced today..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes/Learnings
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Key learnings, observations, or other notes..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95 shadow-lg font-semibold text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Log Entry...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Daily Log
                    </div>
                  )}
                </button>
              </div>
            </form>

            {/* AI Report Generation Section */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AI Report Generation
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Generate professional summaries and reports using AI analysis of your logged data.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={generateWeeklySummary}
                  disabled={aiLoading.summary}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95 shadow-md font-medium"
                >
                  {aiLoading.summary ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Generate Weekly Summary
                    </>
                  )}
                </button>

                <button
                  onClick={() => generateFinalReport('full')}
                  disabled={aiLoading.report}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95 shadow-md font-medium"
                >
                  {aiLoading.report ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      Generate Final Report
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p><strong>Weekly Summary:</strong> AI analysis of the past 7 days of logged activities</p>
                <p><strong>Final Report:</strong> Comprehensive performance report analyzing all historical data</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Wolff Logics MSP - Team Progress Tracking System
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 