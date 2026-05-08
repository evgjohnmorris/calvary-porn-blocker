# Calvary Porn Blocker — DoH Interception Script
# R-005: Blocks DNS-over-HTTPS bypass at three layers:
#   1. Windows Firewall outbound rules blocking known DoH provider IPs (TCP+UDP 443)
#   2. DNS sinkhole entries for DoH hostnames (handled in dns-server.js)
#   3. Browser Group Policy registry keys disabling DoH in Chrome, Edge, Firefox
#
# Idempotent: removes and recreates all CalvaryDoH* rules on each run.
# Must be run as Administrator.

param(
    [switch]$Verbose,
    [switch]$RemoveOnly
)

$ErrorActionPreference = 'Stop'

function Write-Step($msg) {
    Write-Host "[DoH-Block] $msg" -ForegroundColor Cyan
}
function Write-OK($msg) {
    Write-Host "  [OK] $msg" -ForegroundColor Green
}
function Write-Warn($msg) {
    Write-Host "  [WARN] $msg" -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# Require Administrator
# ---------------------------------------------------------------------------
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "doh-block.ps1 must be run as Administrator. Skipping."
    exit 1
}

# ---------------------------------------------------------------------------
# LAYER 1: Windows Firewall — Block outbound TCP+UDP 443 to DoH provider IPs
# ---------------------------------------------------------------------------
Write-Step "Layer 1: Configuring Windows Firewall DoH block rules..."

# Known DoH provider IP addresses and CIDRs
# Regularly reviewed — update this list as new providers emerge.
$dohIPs = @(
    # Cloudflare
    '1.1.1.1', '1.0.0.1',
    '2606:4700:4700::1111', '2606:4700:4700::1001',
    # Google
    '8.8.8.8', '8.8.4.4',
    '2001:4860:4860::8888', '2001:4860:4860::8844',
    # Quad9
    '9.9.9.9', '149.112.112.112',
    '2620:fe::fe', '2620:fe::9',
    # NextDNS (CIDR ranges — firewall takes individual IPs; use representative anchors)
    '45.90.28.0', '45.90.28.1', '45.90.30.0', '45.90.30.1',
    # AdGuard DNS
    '94.140.14.14', '94.140.15.15',
    '2a10:50c0::ad1:ff', '2a10:50c0::ad2:ff',
    # OpenDNS / Cisco Umbrella
    '208.67.222.222', '208.67.220.220',
    '2620:119:35::35', '2620:119:53::53',
    # Mullvad
    '194.242.2.2', '194.242.2.3',
    '2a07:e340::2', '2a07:e340::3',
    # Control D
    '76.76.2.0', '76.76.10.0',
    '2606:1a40::', '2606:1a40:1::',
    # CleanBrowsing (not the Calvary upstream, the DoH endpoint)
    '185.228.168.10', '185.228.169.11',
    '185.228.168.168', '185.228.169.168',
    # Comodo Secure DNS
    '8.26.56.26', '8.20.247.20',
    # Alternate DNS
    '76.76.19.19', '76.223.122.150'
)

$ruleName_TCP = 'CalvaryDoH-Block-TCP443'
$ruleName_UDP = 'CalvaryDoH-Block-UDP443'

# Remove stale rules if they exist (idempotent)
foreach ($rn in @($ruleName_TCP, $ruleName_UDP)) {
    if (Get-NetFirewallRule -DisplayName $rn -ErrorAction SilentlyContinue) {
        Remove-NetFirewallRule -DisplayName $rn -ErrorAction SilentlyContinue
        if ($Verbose) { Write-Warn "Removed existing rule: $rn" }
    }
}

