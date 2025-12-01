# 🚀 Google Cloud Run Deployment Guide
## IDURAR ERP/CRM Production Deployment

This guide provides complete, copy-paste ready commands to deploy the IDURAR ERP/CRM system to Google Cloud Run.

---

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK (gcloud)** installed: https://cloud.google.com/sdk/docs/install
3. **Docker** installed locally
4. **MongoDB Atlas** database (already configured)
5. **Project Access**: Ensure you have Owner or Editor role

---

## ⚙️ Initial Setup

### 1. Install and Configure gcloud CLI

```bash
# Install gcloud (if not already installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Authenticate with Google Cloud
gcloud auth login

# Set your project ID (replace with your actual project ID)
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Set default region (choose one close to your users)
export REGION="us-central1"  # or us-east1, europe-west1, asia-southeast1
gcloud config set run/region $REGION
```

### 2. Set Environment Variables

```bash
# Project Configuration
export PROJECT_ID="your-project-id"
export REGION="us-central1"

# Backend Configuration
export BACKEND_SERVICE_NAME="idurar-backend"
export BACKEND_IMAGE="gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME"

# Frontend Configuration
export FRONTEND_SERVICE_NAME="idurar-frontend"
export FRONTEND_IMAGE="gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME"

# Database Configuration (MongoDB Atlas)
export MONGODB_URI="mongodb+srv://sripadv2000_db_user:l3zH5FROgfGPDnKD@cluster0.5qhzpwc.mongodb.net/idurar-erp-crm?retryWrites=true&w=majority&appName=Cluster0"

# Security Configuration - CHANGE THIS!
export JWT_SECRET="$(openssl rand -hex 32)"
echo "Your JWT_SECRET: $JWT_SECRET"
# SAVE THIS SECRET - You'll need it if you redeploy!
```

---

## 🔨 Part 1: Deploy Backend

### Step 1: Build Backend Docker Image

```bash
# Navigate to backend directory
cd backend

# Build the Docker image
docker build -t $BACKEND_IMAGE .

# Test locally (optional but recommended)
docker run -p 8080:8080 \
  -e DATABASE="$MONGODB_URI" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e NODE_ENV="production" \
  -e PORT=8080 \
  $BACKEND_IMAGE

# Stop local test: Ctrl+C
```

### Step 2: Push Backend Image to Google Container Registry

```bash
# Configure Docker to use gcloud credentials
gcloud auth configure-docker

# Push image to GCR
docker push $BACKEND_IMAGE
```

### Step 3: Deploy Backend to Cloud Run

```bash
# Deploy backend service
gcloud run deploy $BACKEND_SERVICE_NAME \
  --image $BACKEND_IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --concurrency 80 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "DATABASE=$MONGODB_URI" \
  --set-env-vars "JWT_SECRET=$JWT_SECRET" \
  --set-env-vars "OPENSSL_CONF=/dev/null" \
  --set-env-vars "CORS_ORIGIN=*"

# Get backend URL
export BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)')

echo "Backend deployed at: $BACKEND_URL"
```

### Step 4: Update Backend Environment Variables

```bash
# Update CORS_ORIGIN after frontend is deployed
# We'll do this in Part 3 after getting frontend URL

# Update PUBLIC_SERVER_FILE to backend URL
gcloud run services update $BACKEND_SERVICE_NAME \
  --region $REGION \
  --set-env-vars "PUBLIC_SERVER_FILE=$BACKEND_URL/"
```

---

## 🎨 Part 2: Deploy Frontend

### Step 1: Build Frontend Docker Image

```bash
# Navigate to frontend directory
cd ../frontend

# Build with backend URL
docker build \
  --build-arg VITE_BACKEND_SERVER="$BACKEND_URL/" \
  --build-arg VITE_FILE_BASE_URL="$BACKEND_URL/" \
  -t $FRONTEND_IMAGE .

# Test locally (optional)
docker run -p 8080:8080 $FRONTEND_IMAGE
# Open browser: http://localhost:8080
# Stop local test: Ctrl+C
```

### Step 2: Push Frontend Image to GCR

```bash
# Push image
docker push $FRONTEND_IMAGE
```

### Step 3: Deploy Frontend to Cloud Run

