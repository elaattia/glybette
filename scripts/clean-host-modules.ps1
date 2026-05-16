[CmdletBinding(SupportsShouldProcess = $true)]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Remove-PathForce {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    try {
        Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
        return $true
    } catch {
        # Fallback for broken reparse points on Windows.
        $quoted = '"' + $Path + '"'
        cmd /c "rd /s /q $quoted" 2>$null | Out-Null
        return -not (Test-Path -LiteralPath $Path)
    }
}

function Remove-BrokenIgnoredLinks {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ModulesPath
    )

    if (-not (Test-Path -LiteralPath $ModulesPath)) {
        return
    }

    $ignoredEntries = Get-ChildItem -LiteralPath $ModulesPath -Recurse -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like ".ignored_*" -and ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) }

    foreach ($entry in $ignoredEntries) {
        if ($PSCmdlet.ShouldProcess($entry.FullName, "Remove broken reparse-point entry")) {
            $removed = Remove-PathForce -Path $entry.FullName
            if (-not $removed -and (Test-Path -LiteralPath $entry.FullName)) {
                Write-Warning "Could not fully remove reparse-point entry: $($entry.FullName)"
            }
        }
    }
}

function Remove-NodeModules {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TargetPath
    )

    if (-not (Test-Path -LiteralPath $TargetPath)) {
        return
    }

    Remove-BrokenIgnoredLinks -ModulesPath $TargetPath

    if ($PSCmdlet.ShouldProcess($TargetPath, "Remove node_modules directory")) {
        $removed = Remove-PathForce -Path $TargetPath
        if (-not $removed -and (Test-Path -LiteralPath $TargetPath)) {
            Write-Warning "Could not remove node_modules: $TargetPath"
        }
    }
}

$scriptsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptsDir "..")

Write-Host "Cleaning host node_modules folders under $repoRoot..."

$targets = New-Object System.Collections.Generic.List[string]
$targets.Add((Join-Path $repoRoot "node_modules"))

foreach ($scope in @("apps", "packages")) {
    $scopePath = Join-Path $repoRoot $scope
    if (-not (Test-Path -LiteralPath $scopePath)) {
        continue
    }

    $children = Get-ChildItem -LiteralPath $scopePath -Directory -ErrorAction SilentlyContinue
    foreach ($child in $children) {
        $targets.Add((Join-Path $child.FullName "node_modules"))
    }
}

foreach ($target in $targets) {
    Remove-NodeModules -TargetPath $target
}

Write-Host "Host node_modules cleanup completed."
