# 🚀 MochiDrop Documentation Deployment Guide

This guide will help you deploy your MochiDrop documentation to GitHub Pages for **FREE** hosting.

## 📋 Prerequisites

- GitHub account (free)
- Git installed on your computer
- Your MochiDrop project files

## 🎯 Step-by-Step Deployment

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** button in the top right corner
3. Select **"New repository"**
4. Repository settings:
   - **Repository name**: `mochidrop-docs` (or any name you prefer)
   - **Description**: `MochiDrop Bot Documentation`
   - **Visibility**: ✅ **Public** (required for free GitHub Pages)
   - ✅ **Add a README file**
   - **Add .gitignore**: Choose "Python" template
   - **Choose a license**: MIT License (recommended)
5. Click **"Create repository"**

### Step 2: Clone Repository to Your Computer

Open terminal/command prompt and run:

```bash
git clone https://github.com/YOUR_USERNAME/mochidrop-docs.git
cd mochidrop-docs
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Copy Documentation Files

Copy these files from your MochiDrop project to the new repository:

```
mochidrop-docs/
├── docs/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── _config.yml
├── .github/
│   └── workflows/
│       └── deploy-docs.yml
├── .gitignore
├── DEPLOYMENT.md
└── README.md
```

### Step 4: Push Files to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Add MochiDrop documentation"

# Push to GitHub
git push origin main
```

### Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **"Save"**

### Step 6: Wait for Deployment

- GitHub will automatically build and deploy your site
- This usually takes 2-5 minutes
- You'll see a green checkmark when it's ready

## 🌐 Your Live Documentation URLs

After deployment, your documentation will be available at:

- **GitHub Pages URL**: `https://YOUR_USERNAME.github.io/mochidrop-docs`
- **Custom Domain** (optional): `https://docs.yourdomain.com`

## 🔄 Automatic Updates

Every time you push changes to the `docs/` folder, GitHub Pages will automatically update your live site!

To update your documentation:

```bash
# Make changes to files in docs/ folder
# Then commit and push
git add docs/
git commit -m "Update documentation"
git push origin main
```

## 🎨 Custom Domain Setup (Optional)

If you want a custom domain like `docs.mochidrop.com`:

1. **Buy a domain** from any registrar (~$12/year)
2. **Add CNAME file** in your `docs/` folder:
   ```
   docs.yourdomain.com
   ```
3. **Configure DNS** at your domain registrar:
   - Add CNAME record: `docs` → `YOUR_USERNAME.github.io`
4. **Enable in GitHub Pages settings**:
   - Go to Settings → Pages
   - Add your custom domain
   - Enable "Enforce HTTPS"

## 🛠️ Troubleshooting

### Site Not Loading?
- Check GitHub Actions tab for build errors
- Ensure `index.html` is in the `docs/` folder
- Wait 5-10 minutes after first deployment

### 404 Error?
- Verify the repository is public
- Check that GitHub Pages is enabled
- Ensure files are in the correct folder structure

### Build Failing?
- Check the Actions tab for error details
- Ensure all files are properly formatted
- Verify `_config.yml` syntax

## 📞 Support

If you encounter issues:

1. Check the **Actions** tab in your GitHub repository for build logs
2. Verify all files are uploaded correctly
3. Ensure your repository is **public**
4. Wait a few minutes for changes to propagate

## 🎉 Success!

Once deployed, your documentation will be:
- ✅ **Accessible worldwide**
- ✅ **Automatically updated** when you push changes
- ✅ **Professional looking** with your custom domain
- ✅ **Free forever** on GitHub Pages

Your MochiDrop documentation is now live and ready to help users understand your bot! 🚀

---

**Example Live URL**: `https://yourusername.github.io/mochidrop-docs`

**With Custom Domain**: `https://docs.mochidrop.com`