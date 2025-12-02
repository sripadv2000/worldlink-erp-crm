# 📦 Complete Installation and Seeding Guide

## Step-by-Step Guide from Start to Finish

This guide walks you through the complete process of setting up and seeding your IDURAR ERP/CRM system.

---

## 🎯 Overview

**Total time**: ~15-20 minutes
**Difficulty**: Beginner-friendly

### What This Guide Covers:
1. Backend setup and configuration
2. Database initialization
3. Starting the backend server
4. Installing seed script dependencies
5. Running the seed scripts
6. Verifying the data in frontend

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [x] Node.js 20.9.0 or higher installed
- [x] MongoDB Atlas account and connection string
- [x] Docker installed (if using Docker method)
- [x] Git repository cloned

---

## 📋 Part 1: Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd /home/user/worldlink-erp-crm/backend
```

### Step 2: Install Backend Dependencies

```bash
npm install
```

**Expected output**: `added XXX packages` with no errors

### Step 3: Configure Environment Variables

The `.env` file should already be configured with:

```env
DATABASE="mongodb+srv://sripadv2000_db_user:l3zH5FROgfGPDnKD@cluster0.5qhzpwc.mongodb.net/idurar-erp-crm?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="your_private_jwt_secret_key_CHANGE_THIS_IN_PRODUCTION"
NODE_ENV="production"
PORT=8080
```

✅ **Already configured** - No changes needed!

### Step 4: Initialize Database (Create Admin User)

```bash
npm run setup
```

**Expected output**:
```
✅ MongoDB Connected Successfully
👍 Admin created : Done!
👍 Settings created : Done!
👍 Taxes created : Done!
👍 PaymentMode created : Done!
🥳 Setup completed :Success!
```

**This creates**:
- Admin user: `admin@admin.com` / `admin123`
- Default settings
- Default tax (0%)
- Default payment mode

### Step 5: Start Backend Server

**Option A: Using npm (Development)**

```bash
npm run dev
```

**Option B: Using Docker**

```bash
# From root directory
cd ..
docker-compose up backend
```

**Expected output**:
```
✅ Express server running on PORT: 8888
📊 Environment: production
✅ MongoDB Connected Successfully
```

### Step 6: Verify Backend is Running

Open a new terminal and test:

```bash
curl http://localhost:8888/api/login
```

**Expected**: JSON response (even if it's an error, it means the server is running)

---

## 📋 Part 2: Seed Scripts Setup

### Step 1: Navigate to Seed Scripts Directory

```bash
cd /home/user/worldlink-erp-crm/erp-seed-scripts
```

### Step 2: Install Seed Script Dependencies

```bash
npm install
```

**Expected output**: `added 25 packages` with no vulnerabilities

### Step 3: Verify Configuration

Check the `.env` file:

```bash
cat .env
```

**Should show**:
```env
API_BASE_URL=http://localhost:8888/api
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=admin123
SEED_COUNT_CLIENTS=10
SEED_COUNT_INVOICES=15
SEED_COUNT_QUOTES=10
SEED_COUNT_PAYMENTS=5
```

✅ **Already configured** - No changes needed!

---

## 📋 Part 3: Test Connection

Before seeding, verify everything works:

```bash
npm test
```

**Expected output**:

```
🔍 Testing Backend Connection...

Configuration:
  API URL: http://localhost:8888/api
  Email: admin@admin.com
  Password: ********

Test 1: Backend Reachability
✅ Backend is reachable

Test 2: Login Endpoint
✅ Login successful
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   User: IDURAR Admin
   Email: admin@admin.com
   Role: owner

Test 3: Authenticated Request (Get Clients)
✅ Authenticated request successful
   Current clients in database: 0

╔════════════════════════════════════════╗
║   All Tests Passed! ✅                ║
╚════════════════════════════════════════╝
```

### ❌ If Tests Fail:

**Problem**: "Backend is NOT reachable"
```bash
# Solution: Start the backend
cd ../backend
npm run dev
```

**Problem**: "Login failed - Invalid credentials"
```bash
# Solution: Re-run setup
cd ../backend
npm run reset  # Clear database
npm run setup  # Recreate admin
```

---

## 📋 Part 4: Run Seed Scripts

### Option 1: Seed Everything (Recommended)

```bash
npm run seed
```

**This will**:
1. Login to backend
2. Create 10 clients
3. Create 15 invoices (linked to clients)
4. Create 10 quotes (linked to clients)
5. Create 5 payments (linked to invoices)

**Expected completion time**: 10-15 seconds

**Expected output**:
```
╔════════════════════════════════════════╗
║   IDURAR ERP/CRM - Database Seeding   ║
╚════════════════════════════════════════╝

═══════════════════════════════════════════════
STEP 1: Seeding Clients
═══════════════════════════════════════════════

🔐 Attempting login to: http://localhost:8888/api/login
📧 Email: admin@admin.com
✅ Login successful!

📊 Creating 10 clients...

✅ Created client: Acme Corporation
✅ Created client: TechStart Inc
✅ Created client: Global Solutions Ltd
✅ Created client: Digital Dynamics
✅ Created client: Innovative Systems
✅ Created client: Prime Enterprises
✅ Created client: Quantum Technologies
✅ Created client: NextGen Solutions
✅ Created client: Sunrise Industries
✅ Created client: Coastal Trading Co

