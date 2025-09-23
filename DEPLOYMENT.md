# ELT Dashboard Deployment Guide

## 🚀 Quick Deployment with Vercel + Railway

### Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free tier available)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/elt-dashboard-mvp.git
   git push -u origin main
   ```

### Step 2: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)** and sign up
2. **Click "New Project"** → "Deploy from GitHub repo"
3. **Select your repository** and choose the `backend` folder
4. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5001
   FRONTEND_URL=https://your-frontend-url.vercel.app
   DB_PATH=./data/dashboard.db
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=./uploads
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
5. **Deploy** - Railway will automatically build and deploy your backend
6. **Copy the Railway URL** (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up
2. **Click "New Project"** → "Import Git Repository"
3. **Select your repository** and choose the `frontend` folder
4. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
5. **Deploy** - Vercel will automatically build and deploy your frontend
6. **Copy the Vercel URL** (e.g., `https://your-app.vercel.app`)

### Step 4: Update Environment Variables

1. **Update Railway backend** with your Vercel frontend URL
2. **Update Vercel frontend** with your Railway backend URL
3. **Redeploy both services**

### Step 5: Upload Sample Data

1. **Visit your deployed frontend**
2. **Go to Data Upload page**
3. **Upload the sample-data.csv file**

## 🔧 Alternative Deployment Options

### Option 2: Netlify + Railway
- Frontend: Deploy to Netlify (similar to Vercel)
- Backend: Deploy to Railway (same as above)

### Option 3: DigitalOcean App Platform
- Deploy both frontend and backend together
- Cost: ~$12-24/month
- More integrated but more expensive

### Option 4: AWS/GCP/Azure
- More complex but highly scalable
- Good for enterprise use cases

## 📝 Production Checklist

- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Database file uploaded
- [ ] SSL certificates working
- [ ] Performance optimized
- [ ] Error monitoring set up

## 🆘 Troubleshooting

### Common Issues:
1. **CORS errors**: Update CORS_ORIGIN in backend
2. **API not found**: Check REACT_APP_API_URL in frontend
3. **Database issues**: Ensure data directory exists
4. **Build failures**: Check Node.js version compatibility

### Support:
- Check Railway logs for backend issues
- Check Vercel logs for frontend issues
- Review browser console for client-side errors
