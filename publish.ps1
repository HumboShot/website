param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$source = $PSScriptRoot
$dest = $env:WEBSITE_PUBLISH_DEST

if (-not (Test-Path -LiteralPath $dest)) {
    throw "Destination share not reachable: $dest"
}

$excludeDirs = @('.git', '.vscode', '.claude')
$excludeFiles = @('README.md', 'publish.ps1', 'publish.cmd')

$roboArgs = @($source, $dest, '/MIR',
    '/NFL', '/NDL', '/NJH', '/NP',
    '/R:2', '/W:3')

foreach ($dir in $excludeDirs) {
    $roboArgs += '/XD', $dir
}

foreach ($file in $excludeFiles) {
    $roboArgs += '/XF', $file
}

if ($DryRun) {
    $roboArgs += '/L'
}

& robocopy @roboArgs
$exit = $LASTEXITCODE

if ($DryRun) {
    if ($exit -le 7) {
        Write-Host "Dry run complete (robocopy exit code $exit) - no changes were made." -ForegroundColor Cyan
    }
    else {
        Write-Error "Robocopy failed with exit code $exit."
        exit $exit
    }
}
elseif ($exit -le 7) {
    Write-Host "Publish OK (robocopy exit code $exit)." -ForegroundColor Green
}
else {
    Write-Error "Publish failed: robocopy exit code $exit."
    exit $exit
}