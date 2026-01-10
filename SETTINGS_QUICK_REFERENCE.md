# Settings System - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Run Migration
```bash
cd crm-worksuite-backend
node migrations/20260103_add_default_settings.js
```

### 2. Test API
```bash
curl http://localhost:5000/api/v1/settings
```

### 3. Open Frontend
```
http://localhost:5173/app/admin/settings
```

---

## 📂 Files Created

| File | Purpose |
|------|---------|
| `utils/settingsValidator.js` | Validation rules for all settings |
| `services/settingsService.js` | Business logic layer |
| `middleware/checkModuleAccess.js` | Module access control |
| `migrations/20260103_add_default_settings.js` | Default settings migration |
| `controllers/settingsController.js` | Enhanced API endpoints |
| `routes/settingsRoutes.js` | Updated routes |

---

## 🔌 API Endpoints (Cheat Sheet)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/settings` | Get all settings |
| `GET` | `/api/v1/settings/category/:category` | Get by category |
| `GET` | `/api/v1/settings/:key` | Get single setting |
| `GET` | `/api/v1/settings/export` | Export all |
| `POST` | `/api/v1/settings/initialize` | Initialize defaults |
| `POST` | `/api/v1/settings/reset` | Reset to defaults |
| `POST` | `/api/v1/settings/import` | Import settings |
| `PUT` | `/api/v1/settings` | Update single |
| `PUT` | `/api/v1/settings/bulk` | Bulk update |
| `DELETE` | `/api/v1/settings/:key` | Delete setting |

---

## 🎨 Settings Categories (19 Total)

1. **General** - Company info, system settings
2. **Localization** - Language, timezone, date/time formats
3. **Email** - SMTP configuration
4. **Email Templates** - Template management
5. **UI Options** - Theme, colors, fonts
6. **Top Menu** - Menu customization
7. **Footer** - Footer settings
8. **PWA** - Progressive Web App
9. **Modules** - Enable/disable modules (21 modules)
10. **Left Menu** - Sidebar customization
11. **Notifications** - Email, SMS, Push
12. **Integrations** - Google Calendar, Slack, Zapier
13. **Cron Jobs** - Automated tasks
14. **Updates** - Auto-update settings
15. **Access Permission** - Roles, 2FA
16. **Client Portal** - Client access settings
17. **Sales & Prospects** - Pipeline settings
18. **Setup** - System setup
19. **Plugins** - Plugin management

---

## 🎯 Common Tasks

### Update Theme
```bash
curl -X PUT http://localhost:5000/api/v1/settings/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "settings": [
      {"setting_key": "theme_mode", "setting_value": "dark"},
      {"setting_key": "primary_color", "setting_value": "#FF5733"}
    ]
  }'
```

### Disable Module
```bash
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "setting_key": "module_leads",
    "setting_value": "false"
  }'
```

### Update Company Info
```bash
curl -X PUT http://localhost:5000/api/v1/settings/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "settings": [
      {"setting_key": "company_name", "setting_value": "My Company"},
      {"setting_key": "company_email", "setting_value": "info@company.com"}
    ]
  }'
```

### Export Settings (Backup)
```bash
curl http://localhost:5000/api/v1/settings/export > settings_backup.json
```

### Import Settings (Restore)
```bash
curl -X POST http://localhost:5000/api/v1/settings/import \
  -H "Content-Type: application/json" \
  -d @settings_backup.json
```

---

## 🛡️ Module Access Control

### Add to Routes
```javascript
const { checkModuleAccess } = require('../middleware/checkModuleAccess');

router.get('/api/v1/leads',
  checkModuleAccess('leads'),
  controller.getAll
);
```

### Available Modules
```
leads, clients, projects, tasks, invoices, estimates,
proposals, payments, expenses, contracts, subscriptions,
employees, attendance, time_tracking, events, departments,
positions, messages, tickets, documents, reports
```

---

## ✅ Validation Types

