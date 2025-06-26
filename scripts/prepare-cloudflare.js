const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('🔧 Preparing build for Cloudflare Pages...');

// Create a new output directory structure
const outputDir = 'cloudflare-dist';
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// Copy static assets
if (fs.existsSync('dist/static')) {
  copyRecursiveSync('dist/static', path.join(outputDir, '_next/static'));
  console.log('✅ Copied static assets');
}

// Copy HTML files to root
const serverAppDir = 'dist/server/app';
if (fs.existsSync(serverAppDir)) {
  // Copy index.html to root
  if (fs.existsSync(path.join(serverAppDir, 'index.html'))) {
    fs.copyFileSync(path.join(serverAppDir, 'index.html'), path.join(outputDir, 'index.html'));
    console.log('✅ Copied homepage');
  }
  
  // Copy other pages
  const pages = ['drivers.html', 'riders.html', '_not-found.html'];
  pages.forEach(page => {
    if (fs.existsSync(path.join(serverAppDir, page))) {
      const destName = page === '_not-found.html' ? '404.html' : page;
      fs.copyFileSync(path.join(serverAppDir, page), path.join(outputDir, destName));
      console.log(`✅ Copied ${page}`);
    }
  });
}

// Copy error pages
const serverPagesDir = 'dist/server/pages';
if (fs.existsSync(serverPagesDir)) {
  const errorPages = ['404.html', '500.html'];
  errorPages.forEach(page => {
    if (fs.existsSync(path.join(serverPagesDir, page))) {
      fs.copyFileSync(path.join(serverPagesDir, page), path.join(outputDir, page));
      console.log(`✅ Copied ${page}`);
    }
  });
}

// Create _functions directory for API routes
const functionsDir = path.join(outputDir, '_functions');
fs.mkdirSync(functionsDir, { recursive: true });

// Create API route handlers for Cloudflare Functions
const apiRoutes = [
  'auth/[...nextauth]',
  'taxi-meter/auth',
  'taxi-meter/location', 
  'taxi-meter/trips'
];

apiRoutes.forEach(route => {
  const routeDir = path.join(functionsDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  
  // Create a simple handler that redirects to the Next.js API
  const handlerContent = `
export async function onRequest(context) {
  const { request, env } = context;
  
  // For now, return a placeholder response
  // In production, this would integrate with your backend
  return new Response(JSON.stringify({
    error: 'API endpoint not yet configured for static deployment',
    route: '${route}',
    method: request.method
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
}
`;
  
  fs.writeFileSync(path.join(routeDir, 'index.js'), handlerContent);
  console.log(`✅ Created function for ${route}`);
});

// Copy _redirects file for routing
if (fs.existsSync('public/_redirects')) {
  fs.copyFileSync('public/_redirects', path.join(outputDir, '_redirects'));
  console.log('✅ Copied _redirects file');
}

// Create _headers file for security
const headersContent = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable`;

fs.writeFileSync(path.join(outputDir, '_headers'), headersContent);
console.log('✅ Created _headers file');

console.log('🎉 Build prepared for Cloudflare Pages!');
console.log(`📁 Output directory: ${outputDir}`); 