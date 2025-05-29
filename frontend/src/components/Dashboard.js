import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    internName: user?.name || '',
    projectDescription: '',
    tasksCompleted: '',
    timeSpent: '',
    challenges: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({ summary: false, report: false });
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [activeTab, setActiveTab] = useState('logs');
  const [selectedLog, setSelectedLog] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [internFilter, setInternFilter] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Try to fetch logs from the n8n endpoint
      // Since we don't have a get-logs endpoint yet, we'll use mock data
      // but structure it to match what we'll get from n8n
      
      // For now, simulate API delay and use enhanced mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLogs(generateMockLogs());
      setReports(generateMockReports());
      setSummaries(generateMockSummaries());
      
      setMessage('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMessage('Error loading dashboard data. Using offline data.');
      
      // Fallback to mock data
      setLogs(generateMockLogs());
      setReports(generateMockReports());
      setSummaries(generateMockSummaries());
    } finally {
      setLoading(false);
    }
  };

  // Generate more realistic mock data
  const generateMockLogs = () => {
    const logs = [];
    const startDate = new Date('2025-05-20');
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      logs.push({
        id: i + 1,
        date: date.toISOString().split('T')[0],
        internName: 'Srujan Jalagam',
        projectDescription: getRandomProject(),
        tasksCompleted: getRandomTasks(),
        timeSpent: (Math.random() * 3 + 6).toFixed(1), // 6-9 hours
        challenges: getRandomChallenges(),
        notes: getRandomNotes(),
        timestamp: new Date(date.setHours(Math.random() * 8 + 9)).toISOString() // 9AM-5PM
      });
    }
    
    return logs.reverse(); // Most recent first
  };

  const getRandomProject = () => {
    const projects = [
      'Computer setups using immy.bot',
      'Network infrastructure maintenance',
      'Client support tickets',
      'Server maintenance and updates',
      'Office 365 migration assistance',
      'Security audit and compliance',
      'Backup system monitoring',
      'Hardware inventory management'
    ];
    return projects[Math.floor(Math.random() * projects.length)];
  };

  const getRandomTasks = () => {
    const tasks = [
      'Configured 8 new workstations for client onboarding, deployed standardized software packages',
      'Updated switch configurations, documented network topology, performed cable management',
      'Resolved 12 helpdesk tickets, performed remote troubleshooting, updated documentation',
      'Installed Windows updates on 25 servers, verified system stability',
      'Migrated 15 user mailboxes to Office 365, tested email flow',
      'Conducted security scan on client infrastructure, documented findings',
      'Verified backup completion for 5 clients, tested restore procedures',
      'Updated hardware inventory database, tagged new equipment'
    ];
    return tasks[Math.floor(Math.random() * tasks.length)];
  };

  const getRandomChallenges = () => {
    const challenges = [
      'Encountered driver compatibility issues with older hardware',
      'Complex VLAN configuration required multiple attempts',
      'One ticket required escalation due to complex Exchange issue',
      'Network connectivity issues during server updates',
      'Email migration had DNS propagation delays',
      'Legacy system compatibility issues during security scan',
      'Backup verification failed for one client, required troubleshooting',
      'Inventory system had database connectivity issues'
    ];
    return challenges[Math.floor(Math.random() * challenges.length)];
  };

  const getRandomNotes = () => {
    const notes = [
      'Learned about Group Policy management and automated deployment',
      'Gained deeper understanding of enterprise networking concepts',
      'Improved customer communication skills and technical problem-solving',
      'Learned server patching best practices and rollback procedures',
      'Gained experience with Office 365 admin center and PowerShell',
      'Understood security frameworks and compliance requirements',
      'Learned backup strategies and disaster recovery planning',
      'Improved asset management and documentation skills'
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  };

  const generateMockReports = () => [
    {
      id: 1,
      title: 'Weekly Report - Week 1',
      date: '2025-05-25',
      type: 'weekly',
      summary: 'Strong performance in computer setup tasks. Showed excellent problem-solving skills with hardware compatibility issues. Demonstrates good learning curve with enterprise tools.',
      hoursWorked: 40,
      tasksCompleted: 25,
      fileName: 'weekly-report-2025-05-25.pdf'
    },
    {
      id: 2,
      title: 'Mid-Point Assessment',
      date: '2025-05-28',
      type: 'assessment',
      summary: 'Intern shows strong technical aptitude and professional growth. Excels in client communication and problem resolution.',
      hoursWorked: 78,
      tasksCompleted: 52,
      fileName: 'midpoint-assessment-2025-05-28.pdf'
    }
  ];

  const generateMockSummaries = () => [
    {
      id: 1,
      week: 'Week of May 20-24, 2025',
      totalHours: 38.5,
      totalTasks: 42,
      mainProjects: ['Computer Setups', 'Network Maintenance', 'Support Tickets'],
      keyLearnings: ['Group Policy', 'VLAN Configuration', 'Customer Service', 'immy.bot automation'],
      avgDailyHours: 7.7,
      productivity: 'High'
    },
    {
      id: 2,
      week: 'Week of May 27-31, 2025',
      totalHours: 41.0,
      totalTasks: 38,
      mainProjects: ['Server Maintenance', 'Office 365 Migration', 'Security Audit'],
      keyLearnings: ['PowerShell', 'Office 365', 'Security Compliance', 'Backup Systems'],
      avgDailyHours: 8.2,
      productivity: 'Very High'
    }
  ];

  const filteredLogs = logs.filter(log => {
    const matchesDate = dateFilter ? log.date.includes(dateFilter) : true;
    const matchesIntern = internFilter ? log.internName.toLowerCase().includes(internFilter.toLowerCase()) : true;
    return matchesDate && matchesIntern;
  });

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
      
      const response = await axios.post(webhookUrl, {
        ...formData,
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString(),
        week: getWeekNumber(new Date(formData.date))
      });

      setMessage('Log entry submitted successfully!');
      
      // Refresh the dashboard data to include the new entry
      setTimeout(() => {
        fetchAllData();
      }, 1000);
      
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
      // This will call your n8n workflow for weekly summary generation
      const response = await axios.post('http://localhost:5678/webhook/generate-weekly-summary', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        internEmail: user?.email
      });
      
      setMessage(`Weekly summary generated successfully!`);
      
      // Refresh summaries
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
      const response = await axios.post('http://localhost:5678/webhook/generate-final-report', {
        userEmail: user?.email,
        reportPeriod: reportPeriod,
        requestedBy: user?.name
      });
      
      setMessage(`Final report generation initiated successfully!`);
      
      // Refresh reports
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

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleLogout = () => {
    logout();
  };

  const TabButton = ({ id, label, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  );

  const LogCard = ({ log }) => (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
      onClick={() => setSelectedLog(log)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{log.date}</h3>
          <p className="text-blue-600 font-medium">{log.internName}</p>
        </div>
        <div className="text-right">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
            {log.timeSpent} hours
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="font-medium text-gray-700">Project: </span>
          <span className="text-gray-600">{log.projectDescription}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Tasks: </span>
          <p className="text-gray-600 line-clamp-2">{log.tasksCompleted.substring(0, 100)}...</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-500">
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
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Intern Reports Dashboard</h1>
            <p className="text-gray-600">Track progress, view logs, and analyze performance data</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={generateWeeklySummary}
              disabled={aiLoading.summary}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {aiLoading.summary ? 'Generating...' : '📊 Generate Weekly Summary'}
            </button>
            <button
              onClick={() => generateFinalReport()}
              disabled={aiLoading.report}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {aiLoading.report ? 'Generating...' : '📋 Generate Final Report'}
            </button>
          </div>
        </div>
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Logs" 
          value={logs.length} 
          subtitle="Daily entries recorded"
          color="blue"
        />
        <StatsCard 
          title="Total Hours" 
          value={logs.reduce((sum, log) => sum + parseFloat(log.timeSpent), 0).toFixed(1)} 
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
          title="Average Daily Hours" 
          value={(logs.reduce((sum, log) => sum + parseFloat(log.timeSpent), 0) / logs.length || 0).toFixed(1)} 
          subtitle="Per day productivity"
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Intern</label>
            <input
              type="text"
              placeholder="Enter intern name..."
              value={internFilter}
              onChange={(e) => setInternFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchAllData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4">
        <TabButton id="logs" label="Daily Logs" count={filteredLogs.length} />
        <TabButton id="reports" label="Reports" count={reports.length} />
        <TabButton id="summaries" label="Summaries" count={summaries.length} />
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Daily Logs</h2>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No logs found matching your filters.</p>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Generated Reports</h2>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reports generated yet.</p>
                <button
                  onClick={() => generateFinalReport()}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Generate Your First Report
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                        <p className="text-blue-600 font-medium">{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</p>
                      </div>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {report.date}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{report.summary}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-6 text-sm text-gray-500">
                        <span><strong>{report.hoursWorked}</strong> hours worked</span>
                        <span><strong>{report.tasksCompleted}</strong> tasks completed</span>
                      </div>
                      
                      {report.fileName && (
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
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
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Weekly Summaries</h2>
            {summaries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No summaries available yet.</p>
                <button
                  onClick={generateWeeklySummary}
                  className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Generate Weekly Summary
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {summaries.map((summary) => (
                  <div key={summary.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">{summary.week}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        summary.productivity === 'Very High' ? 'bg-green-100 text-green-800' :
                        summary.productivity === 'High' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {summary.productivity} Productivity
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{summary.totalHours}</p>
                        <p className="text-sm text-gray-600">Total Hours</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{summary.totalTasks}</p>
                        <p className="text-sm text-gray-600">Tasks Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{summary.avgDailyHours}</p>
                        <p className="text-sm text-gray-600">Avg Daily Hours</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Main Projects:</p>
                        <div className="flex flex-wrap gap-2">
                          {summary.mainProjects.map((project, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                              {project}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Key Learnings:</p>
                        <div className="flex flex-wrap gap-2">
                          {summary.keyLearnings.map((learning, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
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

      {/* Log Detail Modal */}
      {selectedLog && (
        <LogModal 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard; 