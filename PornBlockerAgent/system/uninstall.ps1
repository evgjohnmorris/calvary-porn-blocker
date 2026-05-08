# Calvary Sexual Immorality Blocker - Ministry Uninstall Script
# This script removes the background Windows Service and reverts DoH interception.

Write-Host "Starting Uninstallation of Calvary Blocker..." -ForegroundColor Cyan

# 1. Require Administrator
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run this script as an Administrator!"
    exit
}

$installDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$installDir = Split-Path -Parent $installDir

# 2. Revert DoH (DNS-over-HTTPS) Interception
Write-Host "Reverting DoH interception (firewall rules + browser policy)..."
$dohScript = Join-Path $installDir "system\doh-block.ps1"
if (Test-Path $dohScript) {
    & $dohScript -RemoveOnly
} else {
    Write-Warning "Could not find doh-block.ps1, skipping DoH cleanup."
}

# 3. Remove Windows Scheduled Task
Write-Host "Removing Calvary Blocker background service..."

$taskName = "CalvaryBlockerService"
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "  [OK] Service unregistered successfully." -ForegroundColor Green
} else {
    Write-Host "  [WARN] Service not found." -ForegroundColor Yellow
}

Write-Host "Uninstallation Complete. Calvary Blocker has been removed." -ForegroundColor Green
