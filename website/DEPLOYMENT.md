# Carbide Network Documentation Website

A beautiful, modern documentation website for the Carbide Network. This is a static site that can be hosted on any platform.

## Features

- 🎨 **Modern Design**: Clean, responsive design with dark mode support
- 📱 **Mobile Friendly**: Fully responsive across all devices
- 🔍 **Search**: Built-in documentation search
- 📖 **Markdown Rendering**: Dynamic markdown rendering with syntax highlighting
- 🎯 **Table of Contents**: Auto-generated TOC for easy navigation
- ⚡ **Fast Loading**: Optimized static site with minimal dependencies
- 🌙 **Dark Mode**: Automatic theme switching with local storage
- 📋 **Code Copy**: One-click code snippet copying

## Quick Start

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <your-repo>
   cd carbide-dev-docs/website
   ```

2. **Serve locally**:

   Using Python:
   ```bash
   python3 -m http.server 8000
   ```

   Using Node.js:
   ```bash
   npx serve .
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

## Deployment

### Deploy to Netlify (Recommended)

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Configure:
   - **Publish directory**: `website`
6. Click "Deploy site"

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Configure:
   - **Root Directory**: `website`
5. Click "Deploy"

### Deploy to GitHub Pages

1. Copy website files to root:
   ```bash
   cp -r website/* .
   git add .
   git commit -m "Deploy"
   git push
   ```

2. Enable in repository settings → Pages

## Custom Domain

Add your domain to the `CNAME` file:
```bash
echo "docs.carbide.network" > CNAME
```

Configure DNS as per your hosting provider's instructions.

---

**Built with ❤️ by the Carbide Team**
