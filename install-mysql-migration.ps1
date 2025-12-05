# MySQL Migration Installation Script
# Run this script to complete the MySQL migration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FANVIEW - MySQL Migration Installer  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if MySQL is installed
Write-Host "[1/6] Checking MySQL installation..." -ForegroundColor Yellow
$mysqlInstalled = Get-Command mysql -ErrorAction SilentlyContinue

if (-not $mysqlInstalled) {
    Write-Host "❌ MySQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install MySQL:" -ForegroundColor Yellow
    Write-Host "  Option 1: Download from https://dev.mysql.com/downloads/installer/" -ForegroundColor White
    Write-Host "  Option 2: Install XAMPP from https://www.apachefriends.org/" -ForegroundColor White
    Write-Host "  Option 3: Use Chocolatey: choco install mysql" -ForegroundColor White
    exit 1
}

Write-Host "✅ MySQL is installed" -ForegroundColor Green
Write-Host ""

# Step 2: Check if MySQL service is running
Write-Host "[2/6] Checking MySQL service status..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'Running' }

if (-not $mysqlService) {
    Write-Host "⚠️  MySQL service is not running" -ForegroundColor Yellow
    Write-Host "Attempting to start MySQL service..." -ForegroundColor Yellow
    
    try {
        $service = Get-Service -Name "MySQL*" -ErrorAction Stop | Select-Object -First 1
        Start-Service $service.Name -ErrorAction Stop
        Write-Host "✅ MySQL service started successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Could not start MySQL service automatically" -ForegroundColor Red
        Write-Host "Please start MySQL manually:" -ForegroundColor Yellow
        Write-Host "  - If using XAMPP: Open XAMPP Control Panel and start MySQL" -ForegroundColor White
        Write-Host "  - If using MySQL Service: Run 'net start MySQL80' as Administrator" -ForegroundColor White
        exit 1
    }
}
else {
    Write-Host "✅ MySQL service is running" -ForegroundColor Green
}
Write-Host ""

# Step 3: Install npm dependencies
Write-Host "[3/6] Installing npm dependencies..." -ForegroundColor Yellow
Set-Location -Path "d:\Downloads\1\project\server"

if (Test-Path "node_modules\mysql2") {
    Write-Host "✅ mysql2 package already installed" -ForegroundColor Green
}
else {
    Write-Host "Installing mysql2..." -ForegroundColor Yellow
    npm install mysql2
    Write-Host "✅ mysql2 package installed" -ForegroundColor Green
}
Write-Host ""

# Step 4: Check MySQL credentials
Write-Host "[4/6] Checking MySQL credentials..." -ForegroundColor Yellow
Write-Host "Please enter your MySQL root password (press Enter if no password):" -ForegroundColor Cyan
$mysqlPassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Update .env file with password if provided
if ($plainPassword) {
    Write-Host "Updating .env file with MySQL password..." -ForegroundColor Yellow
    $envPath = "d:\Downloads\1\project\server\.env"
    $envContent = Get-Content $envPath -Raw
    $envContent = $envContent -replace "MYSQL_PASSWORD=.*", "MYSQL_PASSWORD=$plainPassword"
    Set-Content -Path $envPath -Value $envContent
    Write-Host "✅ .env file updated" -ForegroundColor Green
}
else {
    Write-Host "✅ Using empty password" -ForegroundColor Green
}
Write-Host ""

# Step 5: Create database and import schema
Write-Host "[5/6] Creating database and importing schema..." -ForegroundColor Yellow
Write-Host "This will create the 'fanview' database and all tables..." -ForegroundColor Cyan

$schemaPath = "d:\Downloads\1\project\mysql\schema.sql"

if ($plainPassword) {
    $mysqlCommand = "mysql -u root -p$plainPassword < `"$schemaPath`" 2>&1"
}
else {
    $mysqlCommand = "mysql -u root < `"$schemaPath`" 2>&1"
}

try {
    $output = Invoke-Expression $mysqlCommand
    Write-Host "✅ Database schema imported successfully" -ForegroundColor Green
    
    # Verify tables were created
    if ($plainPassword) {
        $tables = mysql -u root -p$plainPassword -D fanview -e "SHOW TABLES;" 2>&1
    }
    else {
        $tables = mysql -u root -D fanview -e "SHOW TABLES;" 2>&1
    }
    
    Write-Host ""
    Write-Host "Database tables created:" -ForegroundColor Green
    Write-Host $tables
}
catch {
    Write-Host "❌ Error importing schema: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "You can manually import the schema using:" -ForegroundColor Yellow
    Write-Host "  mysql -u root -p < d:\Downloads\1\project\mysql\schema.sql" -ForegroundColor White
}
Write-Host ""

# Step 6: Restart server
Write-Host "[6/6] Restarting backend server..." -ForegroundColor Yellow

# Kill existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Starting server..." -ForegroundColor Yellow
Set-Location -Path "d:\Downloads\1\project\server"

# Start server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Downloads\1\project\server'; node server.js"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ MySQL Migration Complete!         " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check the new terminal window for server status" -ForegroundColor White
Write-Host "  2. You should see '✅ MySQL database connected successfully'" -ForegroundColor White
Write-Host "  3. Start your frontend: npm run dev" -ForegroundColor White
Write-Host "  4. Test the application at http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   d:\Downloads\1\project\MYSQL_MIGRATION_COMPLETE_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
