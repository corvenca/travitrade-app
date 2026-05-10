$p = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
if ($p) { Stop-Process -Id $p.OwningProcess -Force }
Remove-Item "C:\Users\Ronalbis\travi-journals\data\journals.db" -Force -ErrorAction SilentlyContinue
