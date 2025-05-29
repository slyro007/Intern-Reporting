# Manual Self-Evaluation Workflow Setup

## Part A: Submit Self-Evaluation Workflow

### Step 1: Create New Workflow in n8n

1. Open n8n UI: http://localhost:5678
2. Click "+ Add workflow" 
3. Name it: "Self Evaluation DB Working"

### Step 2: Add Webhook Node

1. Click "+" to add node
2. Search for "Webhook" and select it
3. Configure webhook:
   - **HTTP Method**: POST
   - **Path**: `submit-self-evaluation`
   - **Response Mode**: `Response Node`
   - Click "Save"

### Step 3: Add PostgreSQL Node

1. Click "+" after webhook node
2. Search for "Postgres" and select it
3. Configure PostgreSQL:
   - **Operation**: Insert
   - **Schema**: public
   - **Table**: self_evaluations
   - **Credentials**: Use existing "Intern Database" or create new:
     - Host: database
     - Port: 5432
     - Database: intern_tracker
     - User: intern_user
     - Password: intern_password123

### Step 4: Configure Field Mapping

In the PostgreSQL node, set **Values to Send** to "Define Below" and map:

| Database Field | Expression |
|----------------|------------|
| intern_email | `{{ $('Webhook').item.json.body.internEmail }}` |
| intern_name | `{{ $('Webhook').item.json.body.internName }}` |
| week_start_date | `{{ $('Webhook').item.json.body.weekStartDate }}` |
| week_end_date | `{{ $('Webhook').item.json.body.weekEndDate }}` |
| accomplishments | `{{ $('Webhook').item.json.body.accomplishments }}` |
| challenges | `{{ $('Webhook').item.json.body.challenges }}` |
| learnings | `{{ $('Webhook').item.json.body.learnings }}` |
| goals | `{{ $('Webhook').item.json.body.goals }}` |
| productivity_rating | `{{ parseInt($('Webhook').item.json.body.productivity) }}` |
| created_at | `{{ $now }}` |
| updated_at | `{{ $now }}` |

**Important**: Do NOT include `id` field - PostgreSQL will auto-generate it.

### Step 5: Add Response Node

1. Click "+" after PostgreSQL node
2. Search for "Respond to Webhook" and select it
3. Configure response:
   - **Respond With**: JSON
   - **Response Body**:
   ```json
   {
     "status": "success",
     "message": "Self-evaluation submitted successfully! 📊"
   }
   ```

### Step 6: Save and Activate

1. Click "Save" (Ctrl+S)
2. Toggle the workflow to "Active" (top-right switch)
3. Webhook URL will be: `http://localhost:5678/webhook/submit-self-evaluation`

---

## Part B: Get Self-Evaluations Workflow

### Step 1: Create Second Workflow

1. Click "+ Add workflow" 
2. Name it: "Get Self Evaluations DB"

### Step 2: Add Webhook Node

1. Click "+" to add node
2. Search for "Webhook" and select it
3. Configure webhook:
   - **HTTP Method**: GET
   - **Path**: `get-self-evaluations`
   - **Response Mode**: `Response Node`
   - Click "Save"

### Step 3: Add PostgreSQL Node

1. Click "+" after webhook node
2. Search for "Postgres" and select it
3. Configure PostgreSQL:
   - **Operation**: Select
   - **Schema**: public
   - **Table**: self_evaluations
   - **Credentials**: Use existing "Intern Database"
   - **Sort**: 
     - **Add field**: created_at
     - **Direction**: DESC
   - **Limit**: 50

### Step 4: Add Response Node

1. Click "+" after PostgreSQL node
2. Search for "Respond to Webhook" and select it
3. Configure response:
### Common Issues:
1. **404 Error**: Workflow not activated - check the toggle switch
2. **500 Error**: Database connection issue - check credentials
3. **Field mapping errors**: Ensure expressions match exactly as shown above
4. **Constraint errors**: Remove `id` field from Values to Send

### Verify Database Connection:
1. Go to Settings > Credentials
2. Test the PostgreSQL connection
3. Check Adminer: http://localhost:8080

### Check Workflow Execution:
1. Go to Executions tab in n8n
2. Look for errors in recent executions
3. Check the data flow between nodes

## Frontend Integration

The frontend is already configured to submit to `/webhook/submit-self-evaluation`. Once the workflow is active, the self-evaluation form should work immediately.

Test the frontend:
1. Start the React app: `npm start`
2. Go to "Weekly Self-Evaluation" tab
3. Fill out the form and submit
4. Check for success message and database entry 