# Calvary Porn Blocker - System Hardening Script
# This script applies strict NTFS permissions to the application directory
# to prevent unauthorized users from tampering with settings or logs.

Write-Host "Applying ISO 27001 NTFS Filesystem Hardening..." -ForegroundColor Cyan

$targetPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$targetPath = Split-Path -Parent $targetPath

# Strip inheritance
icacls "$targetPath" /inheritance:r /T /C /Q

# Grant FULL control to SYSTEM and Administrators
icacls "$targetPath" /grant:r "SYSTEM:(OI)(CI)F" /T /C /Q
icacls "$targetPath" /grant:r "Administrators:(OI)(CI)F" /T /C /Q

# Grant READ/EXECUTE to normal users (so Node can run if started by a user, but they can't modify)
icacls "$targetPath" /grant:r "Users:(OI)(CI)RX" /T /C /Q

Write-Host "Hardening complete. Only Administrators can now modify these files." -ForegroundColor Green