if (-not $RemoveOnly) {
    # IPv4 only filter for standard New-NetFirewallRule (IPv6 handled separately)
    $ipv4IPs = $dohIPs | Where-Object { $_ -notmatch ':' }
    $ipv6IPs  = $dohIPs | Where-Object { $_ -match ':' }

    # TCP block
    New-NetFirewallRule `
        -DisplayName $ruleName_TCP `
        -Direction Outbound `
        -Protocol TCP `
        -RemotePort 443 `
        -RemoteAddress $ipv4IPs `
        -Action Block `
        -Profile Any `
        -Enabled True `
        -Description 'Calvary Porn Blocker: Block DNS-over-HTTPS (DoH) to known providers (TCP)' `
        | Out-Null
    Write-OK "Firewall rule created: $ruleName_TCP ($($ipv4IPs.Count) IPv4 addresses)"

    # UDP block (DoH over HTTP/3 / QUIC uses UDP 443)
    New-NetFirewallRule `
        -DisplayName $ruleName_UDP `
        -Direction Outbound `
        -Protocol UDP `
        -RemotePort 443 `
        -RemoteAddress $ipv4IPs `
        -Action Block `
        -Profile Any `
        -Enabled True `
        -Description 'Calvary Porn Blocker: Block DNS-over-HTTPS (DoH) to known providers (UDP/QUIC)' `
        | Out-Null
    Write-OK "Firewall rule created: $ruleName_UDP ($($ipv4IPs.Count) IPv4 addresses)"
} else {
    Write-OK "Layer 1 IPv4 DoH blocks removed."
}

if ($dohIPs | Where-Object { $_ -match ':' }) {
    $ipv6IPs = $dohIPs | Where-Object { $_ -match ':' }
    try {
        $ruleName_TCP6 = 'CalvaryDoH-Block-TCP443-IPv6'
        $ruleName_UDP6 = 'CalvaryDoH-Block-UDP443-IPv6'
        foreach ($rn in @($ruleName_TCP6, $ruleName_UDP6)) {
            Remove-NetFirewallRule -DisplayName $rn -ErrorAction SilentlyContinue
        }
        
        if (-not $RemoveOnly) {
            New-NetFirewallRule `
                -DisplayName $ruleName_TCP6 `
                -Direction Outbound -Protocol TCP -RemotePort 443 `
                -RemoteAddress $ipv6IPs -Action Block -Profile Any -Enabled True `
                -Description 'Calvary Porn Blocker: Block DoH to known providers (TCP IPv6)' `
                | Out-Null
            New-NetFirewallRule `
                -DisplayName $ruleName_UDP6 `
                -Direction Outbound -Protocol UDP -RemotePort 443 `
                -RemoteAddress $ipv6IPs -Action Block -Profile Any -Enabled True `
                -Description 'Calvary Porn Blocker: Block DoH to known providers (UDP IPv6)' `
                | Out-Null
            Write-OK "IPv6 firewall rules created ($($ipv6IPs.Count) addresses)"
        } else {
            Write-OK "Layer 1 IPv6 DoH blocks removed."
        }
    } catch {
        Write-Warn "IPv6 firewall operations failed: $_"
    }
}

# ---------------------------------------------------------------------------
# LAYER 3: Browser Group Policy — Disable DoH in Chrome, Edge, Firefox
# ---------------------------------------------------------------------------
Write-Step "Layer 3: Writing browser Group Policy registry keys to disable DoH..."

function Set-ManagedRegValue($path, $name, $value, $type = 'String') {
    $existingValue = $null
    $isManaged = $false

    if (Test-Path $path) {
        $keyProps = Get-ItemProperty -Path $path -ErrorAction SilentlyContinue
        if ($null -ne $keyProps.$name) {
            $existingValue = $keyProps.$name
        }
        if ($null -ne $keyProps.CalvaryPornBlockerManaged -and $keyProps.CalvaryPornBlockerManaged -eq 1) {
            $isManaged = $true
        }
    }

    # If the value exists, isn't managed by us, and conflicts, warn and skip.
    if ($null -ne $existingValue -and -not $isManaged) {
        # Check if it exactly matches our intended state. If so, take ownership.
        if ($existingValue -eq $value) {
            Write-Warn "Registry value '$name' at '$path' matches target but lacks marker. Taking ownership."
        } else {
            Write-Warn "Registry value '$name' at '$path' is managed by an organization. Skipping overwrite."
            return
        }
    }

    if (-not (Test-Path $path)) {
        New-Item -Path $path -Force | Out-Null
    }
    Set-ItemProperty -Path $path -Name $name -Value $value -Type $type -Force
    Set-ItemProperty -Path $path -Name "CalvaryPornBlockerManaged" -Value 1 -Type DWord -Force
}

function Remove-ManagedRegValue($path, $name) {
    if (Test-Path $path) {
        $keyProps = Get-ItemProperty -Path $path -ErrorAction SilentlyContinue
        if ($null -ne $keyProps.CalvaryPornBlockerManaged -and $keyProps.CalvaryPornBlockerManaged -eq 1) {
            Remove-ItemProperty -Path $path -Name $name -ErrorAction SilentlyContinue
            Remove-ItemProperty -Path $path -Name "CalvaryPornBlockerManaged" -ErrorAction SilentlyContinue
        } else {
            # Don't touch if not managed by us.
            if ($null -ne $keyProps.$name) {
                Write-Warn "Registry value '$name' at '$path' is not managed by Calvary. Skipping removal."
            }
        }
    }
}

