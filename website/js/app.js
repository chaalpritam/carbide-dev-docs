// ===== Configuration =====
const DOCS_PATH = '../';
const DOCS = {
    'OVERVIEW': 'OVERVIEW.md',
    'PROVIDER_NODE': 'PROVIDER_NODE.md',
    'DISCOVERY_SERVICE': 'DISCOVERY_SERVICE.md',
    'IOS_SDK': 'IOS_SDK.md',
    'CLIENT_APPS': 'CLIENT_APPS.md'
};

// ===== State Management =====
let currentDoc = null;
let currentTheme = localStorage.getItem('theme') || 'light';

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSearch();
    setupMarked();

    // Load initial doc from hash or show hero
    const hash = window.location.hash.slice(1);
    if (hash && DOCS[hash.toUpperCase()]) {
        loadDoc(hash.toUpperCase());
    }
});

// ===== Theme Management =====
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

// ===== Markdown Configuration =====
function setupMarked() {
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {}
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });

    // Custom renderer for code blocks
    const renderer = new marked.Renderer();

    renderer.code = function(code, language) {
        const validLang = language || 'plaintext';
        const langName = validLang.charAt(0).toUpperCase() + validLang.slice(1);

        return `
            <div class="code-block-wrapper">
                <div class="code-block-header">
                    <span>${langName}</span>
                    <button onclick="copyCode(this)" class="copy-btn">Copy</button>
                </div>
                <pre><code class="language-${validLang}">${code}</code></pre>
            </div>
        `;
    };

    // Custom renderer for headings to add anchor links
    renderer.heading = function(text, level) {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        return `
            <h${level} id="${escapedText}">
                <a href="#${escapedText}" class="heading-anchor">${text}</a>
            </h${level}>
        `;
    };

    marked.use({ renderer });
}

// ===== Document Loading =====
async function loadDoc(docName) {
    const docFile = DOCS[docName];
    if (!docFile) {
        console.error('Document not found:', docName);
        return;
    }

    try {
        // Show loading state
        const docContent = document.getElementById('doc-content');
        const hero = document.getElementById('hero');
        const toc = document.getElementById('toc');

        docContent.innerHTML = '<div class="loading">Loading...</div>';
        hero.style.display = 'none';
        docContent.style.display = 'block';

        // Fetch markdown file
        const response = await fetch(DOCS_PATH + docFile);
        if (!response.ok) {
            throw new Error('Failed to load documentation');
        }

        const markdown = await response.text();

        // Convert markdown to HTML
        const html = marked.parse(markdown);
        docContent.innerHTML = html;

        // Highlight code blocks
        docContent.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // Update navigation
        updateActiveNav(docName);

        // Generate table of contents
        generateTOC();
        toc.style.display = 'block';

        // Update URL
        window.location.hash = docName.toLowerCase();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        currentDoc = docName;
    } catch (error) {
        console.error('Error loading document:', error);
        document.getElementById('doc-content').innerHTML = `
            <div class="error">
                <h2>Error Loading Documentation</h2>
                <p>Failed to load ${docName}. Please try again later.</p>
                <p class="error-details">${error.message}</p>
            </div>
        `;
    }
}

// ===== Navigation Management =====
function updateActiveNav(docName) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to current doc
    const activeItem = document.querySelector(`[data-doc="${docName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// ===== Table of Contents =====
function generateTOC() {
    const docContent = document.getElementById('doc-content');
    const tocNav = document.getElementById('toc-nav');
    const headings = docContent.querySelectorAll('h2, h3');

    if (headings.length === 0) {
        document.getElementById('toc').style.display = 'none';
        return;
    }

    let tocHTML = '';
    headings.forEach(heading => {
        const level = heading.tagName.toLowerCase();
        const text = heading.textContent;
        const id = heading.id;

        tocHTML += `
            <a href="#${id}" data-level="${level.charAt(1)}" onclick="smoothScroll('${id}'); return false;">
                ${text}
            </a>
        `;
    });

    tocNav.innerHTML = tocHTML;

    // Highlight active section on scroll
    window.addEventListener('scroll', highlightActiveTOCItem);
}

function highlightActiveTOCItem() {
    const headings = document.querySelectorAll('.doc-content h2, .doc-content h3');
    const tocLinks = document.querySelectorAll('.toc-nav a');

    let current = '';
    headings.forEach(heading => {
        const top = heading.offsetTop;
        if (window.scrollY >= top - 100) {
            current = heading.id;
        }
    });

    tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

function smoothScroll(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== Search Functionality =====
function initSearch() {
    const searchInput = document.getElementById('search');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
}

async function performSearch(query) {
    if (!query || query.length < 2) {
        return;
    }

    const searchQuery = query.toLowerCase();
    const results = [];

    // Search through all documentation files
    for (const [docName, docFile] of Object.entries(DOCS)) {
        try {
            const response = await fetch(DOCS_PATH + docFile);
            const content = await response.text();

            // Simple search - could be improved with better indexing
            if (content.toLowerCase().includes(searchQuery)) {
                const lines = content.split('\n');
                const matchingLines = lines.filter(line =>
                    line.toLowerCase().includes(searchQuery)
                );

                results.push({
                    doc: docName,
                    matches: matchingLines.slice(0, 3)
                });
            }
        } catch (error) {
            console.error('Error searching:', error);
        }
    }

    displaySearchResults(results);
}

function displaySearchResults(results) {
    // This is a simple implementation
    // In a real app, you'd want a better search UI
    if (results.length > 0) {
        console.log('Search results:', results);
    }
}

// ===== Utility Functions =====
function copyCode(button) {
    const codeBlock = button.closest('.code-block-wrapper').querySelector('code');
    const code = codeBlock.textContent;

    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = 'var(--secondary-color)';
        button.style.color = 'white';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        button.textContent = 'Failed';
    });
}

// ===== Mobile Menu =====
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// ===== Handle Browser Back/Forward =====
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && DOCS[hash.toUpperCase()]) {
        loadDoc(hash.toUpperCase());
    } else if (!hash) {
        showHero();
    }
});

function showHero() {
    document.getElementById('hero').style.display = 'block';
    document.getElementById('doc-content').style.display = 'none';
    document.getElementById('toc').style.display = 'none';

    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Print Styles =====
window.addEventListener('beforeprint', () => {
    document.querySelector('.sidebar').style.display = 'none';
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.toc').style.display = 'none';
});

window.addEventListener('afterprint', () => {
    document.querySelector('.sidebar').style.display = '';
    document.querySelector('.header').style.display = '';
    document.querySelector('.toc').style.display = '';
});

// ===== Service Worker Registration (for offline support) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K for search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search').focus();
    }

    // Esc to clear search
    if (e.key === 'Escape') {
        document.getElementById('search').value = '';
        document.getElementById('search').blur();
    }
});

// ===== Analytics (Optional) =====
function trackPageView(docName) {
    // Add your analytics tracking here
    // e.g., Google Analytics, Plausible, etc.
    console.log('Page view:', docName);
}

// ===== Export functions for inline onclick handlers =====
window.loadDoc = loadDoc;
window.toggleTheme = toggleTheme;
window.copyCode = copyCode;
window.toggleMobileMenu = toggleMobileMenu;
window.smoothScroll = smoothScroll;