```bash
# Deploy frontend service
gcloud run deploy $FRONTEND_SERVICE_NAME \
  --image $FRONTEND_IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 30 \
  --concurrency 80 \
  --min-instances 0 \
  --max-instances 5

# Get frontend URL
export FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)')

echo "Frontend deployed at: $FRONTEND_URL"
```

---

## 🔗 Part 3: Configure CORS (Connect Frontend & Backend)

```bash
# Update backend CORS to allow frontend origin
gcloud run services update $BACKEND_SERVICE_NAME \
  --region $REGION \
  --set-env-vars "CORS_ORIGIN=$FRONTEND_URL"

echo "✅ Deployment Complete!"
echo "🌐 Frontend URL: $FRONTEND_URL"
echo "🔧 Backend URL: $BACKEND_URL"
```

---

## 🧪 Part 4: Test Your Deployment

### 1. Test Backend Health

```bash
# Test backend is running
curl "$BACKEND_URL/api/login"

# Expected: {"success":false, ...} (login endpoint responding)
```

### 2. Test Frontend Access

```bash
# Open frontend in browser
echo "Open this URL in your browser: $FRONTEND_URL"
```

### 3. Test Login Flow

1. Open frontend URL in browser: `echo $FRONTEND_URL`
2. First-time setup: Run backend setup script to create admin user:

```bash
# Get backend Cloud Run instance shell access
gcloud run services proxy $BACKEND_SERVICE_NAME --region $REGION &

# In another terminal, access the backend
curl http://localhost:8080/api/setup

# Or run setup via Cloud Build
gcloud builds submit --config=backend-setup.yaml
```

**Default Admin Credentials** (if setup script was run):
- Email: `admin@example.com` (check your setup script)
- Password: Check your backend logs or setup script

---

## 📊 Part 5: Monitoring & Debugging

### View Logs

```bash
# Backend logs
gcloud run services logs read $BACKEND_SERVICE_NAME \
  --region $REGION \
  --limit 50

# Frontend logs
gcloud run services logs read $FRONTEND_SERVICE_NAME \
  --region $REGION \
  --limit 50

# Stream logs in real-time
gcloud run services logs tail $BACKEND_SERVICE_NAME --region $REGION
```

### Check Service Status

```bash
# Backend status
gcloud run services describe $BACKEND_SERVICE_NAME \
  --region $REGION

# Frontend status
gcloud run services describe $FRONTEND_SERVICE_NAME \
  --region $REGION
```

### Common Issues & Solutions

**Issue: "Not allowed by CORS"**
```bash
# Update CORS to allow your frontend
gcloud run services update $BACKEND_SERVICE_NAME \
  --region $REGION \
  --set-env-vars "CORS_ORIGIN=$FRONTEND_URL"
```

**Issue: "JWT verification failed"**
```bash
# Verify JWT_SECRET is set correctly
gcloud run services describe $BACKEND_SERVICE_NAME \
  --region $REGION \
  --format 'value(spec.template.spec.containers[0].env[?(@.name=="JWT_SECRET")].value)'
```

**Issue: "MongoDB connection failed"**
```bash
# Check MongoDB URI
gcloud run services describe $BACKEND_SERVICE_NAME \
  --region $REGION \
  --format 'value(spec.template.spec.containers[0].env[?(@.name=="DATABASE")].value)'

# Make sure Cloud Run IP is whitelisted in MongoDB Atlas
# Add 0.0.0.0/0 to MongoDB Atlas IP Whitelist (or specific Cloud Run IPs)
```

**Issue: Frontend can't reach backend**
```bash
# Rebuild frontend with correct backend URL
cd frontend
docker build \
  --build-arg VITE_BACKEND_SERVER="$BACKEND_URL/" \
  --build-arg VITE_FILE_BASE_URL="$BACKEND_URL/" \
  -t $FRONTEND_IMAGE .
docker push $FRONTEND_IMAGE

# Redeploy frontend
gcloud run deploy $FRONTEND_SERVICE_NAME \
  --image $FRONTEND_IMAGE \
  --region $REGION
```

---

## 🔄 Part 6: Update/Redeploy

### Update Backend Only

```bash
cd backend
docker build -t $BACKEND_IMAGE .
docker push $BACKEND_IMAGE

gcloud run deploy $BACKEND_SERVICE_NAME \
  --image $BACKEND_IMAGE \
  --region $REGION
```

### Update Frontend Only

