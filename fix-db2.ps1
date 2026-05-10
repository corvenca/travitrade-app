$p = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
if ($p) { Stop-Process -Id $p.OwningProcess -Force }
Start-Sleep -Seconds 2
Remove-Item -Path "C:\Users\Ronalbis\travi-journals\data\journals.db" -Force -ErrorAction Continue
Remove-Item -Path "C:\Users\Ronalbis\travi-journals\data\journals.db-wal" -Force -ErrorAction Continue
Remove-Item -Path "C:\Users\Ronalbis\travi-journals\data\journals.db-shm" -Force -ErrorAction Continue
