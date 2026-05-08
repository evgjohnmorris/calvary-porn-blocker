const fs = require('fs');
const data = JSON.parse(fs.readFileSync('lint-results.json', 'utf8'));
data.forEach(file => {
  if (file.errorCount > 0 || file.warningCount > 0) {
    console.log(file.filePath);
    file.messages.forEach(m => console.log(`  Line ${m.line}: ${m.ruleId} - ${m.message}`));
  }
});
