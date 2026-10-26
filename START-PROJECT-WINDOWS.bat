@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title Gza Logistics Platform

echo =================================================
echo   GZA - Logistics Platform (React + Express + SQLite)
echo =================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js არ არის დაყენებული ან PATH-ში ვერ მოიძებნა.
  echo დააყენე Node.js 20.11 ან უფრო ახალი ვერსია: https://nodejs.org/
  echo შემდეგ დახურე და თავიდან გახსენი ეს ფაილი.
  echo.
  echo OPEN-DEMO.html მხოლოდ ცალკე HTML დემოა და React პროექტს არ ცვლის.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm ვერ მოიძებნა. ხელახლა დააყენე Node.js npm-თან ერთად.
  pause
  exit /b 1
)

echo Node version:
node --version
echo.
echo შეამოწმე ზემოთ მითითებული ვერსია: საჭიროა Node.js 20.11 ან უფრო ახალი.
echo.

if not exist "node_modules\vite" (
  echo პირველად საჭიროა პაკეტების დაყენება. საჭიროა ინტერნეტი.
  call npm install --no-audit --no-fund
  if errorlevel 1 goto :install_failed
)

echo.
echo მიმდინარეობს React ფრონტენდისა და Express API-ის გაშვება...
echo Vite-ის Local URL გახსენი ბრაუზერში (ჩვეულებრივ http://localhost:5173).
echo API health check: http://localhost:4000/api/health
echo გასაჩერებლად დააჭირე Ctrl+C.
echo.
call npm run dev:full
if errorlevel 1 (
  echo.
  echo [ERROR] აპლიკაცია არ გაეშვა. წაიკითხე ზემოთ ნაჩვენები შეცდომა.
  echo საჭიროების შემთხვევაში გაუშვი ცალ-ცალკე: npm run lint, npm run build, npm test.
  pause
  exit /b 1
)
endlocal
exit /b 0

:install_failed
echo.
echo [ERROR] პაკეტების დაყენება ვერ მოხერხდა. React პროექტი არ არის გაშვებული.
echo შეამოწმე ინტერნეტი და npm-ის შეცდომის ტექსტი, შემდეგ სცადე ხელახლა.
echo OPEN-DEMO.html მხოლოდ დიზაინის დემოა და არ ნიშნავს, რომ React API-მდე გაეშვა.
pause
exit /b 1
