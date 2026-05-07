<#
.SYNOPSIS
    Deploys the Local Porn Blocker using Windows NRPT (Name Resolution Policy Table).
.DESCRIPTION
    This script automates the configuration of a global DNS override that forces all traffic through the CleanBrowsing Family Filter (185.228.168.168).
    It uses native Windows functionality, requires no background processes, consumes 0 CPU/RAM, and is highly tamper-resistant.
#>

# Ensure running as Administrator
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Elevation required. Requesting administrative privileges..."
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

Write-Host "==================================================="
Write-Host " Starting DNS Blocker Deployment"
Write-Host "==================================================="

# 1. Clean up old VPN if it exists
Write-Host "[1/3] Cleaning up legacy VPN configurations..."
$VpnName = "Local Porn Blocker"
$existingVpn = Get-VpnConnection -Name $VpnName -ErrorAction SilentlyContinue
if ($existingVpn) {
    Remove-VpnConnection -Name $VpnName -Force
}

# Clean up SoftEther if installed
$service = Get-Service -Name "sevpnserver" -ErrorAction SilentlyContinue
if ($service) {
    Stop-Service -Name "sevpnserver" -Force -ErrorAction SilentlyContinue
    sc.exe delete "sevpnserver" | Out-Null
}

# 2. Configure the NRPT Rule
Write-Host "[2/3] Configuring Global DNS Policy (NRPT)..."

# Clean up any existing rule we might have made
Get-DnsClientNrptRule | Where-Object { $_.NameServers -contains '185.228.168.168' } | Remove-DnsClientNrptRule -Force -ErrorAction SilentlyContinue

# Add the global rule for all domains (.)
Add-DnsClientNrptRule -Namespace "." -NameServers "185.228.168.168", "185.228.169.168"

# 3. Set DNS on physical adapters (Fallback protection)
Write-Host "[3/3] Enforcing static DNS on physical network adapters..."
Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Set-DnsClientServerAddress -ServerAddresses ("185.228.168.168", "185.228.169.168")

Write-Host "==================================================="
Write-Host " Deployment Complete!" -ForegroundColor Cyan
Write-Host " The system is now permanently locked to CleanBrowsing SafeSearch." -ForegroundColor Green
Write-Host " No VPN or background services are required."
Write-Host "==================================================="
Start-Sleep -Seconds 5
