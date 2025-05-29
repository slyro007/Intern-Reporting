const { exec } = require('child_process');
const axios = require('axios');

async function cleanDatabase() {
    console.log('🧹 Cleaning fake data from database...\n');
    
    try {
        // Delete fake data
        const deleteCommand = `docker exec internreports-database-1 psql -U intern_user -d intern_tracker -c "DELETE FROM daily_logs WHERE intern_name IN ('Sujith Jalagam', 'Srujan Jalagam');"`;
        
        await new Promise((resolve, reject) => {
            exec(deleteCommand, (error, stdout, stderr) => {
                if (error) {
                    console.log('❌ Error deleting fake data:', error.message);
                    reject(error);
                } else {
                    console.log('✅ Fake data deleted successfully');
                    console.log('Output:', stdout);
                    resolve();
                }
            });
        });
        
        // Check what's left
        const countCommand = `docker exec internreports-database-1 psql -U intern_user -d intern_tracker -c "SELECT COUNT(*) FROM daily_logs;"`;
        
        await new Promise((resolve) => {
            exec(countCommand, (error, stdout, stderr) => {
                if (error) {
                    console.log('❌ Error counting rows:', error.message);
                } else {
                    console.log('📊 Remaining entries in database:');
                    console.log(stdout);
                }
                resolve();
            });
        });
        
        // Show any remaining entries
        const selectCommand = `docker exec internreports-database-1 psql -U intern_user -d intern_tracker -c "SELECT intern_name, intern_email, log_date, project_description, created_at FROM daily_logs ORDER BY created_at DESC;"`;
        
        await new Promise((resolve) => {
            exec(selectCommand, (error, stdout, stderr) => {
                if (error) {
                    console.log('❌ Error selecting data:', error.message);
                } else {
                    console.log('📋 Current database entries:');
                    console.log(stdout);
                }
                resolve();
            });
        });
        
    } catch (error) {
        console.log('❌ Database cleaning error:', error.message);
    }
    
    // Test if submission workflow is working
    console.log('\n🧪 Testing daily log submission...');
    try {
        const testLog = {
            internEmail: 'srujan@test.com',
            internName: 'Srujan Test',
            date: '2025-01-30',
            projectDescription: 'Real test submission',
            tasksCompleted: 'Testing database save',
            timeSpent: '2',
            challenges: 'None',
            notes: 'This should save to database',
            timestamp: new Date().toISOString()
        };
        
        const response = await axios.post('http://localhost:5678/webhook/daily-logs-db', testLog);
        console.log('✅ Submission response:', response.status, response.data);
        
        // Check if it actually saved
        setTimeout(async () => {
            const checkCommand = `docker exec internreports-database-1 psql -U intern_user -d intern_tracker -c "SELECT intern_name, project_description, created_at FROM daily_logs WHERE intern_name = 'Srujan Test';"`;
            
            exec(checkCommand, (error, stdout, stderr) => {
                if (error) {
                    console.log('❌ Error checking saved data:', error.message);
                } else {
                    console.log('\n📊 Test submission check:');
                    console.log(stdout);
                    if (stdout.includes('Srujan Test')) {
                        console.log('✅ SUCCESS: Test submission was saved to database!');
                    } else {
                        console.log('❌ FAILED: Test submission was NOT saved to database');
                    }
                }
            });
        }, 2000);
        
    } catch (error) {
        console.log('❌ Submission test failed:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

cleanDatabase(); 