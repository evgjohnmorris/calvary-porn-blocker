const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'CalvaryBlockerCore',
  description: 'Background service for the Calvary Sexual Immorality Blocker.',
  script: path.join(__dirname, 'server.js'),
  env: [{
    name: "NODE_ENV",
    value: "production"
  }]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
  console.log('CalvaryBlockerCore Service Installed Successfully.');
  svc.start();
  console.log('CalvaryBlockerCore Service Started.');
});

svc.on('alreadyinstalled', function() {
  console.log('Service is already installed.');
});

svc.on('error', function(err) {
  console.error('Error during installation: ', err);
});

// Install the script as a service
console.log('Attempting to install CalvaryBlockerCore as a Windows Service...');
svc.install();
