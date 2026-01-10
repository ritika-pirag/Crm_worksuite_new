# Settings System - Testing & Usage Guide

## 🧪 Complete Testing Steps

### Step 1: Run Migration

```bash
cd crm-worksuite-backend
node migrations/20260103_add_default_settings.js
```

**Expected Output:**
```
Running migration: Add Default Settings
Found 1 companies
Adding default settings for company ID: 1
✓ Default settings added for company ID: 1
✓ Migration completed successfully
```

---

### Step 2: Test API Endpoints

#### Test 1: Get All Settings
```bash
curl http://localhost:5000/api/v1/settings
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "setting_key": "company_name",
      "setting_value": "My Company",
      "created_at": "2024-01-01",
      "updated_at": "2024-01-01"
    }
    // ... more settings
  ],
  "count": 80
}
```

#### Test 2: Update Single Setting
```bash
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "setting_key": "company_name",
    "setting_value": "Updated Company Name"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "data": {
    "setting_key": "company_name",
    "setting_value": "Updated Company Name"
  }
}
```

#### Test 3: Bulk Update Settings
```bash
curl -X PUT http://localhost:5000/api/v1/settings/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "settings": [
      {
        "setting_key": "theme_mode",
        "setting_value": "dark"
      },
      {
        "setting_key": "primary_color",
        "setting_value": "#FF5733"
      },
      {
        "setting_key": "company_email",
        "setting_value": "test@example.com"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "3 settings updated successfully",
  "data": [
    {
      "setting_key": "theme_mode",
      "success": true,
      "value": "dark"
    },
    {
      "setting_key": "primary_color",
      "success": true,
      "value": "#FF5733"
    },
    {
      "setting_key": "company_email",
      "success": true,
      "value": "test@example.com"
    }
  ],
  "count": 3
}
```

#### Test 4: Get Settings by Category
```bash
# Get all module settings
curl http://localhost:5000/api/v1/settings/category/module

# Get all email settings
curl http://localhost:5000/api/v1/settings/category/email

# Get all theme settings
curl http://localhost:5000/api/v1/settings/category/theme
```

#### Test 5: Get Single Setting
```bash
curl http://localhost:5000/api/v1/settings/company_name
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "setting_key": "company_name",
    "setting_value": "My Company"
  }
}
```

#### Test 6: Export Settings
```bash
curl http://localhost:5000/api/v1/settings/export
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "company_name": "My Company",
    "company_email": "info@company.com",
    "theme_mode": "light",
    "primary_color": "#217E45"
    // ... all settings
  },
  "count": 80,
  "exported_at": "2024-01-01T00:00:00.000Z"
}
```

#### Test 7: Import Settings
```bash
curl -X POST http://localhost:5000/api/v1/settings/import \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "company_name": "Imported Company",
      "theme_mode": "dark",
      "primary_color": "#123456"
    }
  }'
```

#### Test 8: Reset Settings
```bash
curl -X POST http://localhost:5000/api/v1/settings/reset
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Settings reset to default successfully",
  "data": {
    "success": true,
    "message": "Default settings initialized"
  }
}
```

---

### Step 3: Test Validation

#### Test Invalid Email
```bash
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "setting_key": "company_email",
    "setting_value": "invalid-email"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["company_email must be a valid email address"]
}
```

#### Test Invalid Color
```bash
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "setting_key": "primary_color",
    "setting_value": "red"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["primary_color must be a valid hex color (e.g., #FFFFFF)"]
}
```

#### Test Invalid Number Range
```bash
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "setting_key": "session_timeout",
    "setting_value": "1000"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["session_timeout must be at most 480"]
}
```

#### Test Invalid Enum Value
```bash
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "setting_key": "theme_mode",
    "setting_value": "purple"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["theme_mode must be one of: light, dark"]
}
```

---

### Step 4: Test Module Access Control

#### 4.1: Add Middleware to Routes

Edit `crm-worksuite-backend/routes/leadsRoutes.js`:

```javascript
const { checkModuleAccess } = require('../middleware/checkModuleAccess');

// Add middleware to protect routes
router.get('/',
  checkModuleAccess('leads'),
  leadsController.getAll
);

router.post('/',
  checkModuleAccess('leads'),
  leadsController.create
);
```

#### 4.2: Disable Module
```bash
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "setting_key": "module_leads",
    "setting_value": "false"
  }'
```

#### 4.3: Test Access (Should Fail)
```bash
curl http://localhost:5000/api/v1/leads
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Module 'leads' is disabled",
  "message": "The leads module is currently disabled. Please contact your administrator to enable it."
}
```

#### 4.4: Re-enable Module
```bash
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "setting_key": "module_leads",
    "setting_value": "true"
  }'
```

#### 4.5: Test Access (Should Work)
```bash
curl http://localhost:5000/api/v1/leads
```

---

### Step 5: Test Frontend Integration

#### 5.1: Start Frontend
```bash
cd crm-worksuite-frontend
npm run dev
```

#### 5.2: Navigate to Settings
```
http://localhost:5173/app/admin/settings
```

#### 5.3: Test Each Setting Tab

1. **General Settings**
   - Update company name
   - Upload company logo
   - Change timezone
   - Click "Save Changes"
   - Verify data saved in database

