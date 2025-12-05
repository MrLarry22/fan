# Stop all Node.js and Vite processes
Write-Host "🛑 Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "✅ All Node processes stopped" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting backend server on port 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Downloads\1\project\server'; npm run dev"

Start-Sleep -Seconds 5

Write-Host "🚀 Starting frontend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Downloads\1\project'; npm run dev"

Write-Host ""
Write-Host "✅ Servers starting in new windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Check the new PowerShell windows for status" -ForegroundColor Yellow
Write-Host "🌐 Frontend will be at: http://localhost:5173" -ForegroundColor Magenta
Write-Host "⚡ Backend will be at: http://localhost:3001" -ForegroundColor Magenta
Write-Host ""
Write-Host "⏳ Wait 10 seconds then open: http://localhost:5173" -ForegroundColor Cyan
