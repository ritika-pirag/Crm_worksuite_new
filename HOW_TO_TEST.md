# CRM WorkSuite - Testing Guide (Hindi + English)
**Date:** 2026-01-01

---

## ✅ Servers Running Status

### Backend Server
- **Port:** 5000
- **Status:** ✅ RUNNING
- **URL:** http://localhost:5000
- **Process ID:** 43128

### Frontend Server
- **Port:** 5173
- **Status:** ✅ RUNNING
- **URL:** http://localhost:5173
- **Process ID:** 10244

---

## 🎯 Testing Kaise Karein (How to Test)

### Step 1: Browser Mein Application Kholein

1. **Chrome ya Firefox browser kholein**
2. **Address bar mein type karein:**
   ```
   http://localhost:5173
   ```
3. **Enter press karein**

---

### Step 2: Login Karein

1. **Login page dikhega**
2. **Apna credentials enter karein:**
   - Email: `admin@example.com` (ya jo bhi aapka admin email ho)
   - Password: Aapka password

3. **Login button click karein**

---

### Step 3: Client Dropdown Test (MAIN FIX)

Yeh test sabse important hai kyunki yahi fix kiya gaya hai:

#### 3.1 Estimates Page Par Jaayein
```
1. Left sidebar mein "Finance" section expand karein
2. "Estimates" par click karein
3. "Add Estimate" button (blue button) par click karein
```

#### 3.2 Client Dropdown Check Karein
```
1. Form mein "Client" field dhoondhein
2. Client dropdown par click karein
3. CHECK: Sirf aapki company ke clients dikhne chahiye
4. CHECK: Doosri company ke clients NAHI dikhne chahiye
```

**Expected Result:**
- ✅ Dropdown mein sirf aapki company (Company ID = 1) ke clients hon
- ✅ Kisi aur company ke clients na hon
- ✅ Dropdown empty na ho (agar clients hain database mein)

**Agar Problem Hai:**
- Browser console kholein (F12 press karein)
- Console tab check karein
- Koi error message dikhta hai to mujhe batayein

---

### Step 4: Browser Console Check

1. **F12 press karein** (Developer tools kholne ke liye)
2. **Console tab par jayein**
3. **Ye commands type karein:**

```javascript
// Company ID check karein
localStorage.getItem('companyId')
// Result: "1" ya koi number hona chahiye

// User info check karein
JSON.parse(localStorage.getItem('user'))
// Result: User object dikhega with company_id

// Token check karein
localStorage.getItem('token')
// Result: Long string (JWT token) hona chahiye
```

---

### Step 5: Network Tab Check

1. **F12 press karein**
2. **Network tab par jayein**
3. **Estimates page par "Add Estimate" click karein**
4. **Network tab mein dekh sakte ho clients API call:**

```
Request URL: http://localhost:5000/api/v1/clients?company_id=1
Status: 200 OK (green)
```

**Check karein:**
- ✅ URL mein `?company_id=1` hai
- ✅ Status 200 hai (400 nahi)
- ✅ Response mein clients ka data hai

---

## 🐛 Common Problems & Solutions

### Problem 1: Client Dropdown Khali Hai

**Possible Reasons:**
1. Database mein clients nahi hain
2. API call fail ho rahi hai
3. company_id missing hai

**Solution:**
```javascript
// Browser console mein:
localStorage.getItem('companyId')

// Agar null ya 0 aaya:
localStorage.setItem('companyId', '1')
location.reload()
```

---

### Problem 2: Console Mein Error "company_id is required"

**Matlab:** Backend company_id nahi mila

**Solution:**
```javascript
// Logout karein aur phir se login karein
localStorage.clear()
location.href = '/login'
```

---

### Problem 3: Client Dropdown Mein Sabhi Companies Ke Clients Dikh Rahe Hain

**Matlab:** Fix kaam nahi kar raha

**Debug Steps:**

1. **Network tab check karein:**
   - Request URL dekh sakte ho
   - `company_id` parameter hai ya nahi

2. **Backend logs check karein:**
   ```bash
   # Backend terminal mein dekho console logs
   GET /clients - companyId: 1
   ```

3. **axiosInstance.js file check karein:**
   - Auto-injection enabled hai ya nahi
   - Line 27-49 mein code sahi hai