2. **Localization**
   - Change language
   - Change date format
   - Click "Save Changes"

3. **Email Settings**
   - Update SMTP host
   - Update SMTP port
   - Click "Save Changes"

4. **UI Options**
   - Change theme to Dark
   - **Should apply immediately** without page refresh
   - Change primary color
   - **Should update colors immediately**
   - Change font family
   - **Should update font immediately**

5. **Modules**
   - Disable "Leads" module
   - Click "Save Changes"
   - Try accessing `/app/admin/leads`
   - **Should show 403 error or hide from menu**

6. **Notifications**
   - Toggle email notifications
   - Toggle push notifications
   - Click "Save Changes"

7. **Integrations**
   - Enable Google Calendar
   - Add client ID and secret
   - Click "Save Changes"

---

### Step 6: Test File Upload

#### Using curl:
```bash
curl -X PUT http://localhost:5000/api/v1/settings \
  -F "logo=@/path/to/image.png" \
  -F "setting_key=company_logo"
```

#### Using Frontend:
1. Go to Settings > General
2. Click on "Company Logo" file input
3. Select an image file
4. Logo should upload and display preview
5. Check `uploads/` folder for saved file

---

## 📊 Database Verification

### Check Settings in Database
```sql
-- View all settings
SELECT * FROM system_settings WHERE company_id = 1;

-- View specific setting
SELECT * FROM system_settings
WHERE company_id = 1 AND setting_key = 'company_name';

-- View all module settings
SELECT * FROM system_settings
WHERE company_id = 1 AND setting_key LIKE 'module_%';

-- Count total settings
SELECT COUNT(*) FROM system_settings WHERE company_id = 1;
```

---

## 🔍 Troubleshooting

### Issue 1: Migration Fails
**Error:** `Cannot find module '../config/db'`

**Solution:**
```bash
cd crm-worksuite-backend
npm install
node migrations/20260103_add_default_settings.js
```

### Issue 2: Settings Not Saving
**Error:** `Failed to update settings`

**Check:**
1. Database connection is working
2. `system_settings` table exists
3. Check database logs for errors

### Issue 3: Module Access Not Working
**Error:** Module still accessible when disabled

**Solution:**
1. Clear module cache: Wait 1 minute or restart server
2. Verify middleware is added to routes
3. Check setting value in database

### Issue 4: Theme Not Applying
**Problem:** Theme changes don't apply immediately

**Solution:**
1. Check browser console for errors
2. Verify ThemeContext is working
3. Check if `updateTheme()` is called in frontend

### Issue 5: Validation Errors
**Error:** Setting rejected with validation error

**Solution:**
1. Check `settingsValidator.js` for rules
2. Ensure value matches expected type
3. Check min/max constraints

---

## 🎯 Verification Checklist

### Backend Tests
- [ ] Migration runs successfully
- [ ] Get all settings returns 80+ settings
- [ ] Update single setting works
- [ ] Bulk update works
- [ ] Get by category works
- [ ] Export settings works
- [ ] Import settings works
- [ ] Reset settings works
- [ ] Delete setting works
- [ ] File upload works
- [ ] Validation rejects invalid values
- [ ] Module access control works

### Frontend Tests
- [ ] Settings page loads
- [ ] All tabs are visible
- [ ] General settings save
- [ ] Localization settings save
- [ ] Email settings save
- [ ] UI options save and apply immediately
- [ ] Theme changes apply without refresh
- [ ] Color picker works
- [ ] Module toggles work
- [ ] Notifications settings save
- [ ] Integration settings save
- [ ] Logo upload works
- [ ] Save button shows "Saving..." state
- [ ] Success message displays after save

### Integration Tests
- [ ] Disable module blocks API access
- [ ] Enable module allows API access
- [ ] Theme changes visible in UI
- [ ] Settings persist after page refresh
- [ ] Multiple companies have separate settings
- [ ] Cache clears properly
- [ ] Validation prevents bad data

---

## 📈 Performance Tests

### Test Cache Performance
```bash
# First request (cache miss)
time curl http://localhost:5000/api/v1/settings

# Second request (cache hit - should be faster)
time curl http://localhost:5000/api/v1/settings

# Wait 1 minute for cache to expire
sleep 60

# Third request (cache miss again)
time curl http://localhost:5000/api/v1/settings
```

---

## 🎉 Success Criteria

All tests pass if:
1. ✅ All 80+ settings can be saved and retrieved
2. ✅ Validation prevents invalid data
3. ✅ Module access control works
4. ✅ Theme changes apply immediately
5. ✅ File upload works
6. ✅ Export/Import works
7. ✅ Reset works
8. ✅ No errors in browser console
9. ✅ No errors in server logs
10. ✅ Settings persist after page refresh

---

## 📞 Testing Support

If any test fails:
1. Check server logs: `console.log` in controllers
2. Check browser console: Network tab for API responses
3. Check database: Verify data is saved
4. Check validation: See what rule failed
5. Check middleware: Ensure it's applied to routes

---

## 🚀 Next Steps After Testing

1. Apply module access middleware to all routes
2. Customize default settings for your company
3. Test with multiple companies
4. Add custom validation rules if needed
5. Integrate with frontend theme system
6. Test integration settings (Google Calendar, Slack, etc.)

**Happy Testing!** 🎉
