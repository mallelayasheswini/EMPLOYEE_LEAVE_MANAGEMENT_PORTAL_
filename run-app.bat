@echo off
echo =========================================================
echo   EMPLOYEE LEAVE MANAGEMENT PORTAL - STARTUP SERVER
echo =========================================================
echo.
echo Installing dependencies if needed...
call npm install
echo.
echo Syncing MongoDB Atlas database...
call npx prisma db push
echo.
echo Starting Next.js Web Portal on http://localhost:3000 ...
call npm run dev
pause
