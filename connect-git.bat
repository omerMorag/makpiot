@echo off
chcp 65001 >nul
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo === Installing Git ===
  winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
  set "PATH=%PATH%;C:\Program Files\Git\cmd"
)

echo === Connecting this folder to GitHub ===
git init -b main
git remote add origin https://github.com/omerMorag/makpiot.git
git fetch origin
git reset origin/main
git branch --set-upstream-to=origin/main main

git config --global user.name >nul 2>nul || git config --global user.name "Omer"
git config --global user.email >nul 2>nul || git config --global user.email "omermorag2@gmail.com"

echo.
echo === Done! Status: ===
git status
echo.
echo (You can delete connect-git.bat now)
pause
