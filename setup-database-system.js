const axios = require('axios');
const fs = require('fs');

const N8N_BASE_URL = 'http://localhost:5678/api/v1';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjQ0NzkxMy00ZGEzLTQwYjItYWYwNC04NzgxMmQzMjUyNDEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4NTM3NDk4fQ.yWJUDoDwRmEgrdRFC8KGgA7EWoG75_jysj2equeOJ4Q';

const api = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
  }
});

async function setupDatabaseSystem() {
  console.log('🚀 Setting up database-powered intern tracking system...\n');
  
  try {
    // Step 1: Start containers with database
    console.log('1️⃣ Starting containers with database...');
    console.log('   Please run: docker-compose up -d');
    console.log('   Waiting for you to confirm containers are running...');
    console.log('   Press Ctrl+C if containers fail to start, otherwise wait 30 seconds...\n');
    
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Step 2: Test database connection
    console.log('2️⃣ Testing database connection...');
    try {
      const dbTest = await axios.get('http://localhost:8080');
      console.log('   ✅ Adminer (database admin) accessible at http://localhost:8080');
    } catch (error) {
      console.log('   ⚠️  Adminer not accessible yet, but continuing...');
    }
    
    // Step 3: Import database workflows
    console.log('\n3️⃣ Importing database workflows...');
    
    // Import daily logs workflow
    const dailyLogsWorkflow = JSON.parse(fs.readFileSync('./n8n-workflows/database-daily-logs-workflow.json', 'utf8'));
    try {
      const createdDaily = await api.post('/workflows', dailyLogsWorkflow);
      const dailyId = createdDaily.data.data.id;
      console.log(`   ✅ Created "Database Daily Logs Workflow" (ID: ${dailyId})`);
      
      // Activate the workflow
      await api.post(`/workflows/${dailyId}/activate`);
      console.log(`   ✅ Activated daily logs workflow`);
      
    } catch (error) {
      console.log('   ⚠️  Daily logs workflow may already exist or need manual setup');
    }
    
    // Import get logs workflow  
    const getLogsWorkflow = JSON.parse(fs.readFileSync('./n8n-workflows/database-get-logs-workflow.json', 'utf8'));
    try {
      const createdGet = await api.post('/workflows', getLogsWorkflow);
      const getId = createdGet.data.data.id;
      console.log(`   ✅ Created "Database Get Logs Workflow" (ID: ${getId})`);
      
      // Activate the workflow
      await api.post(`/workflows/${getId}/activate`);
      console.log(`   ✅ Activated get logs workflow`);
      
    } catch (error) {
      console.log('   ⚠️  Get logs workflow may already exist or need manual setup');
    }
    
    // Step 4: Test the new endpoints
    console.log('\n4️⃣ Testing new database endpoints...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      const testSubmit = await axios.post('http://localhost:5678/webhook/daily-logs-db', {
        internEmail: 'sjalagam@wolfflogics.com',
        internName: 'Sujith Jalagam',
        date: '2024-01-30',
        projectDescription: 'Testing database integration',
        tasksCompleted: 'Successfully set up database system',
        timeSpent: '2.0',
        challenges: 'None - system working well',
        notes: 'Database system is much more reliable than file storage'
      });
      console.log('   ✅ Daily log submission endpoint working!');
    } catch (error) {
      if (error.response?.status === 500) {
        console.log('   ⚠️  Endpoint exists but may need database credentials configured');
      } else {
        console.log('   ❌ Daily log endpoint test failed:', error.message);
      }
    }
    
    try {
      const testGet = await axios.get('http://localhost:5678/webhook/get-logs-db?email=sjalagam@wolfflogics.com');
      console.log('   ✅ Get logs endpoint working!');
    } catch (error) {
      if (error.response?.status === 500) {
        console.log('   ⚠️  Get logs endpoint exists but may need database credentials configured');
      } else {
        console.log('   ❌ Get logs endpoint test failed:', error.message);
      }
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Configure database credentials in n8n:');
    console.log('   - Go to http://localhost:5678');
    console.log('   - Go to Settings > Credentials');
    console.log('   - Add new PostgreSQL credential with these settings:');
    console.log('     Host: database');
    console.log('     Port: 5432');
    console.log('     Database: intern_tracker');
    console.log('     User: intern_user');
    console.log('     Password: intern_password123');
    console.log('');
    console.log('2. Update the database workflows to use this credential');
    console.log('3. Restart the frontend with: docker-compose restart frontend');
    console.log('4. Test log submission at http://localhost:3002');
    console.log('');
    console.log('5. Optional: Access database admin at http://localhost:8080');
    console.log('   - Server: database');
    console.log('   - Username: intern_user');
    console.log('   - Password: intern_password123');
    console.log('   - Database: intern_tracker');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

if (require.main === module) {
  setupDatabaseSystem();
} 