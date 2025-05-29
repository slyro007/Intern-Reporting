const axios = require('axios');

// n8n API configuration
const N8N_BASE_URL = 'http://localhost:5678/api/v1';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

// Create axios instance with API key authentication
const n8nApi = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
  }
});

class N8nApiClient {
  constructor() {
    this.api = n8nApi;
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await this.api.get('/workflows');
      console.log('✅ n8n API connection successful!');
      console.log(`Found ${response.data.data.length} workflows`);
      return true;
    } catch (error) {
      console.error('❌ n8n API connection failed:', error.response?.status, error.response?.statusText);
      if (error.response?.data) {
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  }

  // Get all workflows
  async getWorkflows() {
    try {
      const response = await this.api.get('/workflows');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching workflows:', error.message);
      throw error;
    }
  }

  // Get specific workflow by ID
  async getWorkflow(workflowId) {
    try {
      const response = await this.api.get(`/workflows/${workflowId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  // Create a new workflow
  async createWorkflow(workflowData) {
    try {
      const response = await this.api.post('/workflows', workflowData);
      console.log(`✅ Created workflow: ${response.data.data.name}`);
      return response.data.data;
    } catch (error) {
      console.error('Error creating workflow:', error.message);
      throw error;
    }
  }

  // Update existing workflow
  async updateWorkflow(workflowId, workflowData) {
    try {
      const response = await this.api.put(`/workflows/${workflowId}`, workflowData);
      console.log(`✅ Updated workflow: ${response.data.data.name}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  // Activate/Deactivate workflow
  async setWorkflowActive(workflowId, active = true) {
    try {
      const response = await this.api.patch(`/workflows/${workflowId}`, { active });
      console.log(`✅ Workflow ${workflowId} ${active ? 'activated' : 'deactivated'}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error setting workflow ${workflowId} active state:`, error.message);
      throw error;
    }
  }

  // Execute a workflow
  async executeWorkflow(workflowId, data = {}) {
    try {
      const response = await this.api.post(`/workflows/${workflowId}/execute`, { data });
      console.log(`✅ Executed workflow ${workflowId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error executing workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  // Get workflow executions
  async getExecutions(workflowId, limit = 10) {
    try {
      const response = await this.api.get(`/executions`, {
        params: { workflowId, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching executions:', error.message);
      throw error;
    }
  }

  // Get logs from the data directory (custom endpoint)
  async getLogs(dateFilter = '', internFilter = '') {
    try {
      // This would call a custom webhook we'll create
      const response = await axios.get('http://localhost:5678/webhook/get-logs', {
        params: { dateFilter, internFilter }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error.message);
      throw error;
    }
  }

  // Generate weekly summary (custom endpoint)
  async generateWeeklySummary(startDate, endDate) {
    try {
      const response = await axios.post('http://localhost:5678/webhook/generate-weekly-summary', {
        startDate,
        endDate
      });
      return response.data;
    } catch (error) {
      console.error('Error generating weekly summary:', error.message);
      throw error;
    }
  }

  // Generate final report (custom endpoint)
  async generateFinalReport(internEmail, reportPeriod = 'full') {
    try {
      const response = await axios.post('http://localhost:5678/webhook/generate-final-report', {
        internEmail,
        reportPeriod
      });
      return response.data;
    } catch (error) {
      console.error('Error generating final report:', error.message);
      throw error;
    }
  }
}

// Example usage
async function main() {
  const client = new N8nApiClient();
  
  // Test connection
  const connected = await client.testConnection();
  if (!connected) {
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure n8n is running: docker-compose ps');
    console.log('2. Restart n8n with new config: docker-compose restart n8n');
    console.log('3. Check n8n logs: docker-compose logs n8n');
    console.log('4. Verify API key in n8n Settings > API');
    process.exit(1);
  }

  try {
    // List all workflows
    const workflows = await client.getWorkflows();
    console.log('\n📋 Current Workflows:');
    workflows.forEach(workflow => {
      console.log(`  • ${workflow.name} (ID: ${workflow.id}) - ${workflow.active ? '✅ Active' : '❌ Inactive'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Export for use in other modules
module.exports = N8nApiClient;

// Run if called directly
if (require.main === module) {
  main();
} 