```bash
cd frontend
docker build \
  --build-arg VITE_BACKEND_SERVER="$BACKEND_URL/" \
  --build-arg VITE_FILE_BASE_URL="$BACKEND_URL/" \
  -t $FRONTEND_IMAGE .
docker push $FRONTEND_IMAGE

gcloud run deploy $FRONTEND_SERVICE_NAME \
  --image $FRONTEND_IMAGE \
  --region $REGION
```

---

## 🔒 Part 7: Production Security Hardening

### 1. Restrict CORS to Specific Origins

```bash
# Update CORS to only allow your frontend (not wildcard)
gcloud run services update $BACKEND_SERVICE_NAME \
  --region $REGION \
  --set-env-vars "CORS_ORIGIN=$FRONTEND_URL"
```

### 2. Add Custom Domain

```bash
# Map custom domain to frontend
gcloud run domain-mappings create \
  --service $FRONTEND_SERVICE_NAME \
  --domain your-domain.com \
  --region $REGION

# Map custom domain to backend
gcloud run domain-mappings create \
  --service $BACKEND_SERVICE_NAME \
  --domain api.your-domain.com \
  --region $REGION

# Update DNS records as instructed by gcloud output
```

### 3. Enable Cloud Run Authentication (Optional)

```bash
# Require authentication (if using IAM)
gcloud run services update $BACKEND_SERVICE_NAME \
  --region $REGION \
  --no-allow-unauthenticated
```

### 4. Set up Secret Manager (Recommended)

```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create JWT secret
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-

# Create MongoDB URI secret
echo -n "$MONGODB_URI" | gcloud secrets create mongodb-uri --data-file=-

# Update backend to use secrets
gcloud run services update $BACKEND_SERVICE_NAME \
  --region $REGION \
  --update-secrets DATABASE=mongodb-uri:latest \
  --update-secrets JWT_SECRET=jwt-secret:latest
```

---

## 💰 Part 8: Cost Optimization

### Set Minimum Instances

```bash
# Keep 1 instance warm (reduces cold starts, increases cost)
gcloud run services update $BACKEND_SERVICE_NAME \
  --region $REGION \
  --min-instances 1
```

### Reduce Memory/CPU

```bash
# Use minimum resources if your load is low
gcloud run services update $BACKEND_SERVICE_NAME \
  --region $REGION \
  --memory 512Mi \
  --cpu 1
```

---

## 📝 Environment Variables Reference

### Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE` | MongoDB connection URI | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT token signing | 32+ character random string |
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port (auto-set by Cloud Run) | `8080` |
| `CORS_ORIGIN` | Allowed frontend origins | `https://your-frontend.run.app` |
| `PUBLIC_SERVER_FILE` | Backend public URL | `https://your-backend.run.app/` |

### Frontend Build Arguments
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_SERVER` | Backend API URL | `https://your-backend.run.app/` |
| `VITE_FILE_BASE_URL` | File storage URL | `https://your-backend.run.app/` |

---

## 🎯 Quick Deployment Summary

```bash
# 1. Setup
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export BACKEND_SERVICE_NAME="idurar-backend"
export FRONTEND_SERVICE_NAME="idurar-frontend"
export JWT_SECRET="$(openssl rand -hex 32)"

# 2. Deploy Backend
cd backend
docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME .
docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME
gcloud run deploy $BACKEND_SERVICE_NAME --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME --region $REGION

# 3. Get Backend URL
export BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --region $REGION --format 'value(status.url)')

# 4. Deploy Frontend
cd ../frontend
docker build --build-arg VITE_BACKEND_SERVER="$BACKEND_URL/" -t gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME .
docker push gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME
gcloud run deploy $FRONTEND_SERVICE_NAME --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME --region $REGION

# 5. Done!
export FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
```

---

## 🆘 Support & Troubleshooting

- **Cloud Run Documentation**: https://cloud.google.com/run/docs
- **MongoDB Atlas IP Whitelist**: Add `0.0.0.0/0` or specific Cloud Run NAT IPs
- **View Logs**: `gcloud run services logs read SERVICE_NAME --region REGION`
- **Check Service**: `gcloud run services describe SERVICE_NAME --region REGION`

---

**🎉 Congratulations!** Your IDURAR ERP/CRM is now deployed on Google Cloud Run!
