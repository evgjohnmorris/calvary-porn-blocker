import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn/hosts';
const outputPath = path.join(process.cwd(), 'public', 'rules.json');

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const lines = data.split('\n');
    const rules = [];
    let idCounter = 1;

    for (const line of lines) {
      // Ignore comments and empty lines
      if (!line || line.startsWith('#') || line.trim() === '') continue;

      // Extract the domain
      const parts = line.split(/\s+/);
      if (parts.length >= 2 && parts[0] === '0.0.0.0') {
        const domain = parts[1];
        
        // Skip some standard hosts
        if (domain === '0.0.0.0' || domain === 'localhost' || domain === 'broadcasthost') continue;

        rules.push({
          id: idCounter++,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: `||${domain}`,
            resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]
          }
        });

        // Limit to 300,000 to be safe with DNR limits
        if (idCounter > 300000) break;
      }
    }

    // Ensure public dir exists
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(rules, null, 2));
    console.log(`Successfully generated ${rules.length} declarativeNetRequest rules in ${outputPath}`);
  });

}).on('error', (err) => {
  console.error('Error fetching hosts file:', err.message);
});
