# Carbide Network Documentation Website Setup Guide

This guide will help you set up and deploy the Carbide Network documentation website.

## What You Get

A complete, production-ready documentation website with:

- ✅ Modern, responsive design
- ✅ Dark mode support
- ✅ Syntax-highlighted code blocks
- ✅ Search functionality
- ✅ Auto-generated table of contents
- ✅ Mobile-friendly navigation
- ✅ Fast loading times
- ✅ Easy deployment to any platform

## Quick Start (2 minutes)

### 1. Test Locally

```bash
cd carbide-dev-docs/website
./serve.sh
```

Then open http://localhost:8000 in your browser.

### 2. Deploy to Netlify (Easiest)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add documentation website"
   git push
   ```

2. Go to https://netlify.com and click "Add new site"

3. Connect your GitHub repository

4. Configure:
   - **Publish directory**: `website`
   - Leave everything else as default

5. Click "Deploy site"

Done! Your site will be live in ~30 seconds at `https://your-site.netlify.app`

## Deployment Options

### Option 1: Netlify (Recommended)

**Pros**:
- Free tier available
- Automatic HTTPS
- Custom domains
- Instant cache invalidation
- Form handling
- Serverless functions support

**Steps**:
1. Sign up at https://netlify.com
2. Connect your Git repository
3. Set publish directory to `website`
4. Deploy!

**Custom Domain**:
- Add domain in Netlify dashboard
- Configure DNS as instructed

### Option 2: Vercel

**Pros**:
- Free tier available
- Excellent performance
- Automatic HTTPS
- Edge network
- Custom domains

**Steps**:
1. Sign up at https://vercel.com
2. Import your Git repository
3. Set root directory to `website`
4. Deploy!

**Custom Domain**:
- Add domain in Vercel dashboard
- Configure DNS as instructed

### Option 3: GitHub Pages

**Pros**:
- Free
- Built into GitHub
- Simple setup

**Cons**:
- No serverless functions
- Slower than CDN options

**Steps**:
1. Create `gh-pages` branch:
   ```bash
   git checkout -b gh-pages
   cp -r website/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

2. Enable in repository settings:
   - Settings → Pages
   - Source: `gh-pages` branch
   - Save

Your site will be at `https://yourusername.github.io/carbide-dev-docs`

**Custom Domain**:
```bash
echo "docs.carbide.network" > website/CNAME
git add website/CNAME
git commit -m "Add custom domain"
git push
```

Then configure DNS:
- Add CNAME record pointing to `yourusername.github.io`

### Option 4: Cloudflare Pages

**Pros**:
- Free
- Fast CDN
- Automatic HTTPS
- Analytics included

**Steps**:
1. Go to https://pages.cloudflare.com
2. Connect your Git repository
3. Set build output to `website`
4. Deploy!

### Option 5: Self-Hosted