# --- Google Chrome ---
$chromePolicyPath = 'HKLM:\SOFTWARE\Policies\Google\Chrome'
try {
    if ($RemoveOnly) {
        Remove-ManagedRegValue $chromePolicyPath 'DnsOverHttpsMode'
        Remove-ManagedRegValue $chromePolicyPath 'DnsOverHttpsTemplates'
        Write-OK "Chrome: DnsOverHttps policies handled"
    } else {
        Set-ManagedRegValue $chromePolicyPath 'DnsOverHttpsMode' 'off'
        Set-ManagedRegValue $chromePolicyPath 'DnsOverHttpsTemplates' ''
        Write-OK "Chrome: DnsOverHttpsMode = off"
    }
} catch {
    Write-Warn "Chrome policy write failed (Chrome may not be installed): $_"
}

# --- Microsoft Edge ---
$edgePolicyPath = 'HKLM:\SOFTWARE\Policies\Microsoft\Edge'
try {
    if ($RemoveOnly) {
        Remove-ManagedRegValue $edgePolicyPath 'DnsOverHttpsMode'
        Remove-ManagedRegValue $edgePolicyPath 'DnsOverHttpsTemplates'
        Write-OK "Edge: DnsOverHttps policies handled"
    } else {
        Set-ManagedRegValue $edgePolicyPath 'DnsOverHttpsMode' 'off'
        Set-ManagedRegValue $edgePolicyPath 'DnsOverHttpsTemplates' ''
        Write-OK "Edge: DnsOverHttpsMode = off"
    }
} catch {
    Write-Warn "Edge policy write failed: $_"
}

# --- Mozilla Firefox ---
# Firefox reads HKLM:\SOFTWARE\Policies\Mozilla\Firefox\DNSOverHTTPS
$firefoxPolicyPath = 'HKLM:\SOFTWARE\Policies\Mozilla\Firefox\DNSOverHTTPS'
try {
    if ($RemoveOnly) {
        Remove-ManagedRegValue $firefoxPolicyPath 'Enabled'
        Remove-ManagedRegValue $firefoxPolicyPath 'Locked'
        Write-OK "Firefox: DNSOverHTTPS policies handled"
    } else {
        Set-ManagedRegValue $firefoxPolicyPath 'Enabled' 0 'DWord'
        Set-ManagedRegValue $firefoxPolicyPath 'Locked'  1 'DWord'
        Write-OK "Firefox: DNSOverHTTPS Enabled=0, Locked=1"
    }
} catch {
    Write-Warn "Firefox policy write failed (Firefox may not be installed): $_"
}

# --- Brave Browser (Chromium-based, same policy path) ---
$bravePolicyPath = 'HKLM:\SOFTWARE\Policies\BraveSoftware\Brave'
try {
    if ($RemoveOnly) {
        Remove-ManagedRegValue $bravePolicyPath 'DnsOverHttpsMode'
        Write-OK "Brave: DnsOverHttps policies handled"
    } else {
        Set-ManagedRegValue $bravePolicyPath 'DnsOverHttpsMode' 'off'
        Write-OK "Brave: DnsOverHttpsMode = off"
    }
} catch {
    Write-Warn "Brave policy write skipped (not installed or policy not supported): $_"
}

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
Write-Host ""
if ($RemoveOnly) {
    Write-Host "[DoH-Block] Complete. DoH mitigation removed successfully." -ForegroundColor Green
} else {
    Write-Host "[DoH-Block] Complete. Three-layer DoH mitigation applied:" -ForegroundColor Green
    Write-Host "  Layer 1: Windows Firewall blocks outbound TCP/UDP 443 to $($dohIPs.Count) known DoH IPs" -ForegroundColor Green
    Write-Host "  Layer 2: DoH hostnames sinkholes are enforced in dns-server.js (always active)" -ForegroundColor Green
    Write-Host "  Layer 3: Browser Group Policy disables DoH in Chrome, Edge, Firefox, Brave" -ForegroundColor Green
}
Write-Host ""
