<#
.SYNOPSIS
    Porn Blocker Settings UI
.DESCRIPTION
    A WinForms UI to control the local DNS-based Porn Blocker.
    Requires Administrator privileges to run.
#>

# 1. Self-Elevation Check
$principal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$PSCommandPath`""
    exit
}

# 2. Load WinForms Assembly
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# 3. Create the Main Form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Porn Blocker Settings"
$form.Size = New-Object System.Drawing.Size(400, 350)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false

# 4. Helper function to get current status
function Get-BlockerStatus {
    $nrpt = Get-DnsClientNrptRule -ErrorAction SilentlyContinue | Where-Object { $_.Namespace -eq "." }
    if ($nrpt) {
        if ($nrpt.NameServers -contains '185.228.168.168') {
            return "Active (Strict Mode)"
        } elseif ($nrpt.NameServers -contains '185.228.168.10') {
            return "Active (Standard Mode)"
        } else {
            return "Active (Custom)"
        }
    }
    return "Inactive"
}

# 5. UI Elements

# Title Label
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "DNS Filter Configuration"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$titleLabel.AutoSize = $true
$titleLabel.Location = New-Object System.Drawing.Point(20, 20)
$form.Controls.Add($titleLabel)

# Status Label
$statusText = New-Object System.Windows.Forms.Label
$statusText.Text = "Status: " + (Get-BlockerStatus)
$statusText.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$statusText.AutoSize = $true
$statusText.Location = New-Object System.Drawing.Point(20, 60)
if ($statusText.Text -match "Active") {
    $statusText.ForeColor = [System.Drawing.Color]::Green
} else {
    $statusText.ForeColor = [System.Drawing.Color]::Red
}
$form.Controls.Add($statusText)

# Group Box for Modes
$groupBox = New-Object System.Windows.Forms.GroupBox
$groupBox.Text = "Filter Level"
$groupBox.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$groupBox.Size = New-Object System.Drawing.Size(340, 120)
$groupBox.Location = New-Object System.Drawing.Point(20, 100)

# Radio Buttons
$radioStrict = New-Object System.Windows.Forms.RadioButton
$radioStrict.Text = "Strict Mode (Family Filter)`nBlocks porn, VPNs, and Reddit."
$radioStrict.AutoSize = $true
$radioStrict.Location = New-Object System.Drawing.Point(15, 30)
$radioStrict.Checked = $true # Default selection

$radioStandard = New-Object System.Windows.Forms.RadioButton
$radioStandard.Text = "Standard Mode (Adult Filter)`nBlocks porn, allows Reddit."
$radioStandard.AutoSize = $true
$radioStandard.Location = New-Object System.Drawing.Point(15, 75)

$groupBox.Controls.Add($radioStrict)
$groupBox.Controls.Add($radioStandard)
$form.Controls.Add($groupBox)

# Apply Button
$btnApply = New-Object System.Windows.Forms.Button
$btnApply.Text = "Apply Settings"
$btnApply.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnApply.Size = New-Object System.Drawing.Size(150, 40)
$btnApply.Location = New-Object System.Drawing.Point(20, 240)
$btnApply.BackColor = [System.Drawing.Color]::LightGreen

$btnApply.Add_Click({
    $btnApply.Enabled = $false
    $statusText.Text = "Status: Applying..."
    $statusText.ForeColor = [System.Drawing.Color]::Orange
    $form.Refresh()

    # Determine IPs
    if ($radioStrict.Checked) {
        $ip1 = "185.228.168.168"
        $ip2 = "185.228.169.168"
    } else {
        $ip1 = "185.228.168.10"
        $ip2 = "185.228.169.11"
    }

    # Clean old rules
    Get-DnsClientNrptRule | Where-Object { $_.Namespace -eq "." } | Remove-DnsClientNrptRule -Force -ErrorAction SilentlyContinue

    # Add new rule
    Add-DnsClientNrptRule -Namespace "." -NameServers $ip1, $ip2

    # Set physical adapters
    Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Set-DnsClientServerAddress -ServerAddresses ($ip1, $ip2)

    $statusText.Text = "Status: " + (Get-BlockerStatus)
    if ($statusText.Text -match "Active") {
        $statusText.ForeColor = [System.Drawing.Color]::Green
    }
    $btnApply.Enabled = $true
    [System.Windows.Forms.MessageBox]::Show("Filter settings applied successfully.", "Success", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
})
$form.Controls.Add($btnApply)

# Disable Button
$btnDisable = New-Object System.Windows.Forms.Button
$btnDisable.Text = "Disable Blocker"
$btnDisable.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$btnDisable.Size = New-Object System.Drawing.Size(150, 40)
$btnDisable.Location = New-Object System.Drawing.Point(210, 240)
$btnDisable.BackColor = [System.Drawing.Color]::LightCoral

$btnDisable.Add_Click({
    $result = [System.Windows.Forms.MessageBox]::Show("Are you sure you want to disable the blocker?", "Confirm Disable", [System.Windows.Forms.MessageBoxButtons]::YesNo, [System.Windows.Forms.MessageBoxIcon]::Warning)
    if ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
        $btnDisable.Enabled = $false
        $statusText.Text = "Status: Disabling..."
        $statusText.ForeColor = [System.Drawing.Color]::Orange
        $form.Refresh()

        # Remove NRPT rules
        Get-DnsClientNrptRule | Where-Object { $_.Namespace -eq "." } | Remove-DnsClientNrptRule -Force -ErrorAction SilentlyContinue

        # Reset physical adapters to automatic DNS
        Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Set-DnsClientServerAddress -ResetServerAddresses

        $statusText.Text = "Status: " + (Get-BlockerStatus)
        $statusText.ForeColor = [System.Drawing.Color]::Red
        $btnDisable.Enabled = $true
        [System.Windows.Forms.MessageBox]::Show("Porn blocker disabled.", "Disabled", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
    }
})
$form.Controls.Add($btnDisable)

# 6. Show the Form
[void]$form.ShowDialog()