**Requirements**:
- Web server (Nginx, Apache, Caddy)
- HTTPS certificate (Let's Encrypt)

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name docs.carbide.network;
    root /var/www/carbide-docs/website;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(css|js|jpg|png|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Markdown files
    location ~* \.md$ {
        add_header Content-Type "text/markdown; charset=utf-8";
        expires 1h;
    }
}
```

## Custom Domain Setup

### For Netlify:
1. Go to Site Settings → Domain Management
2. Click "Add custom domain"
3. Add your domain (e.g., `docs.carbide.network`)
4. Configure DNS:
   - **CNAME record**: `docs` → `your-site.netlify.app`

### For Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:
   - **CNAME record**: `docs` → `your-project.vercel.app`

### For GitHub Pages:
1. Add `CNAME` file with your domain
2. Configure DNS:
   - **CNAME record**: `docs` → `yourusername.github.io`
   - Or **A records**:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

### For Cloudflare Pages:
1. Domain is automatically managed if using Cloudflare DNS
2. Or add custom domain in Pages dashboard

## Customization

### 1. Update Branding

Edit `website/index.html`:
```html
<!-- Logo and title -->
<div class="logo">
    <span class="logo-icon">💎</span>
    <span class="logo-text">Carbide Network</span>
</div>
```

### 2. Change Colors

Edit `website/css/styles.css`:
```css
:root {
    --primary-color: #1A73E8;      /* Change this */
    --secondary-color: #34A853;    /* And this */
    --accent-color: #FBBC04;       /* And this */
}
```

### 3. Add/Remove Documentation Pages

Edit `website/js/app.js`:
```javascript
const DOCS = {
    'OVERVIEW': 'OVERVIEW.md',
    'PROVIDER_NODE': 'PROVIDER_NODE.md',
    'YOUR_NEW_DOC': 'YOUR_NEW_DOC.md',  // Add here
    // ...
};
```

Then add navigation link in `website/index.html`:
```html
<li><a href="#" onclick="loadDoc('YOUR_NEW_DOC'); return false;"
       class="nav-item" data-doc="YOUR_NEW_DOC">
    <span class="nav-icon">📄</span> Your New Doc
</a></li>
```

### 4. Add Analytics

Google Analytics - add to `website/index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Or Plausible - add before `</head>`:
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## Troubleshooting

### Site loads but shows blank page
- Check browser console for errors
- Verify markdown files are in the `website/` directory
- Check file paths in `js/app.js`

### Markdown not rendering
- Ensure marked.js is loading from CDN
- Check browser console for JavaScript errors
- Verify markdown files are accessible

### Code blocks not highlighted
- Ensure highlight.js is loading from CDN
- Check language name is supported
- View browser console for errors

### Dark mode not working
- Clear browser cache and local storage
- Check `data-theme` attribute on `<html>`
- Verify CSS variables are defined

### Search not working
- Feature is basic in current version
- Check browser console for errors
- Consider adding Algolia or other search service

## Performance Optimization

### Image Optimization
- Use WebP format where possible
- Compress images before upload
- Consider lazy loading for images

### Code Splitting
- Current version loads all code upfront
- For larger sites, consider dynamic imports

### Caching
- Static assets cached for 1 year
- Markdown files cached for 1 hour
- Configured in `netlify.toml` and `vercel.json`

## Security

The site includes:
- Content Security Policy headers (configure in hosting)
- XSS protection
- Frame protection
- HTTPS enforcement (automatic on most hosts)

## Monitoring

### Uptime Monitoring
- Use UptimeRobot (free)
- Or Pingdom
- Or StatusCake

### Analytics
- Google Analytics (free)
- Plausible (privacy-friendly)
- Cloudflare Web Analytics (free)

### Performance Monitoring
- Lighthouse CI
- WebPageTest
- GTmetrix

## Maintenance

### Updating Documentation
1. Edit markdown files in root directory
2. Copy to `website/` directory:
   ```bash
   cp *.md website/
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update documentation"
   git push
   ```

Site will auto-deploy if using Netlify/Vercel/Pages.

### Updating Dependencies
The site uses CDN-hosted libraries:
- marked.js for markdown rendering
- highlight.js for code highlighting

To update, change version in `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>
<!-- Change version number here ↑ -->
```

## Support

### Common Issues

**Issue**: 404 on navigation
**Solution**: Ensure hosting platform is configured for SPA routing

**Issue**: Styles not loading
**Solution**: Check CSS file path and CORS headers

**Issue**: Slow loading
**Solution**: Enable CDN and caching on your hosting platform

### Getting Help

- GitHub Issues: [Create an issue](https://github.com/carbide/carbide-dev-docs/issues)
- Email: support@carbide.network
- Discord: [Join our community](#)

## Next Steps

1. ✅ Deploy to hosting platform
2. ✅ Configure custom domain
3. ✅ Add analytics
4. ✅ Set up monitoring
5. ✅ Customize branding
6. ✅ Add SSL certificate (automatic on most platforms)
7. ✅ Test on mobile devices
8. ✅ Share with your team!

## Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Pages Guide](https://pages.github.com)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Marked.js Documentation](https://marked.js.org)
- [Highlight.js Documentation](https://highlightjs.org)

---

**Need help?** Open an issue or contact support@carbide.network

**Built with ❤️ by the Carbide Team**