✅ Successfully created 10 clients!

═══════════════════════════════════════════════
STEP 2: Seeding Invoices
═══════════════════════════════════════════════

📊 Fetching clients...
✅ Found 10 clients

📊 Creating 15 invoices...

✅ Created invoice #1001 for Acme Corporation
✅ Created invoice #1002 for TechStart Inc
... (13 more invoices)

✅ Successfully created 15 invoices!

═══════════════════════════════════════════════
STEP 3: Seeding Quotes
═══════════════════════════════════════════════

📊 Fetching clients...
✅ Found 10 clients

📊 Creating 10 quotes...

✅ Created quote #2001 for Acme Corporation
... (9 more quotes)

✅ Successfully created 10 quotes!

═══════════════════════════════════════════════
STEP 4: Seeding Payments
═══════════════════════════════════════════════

📊 Fetching invoices...
✅ Found 15 invoices

📊 Creating 5 payments...

✅ Created payment #3001 for $1234.56
... (4 more payments)

✅ Successfully created 5 payments!

╔════════════════════════════════════════╗
║          Seeding Complete! 🎉         ║
╚════════════════════════════════════════╝

✅ All seed scripts completed successfully!
⏱️  Total time: 12.45 seconds

📊 Summary:
  • Clients seeded
  • Invoices seeded
  • Quotes seeded
  • Payments seeded

🌐 You can now login to the frontend at:
   http://localhost:3000

🔐 Login credentials:
   Email: admin@admin.com
   Password: admin123
```

### Option 2: Seed Individual Entities

If you want more control:

```bash
# Seed clients only
npm run seed:clients

# Seed invoices only (requires clients)
npm run seed:invoices

# Seed quotes only (requires clients)
npm run seed:quotes

# Seed payments only (requires invoices)
npm run seed:payments
```

---

## 📋 Part 5: Verify in Frontend

### Step 1: Start Frontend (if not already running)

```bash
cd /home/user/worldlink-erp-crm/frontend
npm run dev
```

### Step 2: Open Browser

Navigate to: **http://localhost:3000**

### Step 3: Login

```
Email: admin@admin.com
Password: admin123
```

### Step 4: Verify Data

You should see:

- **Dashboard**: Overview with client and invoice counts
- **Clients**: List of 10 clients
  - Acme Corporation
  - TechStart Inc
  - Global Solutions Ltd
  - etc.

- **Invoices**: List of 15 invoices
  - Various statuses (draft, sent)
  - Linked to clients
  - With line items and totals

- **Quotes**: List of 10 quotes
  - Linked to clients
  - With proposals and pricing

- **Payments**: List of 5 payments
  - Linked to invoices
  - Payment records

---

## 🎉 Success!

Your database is now populated with sample data!

### What You've Accomplished:

✅ Backend running on `http://localhost:8888`
✅ Database initialized with admin user
✅ Seed scripts installed and configured
✅ Database populated with:
- 10 Clients
- 15 Invoices
- 10 Quotes
- 5 Payments

✅ Frontend accessible at `http://localhost:3000`
✅ Can login and view all seeded data

---

## 🔄 Re-running Seeds

If you want to reset and re-seed:

```bash
# 1. Reset database (from backend directory)
cd ../backend
npm run reset

# 2. Re-run setup
npm run setup

# 3. Re-run seeds (from erp-seed-scripts directory)
cd ../erp-seed-scripts
npm run seed
```

---

## 📝 Quick Reference Commands

### Backend Commands

```bash
cd backend

npm install          # Install dependencies
npm run setup        # Initialize database
npm run dev          # Start development server
npm run start        # Start production server
npm run reset        # Clear database
```

### Seed Script Commands

```bash
cd erp-seed-scripts

npm install          # Install dependencies
npm test             # Test connection
npm run seed         # Seed all data
npm run seed:clients # Seed only clients
```

### Frontend Commands

```bash
cd frontend

npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
```

---

## 🆘 Troubleshooting

### Issue: Backend won't start

```bash
# Check if port 8888 is in use
lsof -i :8888

# Kill process if needed
kill -9 <PID>

# Restart backend
npm run dev
```

### Issue: MongoDB connection failed

1. Check MongoDB Atlas IP whitelist
2. Verify connection string in backend `.env`
3. Test connection manually:
   ```bash
   mongosh "mongodb+srv://..."
   ```

### Issue: Seed scripts fail

```bash
# Run connection test
npm test

# Check backend logs
cd ../backend
# Look at terminal output

# Verify admin credentials
cat .env
```

### Issue: No data in frontend

1. Check browser console for errors (F12)
2. Verify backend is running
3. Re-run seeds with verbose output:
   ```bash
   node seedAll.js
   ```

---

## 📚 Next Steps

Now that your system is seeded:

1. **Explore the Interface**: Navigate through all pages
2. **Create New Records**: Add your own clients, invoices
3. **Test Features**: Generate PDFs, send emails
4. **Customize**: Modify seed data to match your needs
5. **Deploy**: Follow Cloud Run deployment guide

---

## 🎯 Summary

**Time to complete**: ~15 minutes
**Result**: Fully seeded ERP/CRM system ready to use

You now have a working IDURAR ERP/CRM system with sample data!

---

**Need help?** Check the main [README.md](README.md) or backend logs for more details.
