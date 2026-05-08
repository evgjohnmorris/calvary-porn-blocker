# Calvary Sexual Immorality Blocker - Ministry Deployment Script
# This script installs the server as a background Windows Service and applies ISO 27001 hardening.

Write-Host "Starting Installation of Calvary Blocker..." -ForegroundColor Cyan

# 1. Require Administrator
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run this script as an Administrator!"
    exit
}

$installDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$installDir = Split-Path -Parent $installDir

# 2. Run Hardening Script
Write-Host "Applying ISO 27001 File Permissions..."
$hardenScript = Join-Path $installDir "system\harden.ps1"
if (Test-Path $hardenScript) {
    & $hardenScript
} else {
    Write-Warning "Could not find harden.ps1, skipping hardening."
}

# 3. Apply DoH (DNS-over-HTTPS) Interception — R-005
Write-Host "Applying DoH interception (firewall rules + browser policy)..."
$dohScript = Join-Path $installDir "system\doh-block.ps1"
if (Test-Path $dohScript) {
    & $dohScript
} else {
    Write-Warning "Could not find doh-block.ps1, skipping DoH interception."
}

# 4. Create Windows Scheduled Task to run as SYSTEM at startup
Write-Host "Registering Calvary Blocker as a background service..."

$action = New-ScheduledTaskAction -Execute "node" -Argument "`"$installDir\server.js`"" -WorkingDirectory $installDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Register task
$taskName = "CalvaryBlockerService"
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Description "Background service for Calvary Sexual Immorality Blocker" -Force

# Start it immediately
Start-ScheduledTask -TaskName $taskName

Write-Host "Installation Complete. Calvary Blocker is now running as SYSTEM." -ForegroundColor Green
Write-Host "Access the local dashboard at https://localhost:3456" -ForegroundColor Green
