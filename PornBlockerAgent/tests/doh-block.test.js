const fs = require('fs');
const path = require('path');

describe('doh-block.ps1 Security Policies', () => {
    let scriptContent = '';

    beforeAll(() => {
        const scriptPath = path.join(__dirname, '..', 'system', 'doh-block.ps1');
        scriptContent = fs.readFileSync(scriptPath, 'utf8');
    });

    it('should implement Set-ManagedRegValue function for safe updates', () => {
        expect(scriptContent).toContain('function Set-ManagedRegValue(');
    });

    it('should implement Remove-ManagedRegValue function for safe removal', () => {
        expect(scriptContent).toContain('function Remove-ManagedRegValue(');
    });

    it('should check for preexisting unmanaged keys', () => {
        // Look for the check that ensures we don't overwrite org policies
        expect(scriptContent).toMatch(/\$isManaged = \$false/);
        expect(scriptContent).toMatch(/\$keyProps\.CalvaryManaged -eq 1/);
    });

    it('should tag managed keys with CalvaryManaged marker', () => {
        // Ensures that when we set a key, we tag it
        expect(scriptContent).toMatch(/Set-ItemProperty .* -Name "CalvaryManaged" -Value 1 -Type DWord/);
    });

    it('should skip removal if CalvaryManaged marker is missing', () => {
        // Ensures that Remove logic checks for marker
        expect(scriptContent).toMatch(/if \(\$null -ne \$keyProps\.CalvaryManaged -and \$keyProps\.CalvaryManaged -eq 1\)/);
        expect(scriptContent).toMatch(/Registry value .* is not managed by Calvary\. Skipping removal\./);
    });
});