| Type | Example | Validation |
|------|---------|------------|
| `string` | "Company Name" | maxLength |
| `number` | 30 | min, max |
| `boolean` | true | true/false |
| `email` | "test@example.com" | Valid email |
| `url` | "https://example.com" | Valid URL |
| `color` | "#FF5733" | Hex color |
| `enum` | "light" or "dark" | Allowed values |
| `datetime` | "2024-01-01" | Valid date |

---

## 🎨 Settings That Apply Immediately

### Theme Settings (No Refresh Needed)
- `theme_mode` → Light/Dark mode
- `primary_color` → Primary color
- `secondary_color` → Secondary color
- `font_family` → Font family

### Module Settings (Requires Cache Clear)
- Wait 1 minute or restart server
- Module access is cached for performance

---

## 🔍 Troubleshooting

### Settings Not Saving?
```sql
-- Check database
SELECT * FROM system_settings WHERE company_id = 1;
```

### Module Access Not Working?
```javascript
// Clear cache
const { clearModuleCache } = require('./middleware/checkModuleAccess');
clearModuleCache(companyId);

// OR wait 1 minute for cache to expire
```

### Theme Not Applying?
```javascript
// Check frontend console
// Verify updateTheme() is called
// Check ThemeContext
```

---

## 📊 Database Queries

### View All Settings
```sql
SELECT * FROM system_settings WHERE company_id = 1;
```

### View Module Settings
```sql
SELECT * FROM system_settings
WHERE company_id = 1 AND setting_key LIKE 'module_%';
```

### Update Setting Directly
```sql
UPDATE system_settings
SET setting_value = 'new value'
WHERE company_id = 1 AND setting_key = 'company_name';
```

### Delete All Settings for Company
```sql
DELETE FROM system_settings WHERE company_id = 1;
```

---

## 🎯 Test Checklist

- [ ] Migration runs successfully
- [ ] Get all settings (80+ items)
- [ ] Update single setting
- [ ] Bulk update settings
- [ ] Theme changes apply immediately
- [ ] Module disable blocks access
- [ ] File upload works
- [ ] Export/import works
- [ ] Validation rejects bad data
- [ ] Settings persist after refresh

---

## 📈 Performance Tips

### Cache Duration
- Module access cache: **1 minute**
- Clear cache: `clearModuleCache(companyId)`

### Bulk Operations
- Use `/bulk` endpoint for multiple settings
- Single transaction for all updates

### File Uploads
- Max size: Set in `max_file_size` setting
- Allowed types: Set in `allowed_file_types`

---

## 🔑 Important Settings

### System Critical
- `session_timeout` - Default: 30 minutes
- `max_file_size` - Default: 10 MB
- `default_timezone` - Default: UTC

### Security
- `enable_two_factor` - 2FA setting
- `default_role` - New user default role

### Integration
- `google_calendar_enabled` - Google Calendar
- `slack_enabled` - Slack notifications
- `zapier_enabled` - Zapier webhooks

---

## 📞 Quick Help

### Error: Validation Failed
→ Check `settingsValidator.js` for rules

### Error: Module Disabled
→ Enable module: `module_[name] = true`

### Error: Failed to Update
→ Check database connection and logs

### Theme Not Changing
→ Verify `updateTheme()` is called

---

## 🚀 Production Deployment

### Before Deploy
1. Run migration on production database
2. Test all API endpoints
3. Verify theme changes work
4. Test module access control
5. Backup existing settings

### After Deploy
1. Initialize default settings
2. Update company info
3. Configure email settings
4. Set theme colors
5. Enable/disable modules as needed

---

## 📝 Notes

- **All settings are company-specific** (multi-tenant)
- **Module access is cached** for 1 minute
- **Theme changes apply immediately** via context
- **Validation runs on all updates**
- **File uploads go to** `/uploads` folder
- **Default settings** initialized by migration

---

## ✨ Features Summary

✅ 80+ settings working
✅ Full CRUD operations
✅ Validation on all fields
✅ Module access control
✅ Import/Export
✅ Reset to defaults
✅ File upload support
✅ Caching for performance
✅ Multi-tenant support
✅ Theme applies instantly

---

**Sab kuch ready hai! 🎉**

Quick Reference: Keep this file handy for daily development!
