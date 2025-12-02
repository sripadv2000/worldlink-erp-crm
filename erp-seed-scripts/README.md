# IDURAR ERP/CRM - Seed Scripts

Complete seed scripts for populating your IDURAR ERP/CRM system with sample data.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Execution Order](#execution-order)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Available Scripts](#available-scripts)

---

## 🎯 Overview

This seed scripts package allows you to quickly populate your ERP/CRM database with realistic sample data including:

- **Clients**: Company information, contact details
- **Invoices**: Invoice records with line items, taxes, and totals
- **Quotes**: Quote/Proposal documents for clients
- **Payments**: Payment records linked to invoices

---

## ✅ Prerequisites

Before running the seed scripts, ensure:

1. **Backend is running** on `http://localhost:8888`
2. **MongoDB Atlas** is connected and accessible
3. **Admin user exists** in the database
   - Default credentials: `admin@admin.com` / `admin123`
   - If not created, run setup first: `cd backend && npm run setup`
4. **Node.js** version 20.9.0 or higher

---

## 📦 Installation

### Step 1: Navigate to seed scripts directory

```bash
cd erp-seed-scripts
```

### Step 2: Install dependencies

```bash
npm install
```

This will install:
- `axios` - HTTP client for API requests
- `dotenv` - Environment variable management
- `colors` - Colorful console output

### Step 3: Verify backend is running

Make sure your backend is running in Docker or directly:

```bash
# If using Docker (from root directory)
docker-compose up backend

# Or if running directly (from backend directory)
cd ../backend
npm run dev
```

Backend should be accessible at: `http://localhost:8888`

---

## ⚙️ Configuration

### Environment Variables

The `.env` file contains all configuration:

```env
# Backend API Configuration
API_BASE_URL=http://localhost:8888/api

# Admin Credentials (must match your backend setup)
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=admin123

# Seeding Options (how many records to create)
SEED_COUNT_CLIENTS=10
SEED_COUNT_INVOICES=15
SEED_COUNT_QUOTES=10
SEED_COUNT_PAYMENTS=5
```

**⚠️ Important**: Make sure `ADMIN_EMAIL` and `ADMIN_PASSWORD` match your backend admin user!

---

## 🔄 Execution Order

The seed scripts must be run in a specific order due to dependencies:

```
1. Clients     (independent - run first)
   ↓
2. Invoices    (depends on Clients)
   ↓
3. Quotes      (depends on Clients)
   ↓
4. Payments    (depends on Invoices)
```

The `seedAll.js` script handles this automatically.

---

## 🚀 Usage

### Option 1: Run All Seeds (Recommended)

```bash
npm run seed
```

This runs all seed scripts in the correct order:
1. Creates 10 clients
2. Creates 15 invoices (linked to clients)
3. Creates 10 quotes (linked to clients)
4. Creates 5 payments (linked to invoices)

### Option 2: Run Individual Seeds

```bash
# Seed only clients
npm run seed:clients

# Seed only invoices (requires clients to exist)
npm run seed:invoices

# Seed only quotes (requires clients to exist)
npm run seed:quotes

# Seed only payments (requires invoices to exist)
npm run seed:payments
```

### Option 3: Test Connection First

Before seeding, test your backend connection:

```bash
npm test
```

This will:
- ✅ Check if backend is reachable
- ✅ Verify login credentials work
- ✅ Test authenticated API requests
- ✅ Show current database state

---

## 📊 Expected Output

When running `npm run seed`, you should see:

```
╔════════════════════════════════════════╗
║   IDURAR ERP/CRM - Database Seeding   ║
╚════════════════════════════════════════╝

🔐 Attempting login to: http://localhost:8888/api/login
📧 Email: admin@admin.com
✅ Login successful!

═══════════════════════════════════════════════
STEP 1: Seeding Clients
═══════════════════════════════════════════════

📊 Creating 10 clients...

✅ Created client: Acme Corporation
✅ Created client: TechStart Inc
✅ Created client: Global Solutions Ltd
...

✅ Successfully created 10 clients!

═══════════════════════════════════════════════
STEP 2: Seeding Invoices
═══════════════════════════════════════════════

📊 Fetching clients...
✅ Found 10 clients

📊 Creating 15 invoices...

✅ Created invoice #1001 for Acme Corporation
✅ Created invoice #1002 for TechStart Inc
...

╔════════════════════════════════════════╗
║          Seeding Complete! 🎉         ║
╚════════════════════════════════════════╝

✅ All seed scripts completed successfully!
⏱️  Total time: 12.45 seconds

🌐 You can now login to the frontend at:
   http://localhost:3000

🔐 Login credentials:
   Email: admin@admin.com
   Password: admin123
```

---

## 🔧 Troubleshooting

### Issue: "Login failed - 404 Not Found"

**Cause**: Backend is not running or wrong URL

**Solution**:
```bash
# Check backend is running
curl http://localhost:8888/api/login

# If not running, start it
cd ../backend
npm run dev
```

### Issue: "Login failed - Invalid credentials"

**Cause**: Admin credentials don't match

**Solution**:
1. Check your `.env` file credentials
2. Verify admin user exists in database
3. Re-run backend setup if needed:
   ```bash
   cd ../backend
   npm run setup
   ```

### Issue: "No clients found"

**Cause**: Trying to seed invoices/quotes/payments before clients

**Solution**:
```bash
# Always run clients first
npm run seed:clients

# Then run other seeds
npm run seed:invoices
```

### Issue: "ECONNREFUSED"

**Cause**: Backend is not accessible

**Solution**:
1. Check backend is running: `docker ps` or check process
2. Verify port 8888 is not blocked
3. Check `.env` has correct `API_BASE_URL`

### Issue: "MongoDB connection failed"

**Cause**: Database connection issue in backend

**Solution**:
1. Check backend `.env` has correct `DATABASE` connection string
2. Verify MongoDB Atlas IP whitelist includes your IP
3. Check backend logs for connection errors

---

## 📝 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Test Connection** | `npm test` | Verify backend connectivity and auth |
| **Seed All** | `npm run seed` | Run all seed scripts in order |
| **Seed Clients** | `npm run seed:clients` | Create sample clients only |
| **Seed Invoices** | `npm run seed:invoices` | Create sample invoices only |
| **Seed Quotes** | `npm run seed:quotes` | Create sample quotes only |
| **Seed Payments** | `npm run seed:payments` | Create sample payments only |

---

## 📂 File Structure

```
erp-seed-scripts/
├── .env                  # Configuration file
├── package.json          # Dependencies and scripts
├── README.md            # This file
├── login.js             # Authentication helper
├── testConnection.js    # Connection testing
├── seedAll.js           # Main orchestration script
├── seedClients.js       # Client seeding
├── seedInvoices.js      # Invoice seeding
├── seedQuotes.js        # Quote seeding
└── seedPayments.js      # Payment seeding
```

---

## 🎨 Sample Data

### Clients (10 companies)
- Acme Corporation
- TechStart Inc
- Global Solutions Ltd
- Digital Dynamics
- Innovative Systems
- Prime Enterprises
- Quantum Technologies
- NextGen Solutions
- Sunrise Industries
- Coastal Trading Co

### Invoices (15 records)
- Professional services packages
- Software licenses
- Various amounts and statuses
- Linked to random clients

### Quotes (10 records)
- Solution packages
- Implementation services
- 15-day validity period
- Draft and sent statuses

### Payments (5 records)
- Linked to first 5 invoices
- Full payment amounts
- Default payment mode

---

## 🔐 Security Notes

1. **Never commit `.env` with production credentials**
2. **Change default password** after setup
3. **Use strong JWT secrets** in production
4. **Restrict API access** in production environments

---

## 📖 Additional Resources

- [IDURAR Documentation](https://github.com/idurar/idurar-erp-crm)
- [Backend API Routes](../backend/src/routes)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas)
- [Cloud Run Deployment Guide](../CLOUD_RUN_DEPLOYMENT.md)

---

## 🆘 Support

If you encounter issues:

1. Run `npm test` to diagnose connection problems
2. Check backend logs for errors
3. Verify all prerequisites are met
4. Review [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

---

## ✅ Success Checklist

Before running seeds, verify:

- [ ] Backend running on `http://localhost:8888`
- [ ] MongoDB Atlas connected
- [ ] Admin user created (`admin@admin.com`)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured correctly
- [ ] Test connection passed (`npm test`)

After running seeds, verify:

- [ ] Login to frontend works
- [ ] Clients visible in dashboard
- [ ] Invoices visible in dashboard
- [ ] Quotes visible in dashboard
- [ ] Payments visible in dashboard

---

**🎉 Happy Seeding!**
