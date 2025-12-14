# Quick Start - Testing & Deployment

## ✅ What's Done

1. ✅ Python dependencies installed
2. ✅ Synthetic data generated (OTT, Social, Media)
3. ✅ Models trained (all 3 data types)
4. ✅ Recommendations pre-computed
5. ✅ Node dependencies installed
6. ✅ Git repository initialized
7. ✅ Initial commit created

## 🧪 Test Locally

The dev server should be running at: **http://localhost:3000**

If not, start it:
```bash
npm run dev
```

Then:
1. Open http://localhost:3000 in your browser
2. Select a data type (OTT/Social/Media)
3. Choose a user ID (0-199)
4. Click "Get Recommendations"
5. See the top 10 recommendations!

## 📦 Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it: `shitty-ncf` (or whatever you want)
   - Don't initialize with README (we already have one)

2. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/shitty-ncf.git
   git branch -M main
   git push -u origin main
   ```

## 🚀 Deploy to Vercel

### Option 1: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your `shitty-ncf` repository
5. Vercel will auto-detect Next.js
6. Click "Deploy"

**Important:** The pre-computed recommendations are already in `public/recommendations/`, so the `/api/recommend-simple` endpoint will work out of the box!

### Option 2: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

Follow the prompts.

## 📝 After Deployment

1. **Update README.md:**
   - Add your Vercel deployment URL
   - Add your GitHub repo link
   - Add your blog post link (when published)

2. **Share on Twitter:**
   - Screenshot of the demo
   - Link to the blog post
   - Tag it with #MachineLearning #RecommendationSystems

3. **Publish Blog Post:**
   - Copy content from `BLOG_POST.md`
   - Publish on Medium/Dev.to/your blog
   - Link from README

## 🐛 Troubleshooting

### Dev server not starting?
- Make sure port 3000 is free
- Check if Node modules are installed: `npm install`

### Recommendations not showing?
- Make sure pre-computed files exist: `public/recommendations/*.json`
- Check browser console for errors

### Vercel deployment fails?
- Make sure `public/recommendations/` folder is committed to git
- Check Vercel build logs for errors

## 🎉 You're Done!

Your shitty NCF demo is ready to share. Remember: it's intentionally minimal. That's the point!