---

### Problem 4: "Invalid Session" Error Dikha Raha Hai

**Matlab:** companyId validation kaam kar raha hai (GOOD!)

**Solution:**
```javascript
// Proper login karein:
1. Clear localStorage
2. Login page par jayein
3. Credentials enter karein
4. Login karein

// Company ID automatically set ho jayega
```

---

## 📊 Testing Checklist

### Basic Functionality
- [ ] Application khul raha hai (http://localhost:5173)
- [ ] Login page dikh raha hai
- [ ] Login ho raha hai successfully
- [ ] Dashboard dikh raha hai
- [ ] Left sidebar kaam kar raha hai

### Client Dropdown (Main Fix)
- [ ] Estimates page khul raha hai
- [ ] "Add Estimate" button kaam kar raha hai
- [ ] Client dropdown populate ho raha hai
- [ ] **CRITICAL:** Sirf apni company ke clients dikh rahe hain
- [ ] Network tab mein `?company_id=1` dikha raha hai
- [ ] Status 200 hai (400 nahi)

### Security
- [ ] localStorage mein valid companyId hai
- [ ] Invalid companyId pe error message dikha raha hai
- [ ] Logout karne pe localStorage clear ho raha hai
- [ ] Re-login pe sab kaam kar raha hai

---

## 🔍 Detailed Testing (Advanced)

### Test 1: API Direct Call

Browser console mein:

```javascript
// Test 1: Without company_id (should fail)
fetch('http://localhost:5000/api/v1/clients', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log('WITHOUT company_id:', d))

// Expected: { success: false, error: 'company_id is required' }

// Test 2: With company_id (should work)
fetch('http://localhost:5000/api/v1/clients?company_id=1', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log('WITH company_id:', d))

// Expected: { success: true, data: [...clients] }
```

---

### Test 2: Axios Interceptor

```javascript
// Check if auto-injection is working
import axios from 'axios'

// Make a GET request
axios.get('/clients')

// Network tab mein check karein:
// URL automatically ?company_id=1 add hona chahiye
```

---

### Test 3: Multiple Companies

Agar aapke paas multiple companies hain database mein:

```javascript
// Company 1 se login karein
// Clients dekho - Company 1 ke clients dikhen

// Logout karein
// Company 2 se login karein
// Clients dekho - Company 2 ke clients dikhen (Company 1 ke nahi)
```

---

## 📸 Screenshots Lene Hain?

Agar aapko problem dikha to screenshots le kar share kar sakte ho:

1. **Browser window**
2. **Console tab (F12)**
3. **Network tab** - API call
4. **Application tab** - localStorage

---

## 🚀 Quick Test Commands

Backend terminal mein ye commands try karein:

```bash
# Database mein kitne clients hain check karein
cd c:\Users\Administrator\Desktop\data\crm-worksuite\crm-worksuite-backend
node -e "const mysql = require('mysql2/promise'); (async () => { const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'root', database: 'crm_worksuite' }); const [rows] = await pool.execute('SELECT id, company_name, company_id FROM clients WHERE is_deleted = 0'); console.log('Total Clients:', rows.length); console.log(rows); await pool.end(); })()"
```

---

## ✅ Success Indicators

Sab kuch sahi kaam kar raha hai agar:

1. ✅ Client dropdown mein clients dikha rahe hain
2. ✅ Network tab mein 200 status hai
3. ✅ URL mein `?company_id=X` parameter hai
4. ✅ Console mein koi error nahi hai
5. ✅ Sirf aapki company ke clients dikh rahe hain
6. ✅ Create estimate kaam kar raha hai

---

## 🆘 Help Needed?

Agar koi problem hai to mujhe batayein:

1. **Screenshot** (browser + console)
2. **Network tab** screenshot (API calls)
3. **Error message** (console se copy karein)
4. **Which step** pe problem aayi

Main turant fix kar dunga!

---

## 📝 Notes

- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Database: MySQL (crm_worksuite)
- Fixes Applied: ✅ Client filtering, ✅ Security, ✅ Validation

---

**Happy Testing!** 🎉

Agar sab kuch sahi kaam kar raha hai to mujhe bata dena!
Agar koi problem hai to screenshot ke saath bata dena!
