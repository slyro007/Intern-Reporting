# 🔨 Manual Workflow Creation Guide

## 🎯 Why Manual Creation?

The imported workflows aren't registering their webhooks properly. Manual creation in the n8n UI ensures 100% webhook registration success.

## 📋 Step-by-Step Instructions

### Step 1: Open n8n Interface
1. Go to `http://localhost:5678`
2. You should see the n8n interface with existing workflows

### Step 2: Create "Simple Working Logs" Workflow

1. **Click "+ New workflow" button**
2. **Add Webhook Node:**
   - Drag "Webhook" node from the left panel
   - Click on the Webhook node to configure it
   - Set **HTTP Method**: `POST`
   - Set **Path**: `simple-logs-post`
   - Leave other options as default
   - Click "Save"

3. **Add Code Node:**
   - Drag "Code" node from the left panel
   - Connect the Webhook node to the Code node
   - Click on the Code node
   - Replace the code with:

```javascript
// Save the log data to a file
const fs = require('fs');
const path = require('path');

// Get the data from the webhook
const logData = $input.first().json;

// Create filename based on date and intern name
const date = logData.date || new Date().toISOString().split('T')[0];
const internName = (logData.internName || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `${date}_${internName}_${timestamp}.json`;

// Ensure logs directory exists
const logsDir = '/data/logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add metadata to the log
const logWithMeta = {
  ...logData,
  id: `${date}_${timestamp}`,
  savedAt: new Date().toISOString(),
  filename: filename
};

// Save to file
const filepath = path.join(logsDir, filename);
fs.writeFileSync(filepath, JSON.stringify(logWithMeta, null, 2));

console.log('Saved log to:', filepath);

return [{
  json: {
    status: 'success',
    message: 'Daily log saved successfully',
    filename: filename,
    logId: logWithMeta.id,
    savedAt: logWithMeta.savedAt
  }
}];
```

4. **Add Respond to Webhook Node:**
   - Drag "Respond to Webhook" node
   - Connect the Code node to this node
   - Click on it and set:
     - **Respond With**: `JSON`
     - **Response Body**: `={{ JSON.stringify($json) }}`

5. **Save and Activate:**
   - Click "Save" button (top right)
   - Name it: `Simple Working Logs Manual`
   - Toggle the "Active" switch to ON
   - You should see ✅ next to the workflow name

### Step 3: Create "Simple Get Logs" Workflow

1. **Click "+ New workflow" button**
2. **Add Webhook Node:**
   - Drag "Webhook" node
   - Configure it:
     - **HTTP Method**: `GET`
     - **Path**: `simple-logs-get`
   - Click "Save"

3. **Add Code Node:**
   - Connect Webhook to Code node
   - Replace code with:

```javascript
// Read log files for a specific intern
const fs = require('fs');
const path = require('path');

// Get email from query parameters
const webhookData = $input.first().json;
console.log('Webhook data received:', JSON.stringify(webhookData, null, 2));

// Try different ways to get the email parameter
let internEmail = 'unknown';
if (webhookData.query && webhookData.query.email) {
  internEmail = webhookData.query.email;
} else if (webhookData.email) {
  internEmail = webhookData.email;
} else if (webhookData.params && webhookData.params.email) {
  internEmail = webhookData.params.email;
}

console.log('Searching for logs with email:', internEmail);

// Read logs directory
const logsDir = '/data/logs';
let logs = [];

try {
  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir);
    console.log(`Found ${files.length} files in logs directory`);
    
    for (const file of files) {
      if (file.endsWith('.json') && file !== '.gitkeep') {
        try {
          const filepath = path.join(logsDir, file);
          const content = fs.readFileSync(filepath, 'utf8');
          const logData = JSON.parse(content);
          
          console.log(`File ${file} - internEmail: ${logData.internEmail}`);
          
          // Filter by intern email
          if (logData.internEmail === internEmail) {
            logs.push(logData);
            console.log(`✅ Matched log from ${file}`);
          }
        } catch (err) {
          console.error('Error reading file:', file, err.message);
        }
      }
    }
  } else {
    console.log('Logs directory does not exist:', logsDir);
  }
  
  // Sort logs by date (newest first)
  logs.sort((a, b) => new Date(b.date || b.savedAt) - new Date(a.date || a.savedAt));
  
  console.log(`Found ${logs.length} logs for ${internEmail}`);
  
} catch (error) {
  console.error('Error reading logs:', error.message);
}

return [{
  json: {
    status: 'success',
    message: 'Logs retrieved successfully',
    data: logs,
    internEmail: internEmail,
    count: logs.length
  }
}];
```

4. **Add Respond to Webhook Node:**
   - Connect Code to "Respond to Webhook"
   - Configure: **Respond With**: `JSON`, **Response Body**: `={{ JSON.stringify($json) }}`

5. **Save and Activate:**
   - Save as: `Simple Get Logs Manual`
   - Toggle Active switch to ON

### Step 4: Deactivate Old Workflows

1. **Find the old imported workflows:**
   - Look for "Simple Working Logs" (ID: AZBKmrrkT0kf7Zc1)
   - Look for "Simple Get Logs" (ID: J2nEFsNeiupZQ3Sf)

2. **Deactivate them:**
   - Click on each workflow
   - Toggle the "Active" switch to OFF
   - This prevents conflicts with the new manual workflows

### Step 5: Test the New Workflows

After creating both manual workflows, test them:

1. **Open browser to**: `http://localhost:3002`
2. **Login** with intern credentials
3. **Submit a daily log**
4. **Check "My Logs"** section

## ✅ Success Indicators

You'll know it worked when:
- ✅ No "Failed to submit daily log" error
- ✅ Success message appears after submission
- ✅ Logs appear in "My Logs" section
- ✅ Files are created in `/data/logs/` directory

## 🔧 If You Need Help

If you encounter any issues:
1. Check that webhook paths are exactly: `simple-logs-post` and `simple-logs-get`
2. Ensure both workflows are marked as "Active" with ✅
3. Verify the old imported workflows are deactivated
4. Test by running: `node check-workflows.js`

The manual workflows should register their webhooks immediately upon activation! 