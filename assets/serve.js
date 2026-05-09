const http = require('http');
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/banner') {
    const svg = fs.readFileSync(path.join(ASSETS, 'hero-banner.svg'), 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1200px;height:400px;overflow:hidden;background:#030712}</style>
</head><body>${svg}</body></html>`);
  }

  else if (req.url === '/icon') {
    // Render just the shield section of the hero SVG, cropped and scaled to 256x256
    const svg = fs.readFileSync(path.join(ASSETS, 'hero-banner.svg'), 'utf8');
    // Inject a viewBox that focuses on the shield area (center of 1200x400 hero)
    // Shield is at translate(600, 200), spans ~200x250px → crop 460-740 x 60-340
    const cropped = svg
      .replace('viewBox="0 0 1200 400" width="100%" height="100%"',
               'viewBox="460 30 280 310" width="256" height="256"');
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:256px;height:256px;overflow:hidden;background:#030712}</style>
</head><body>${cropped}</body></html>`);
  }

  else {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(3457, () => {
  console.log('Server ready at http://localhost:3457');
});
