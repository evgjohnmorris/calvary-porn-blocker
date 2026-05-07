const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'CalvaryBlockerCore',
  description: 'Background service for the Calvary Sexual Immorality Blocker.',
  script: path.join(__dirname, 'server.js')
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function() {
  console.log('Uninstall complete.');
  console.log('The service exists: ', svc.exists);
});

svc.on('error', function(err) {
  console.error('Error during uninstallation: ', err);
});

// Uninstall the service.
console.log('Attempting to uninstall CalvaryBlockerCore Service...');
svc.uninstall();
