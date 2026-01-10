# CRM WorkSuite - Functionality Test Report
**Date:** 2026-01-01
**Testing Status:** In Progress

---

## Test Environment Setup

### Backend Server
- **Location:** `crm-worksuite-backend`
- **Port:** 5000 (default)
- **Status:** ⏳ Starting...

### Frontend Server
- **Location:** `crm-worksuite-frontend`
- **Port:** 5173 (Vite default)
- **Status:** ⏳ Starting...

### Database
- **Type:** MySQL
- **Database:** crm_worksuite
- **Status:** ⏳ Checking...

---

## Test Cases

### 1. Client Dropdown in Estimates (CRITICAL FIX)

**Test Steps:**
1. Login as Admin (Company ID = 1)
2. Navigate to Estimates page
3. Click "Add Estimate" button
4. Check client dropdown

**Expected Result:**
- Dropdown should show ONLY clients from Company ID = 1
- Should NOT show clients from other companies

**Actual Result:**
- ⏳ Testing...

**Status:** ⏳ PENDING

---

### 2. Backend API - GET /api/v1/clients

**Test Steps:**
1. Make API call without company_id: `GET /api/v1/clients`
2. Make API call with company_id: `GET /api/v1/clients?company_id=1`

**Expected Result:**
- Without company_id: Should return 400 error
- With company_id: Should return only Company 1 clients

**Actual Result:**
- ⏳ Testing...

**Status:** ⏳ PENDING

---

### 3. Frontend Validation - Invalid Session

**Test Steps:**
1. Clear localStorage
2. Navigate to Estimates page

**Expected Result:**
- Should show "Invalid Session" error message
- Should show "Go to Login" button

**Actual Result:**
- ⏳ Testing...

**Status:** ⏳ PENDING

---

### 4. Axios Interceptor - Auto company_id Injection

**Test Steps:**
1. Login successfully (company_id saved in localStorage)
2. Make any GET request through axios
3. Check network tab in browser

**Expected Result:**
- All GET requests should have `?company_id=X` in URL
- All POST/PUT requests should have `company_id` in body

**Actual Result:**
- ⏳ Testing...

**Status:** ⏳ PENDING

---

### 5. SQL Injection Prevention

**Test Steps:**
1. Call: `GET /api/v1/clients/overview?status=' OR '1'='1`
2. Call: `GET /api/v1/clients/overview?owner_id=1 OR 1=1`

**Expected Result:**
- Should NOT return all data
- Should handle as normal string value

**Actual Result:**
- ⏳ Testing...

**Status:** ⏳ PENDING

---

## Common Issues & Solutions

### Issue 1: Backend Not Starting

**Symptoms:**
- Port already in use
- Database connection error

**Solutions:**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Check MySQL is running
net start MySQL80

# Check .env file
cd crm-worksuite-backend
type .env
```

---

### Issue 2: Frontend Build Errors

**Symptoms:**
- Vite build fails
- Import errors
- JSX syntax errors

**Solutions:**
```bash
# Clear node_modules and reinstall
cd crm-worksuite-frontend
rd /s /q node_modules
npm install

# Clear Vite cache
rd /s /q .vite
npm run dev
```

---

### Issue 3: Client Dropdown Empty

**Symptoms:**
- Dropdown shows no clients
- Network tab shows 400 error

**Possible Causes:**
1. company_id not in localStorage
2. Backend validation rejecting request
3. No clients in database for this company

**Debug Steps:**
```javascript
// In browser console:
localStorage.getItem('companyId')  // Should return valid number
localStorage.getItem('token')      // Should return JWT token

// Check network tab:
// Request URL should have: ?company_id=1
// Response should be 200, not 400
```

---

### Issue 4: CORS Errors

**Symptoms:**
- API calls blocked by browser
- "Access-Control-Allow-Origin" error

**Solution:**
Check backend CORS configuration in `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## Manual Testing Checklist

### Backend API Tests

- [ ] **GET /api/v1/clients** without company_id → 400 error
- [ ] **GET /api/v1/clients?company_id=1** → Returns clients
- [ ] **POST /api/v1/clients** → Creates client with company_id
- [ ] **PUT /api/v1/clients/:id** without company_id → 400 error
- [ ] **DELETE /api/v1/clients/:id/contacts/:contactId** without company_id → 400 error
- [ ] **GET /api/v1/clients/overview** without company_id → 400 error
- [ ] **GET /api/v1/clients/overview?status=Active** → Returns filtered data

### Frontend UI Tests

- [ ] Login page works
- [ ] After login, companyId saved in localStorage
- [ ] Navigate to Estimates page
- [ ] Click "Add Estimate" button
- [ ] Client dropdown populates correctly
- [ ] Select client → Project dropdown filters by client
- [ ] Create estimate successfully
- [ ] Logout clears localStorage

### Security Tests

- [ ] Admin from Company 1 cannot see Company 2 clients
- [ ] SQL injection attempts are blocked
- [ ] Invalid company_id returns proper error
- [ ] Missing company_id returns 400 error

---

## Browser Console Commands for Testing

```javascript
// Check localStorage
console.log('Company ID:', localStorage.getItem('companyId'))
console.log('User:', JSON.parse(localStorage.getItem('user')))
console.log('Token:', localStorage.getItem('token'))

// Test API call
fetch('http://localhost:5000/api/v1/clients', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log('Without company_id:', d))

fetch('http://localhost:5000/api/v1/clients?company_id=1', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log('With company_id:', d))

// Clear session
localStorage.clear()
location.reload()
```

---

## Test Results Summary

| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Client Dropdown Filter | Only company clients | ⏳ | ⏳ PENDING |
| API company_id validation | 400 error | ⏳ | ⏳ PENDING |
| Frontend session validation | Error UI shown | ⏳ | ⏳ PENDING |
| Axios auto-injection | company_id added | ⏳ | ⏳ PENDING |
| SQL injection prevention | Blocked | ⏳ | ⏳ PENDING |

---

## Next Steps

1. ✅ Start backend server
2. ✅ Start frontend server
3. ⏳ Run manual tests in browser
4. ⏳ Update this document with results
5. ⏳ Fix any issues found
6. ⏳ Re-test after fixes

---

## How to Run Tests

### 1. Start Backend
```bash
cd c:\Users\Administrator\Desktop\data\crm-worksuite\crm-worksuite-backend
npm run dev
```

### 2. Start Frontend
```bash
cd c:\Users\Administrator\Desktop\data\crm-worksuite\crm-worksuite-frontend
npm run dev
```

### 3. Open Browser
```
http://localhost:5173
```

### 4. Login
- Email: admin@example.com (or your admin email)
- Password: (your password)

### 5. Test Each Feature
- Follow test cases above
- Check browser console for errors
- Check network tab for API calls

---

**Testing will be completed once servers are fully running.**
