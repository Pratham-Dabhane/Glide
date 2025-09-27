# 🚀 Zapier Debugger & Monitor - Quick Deploy Script (PowerShell)
# This script helps you deploy both frontend and backend quickly on Windows

Write-Host "🚀 Zapier Debugger & Monitor - Deployment Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Function to check prerequisites
function Test-Prerequisites {
    Write-Host "📋 Checking prerequisites..." -ForegroundColor Blue
    
    # Check Node.js
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Node.js is not installed" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    # Check npm
    if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "❌ npm is not installed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Node.js and npm are installed" -ForegroundColor Green
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    
    try {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        Set-Location -Path "frontend"
        npm install
        if ($LASTEXITCODE -ne 0) { throw "Frontend dependency installation failed" }
        
        Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
        Set-Location -Path "..\backend"
        npm install
        if ($LASTEXITCODE -ne 0) { throw "Backend dependency installation failed" }
        
        Set-Location -Path ".."
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ $($_.Exception.Message)" -ForegroundColor Red
        Set-Location -Path ".."
        exit 1
    }
}

# Function to setup environment files
function Setup-Environment {
    Write-Host "🔧 Setting up environment files..." -ForegroundColor Blue
    
    # Frontend environment
    if (!(Test-Path "frontend\.env.local")) {
        if (Test-Path "frontend\.env.example") {
            Copy-Item "frontend\.env.example" "frontend\.env.local"
            Write-Host "⚠️  Created frontend\.env.local from example" -ForegroundColor Yellow
            Write-Host "⚠️  Please edit frontend\.env.local with your actual values" -ForegroundColor Yellow
        } else {
            Write-Host "❌ frontend\.env.example not found" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ frontend\.env.local already exists" -ForegroundColor Green
    }
    
    # Backend environment
    if (!(Test-Path "backend\.env")) {
        if (Test-Path "backend\.env.example") {
            Copy-Item "backend\.env.example" "backend\.env"
            Write-Host "⚠️  Created backend\.env from example" -ForegroundColor Yellow
            Write-Host "⚠️  Please edit backend\.env with your actual values" -ForegroundColor Yellow
        } else {
            Write-Host "❌ backend\.env.example not found" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ backend\.env already exists" -ForegroundColor Green
    }
}

# Function to clear cache
function Clear-Cache {
    Write-Host "🧹 Clearing cache..." -ForegroundColor Blue
    
    try {
        # Clear frontend cache
        if (Test-Path "frontend\.next") {
            Remove-Item -Path "frontend\.next" -Recurse -Force
            Write-Host "✅ Frontend cache cleared" -ForegroundColor Green
        }
        
        # Clear npm cache
        npm cache clean --force
        Write-Host "✅ npm cache cleared" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Cache clearing completed with warnings" -ForegroundColor Yellow
    }
}

# Function to build projects
function Build-Projects {
    Write-Host "🔨 Building projects..." -ForegroundColor Blue
    
    try {
        # Build frontend
        Write-Host "Building frontend..." -ForegroundColor Yellow
        Set-Location -Path "frontend"
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
        
        Set-Location -Path ".."
        Write-Host "✅ Projects built successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ $($_.Exception.Message)" -ForegroundColor Red
        Set-Location -Path ".."
        exit 1
    }
}

# Function to deploy frontend
function Deploy-Frontend {
    Write-Host "🌐 Deploying frontend to Vercel..." -ForegroundColor Blue
    
    # Check if Vercel CLI is installed
    if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g vercel
    }
    
    try {
        Set-Location -Path "frontend"
        vercel --prod
        Set-Location -Path ".."
        Write-Host "✅ Frontend deployed to Vercel" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Frontend deployment failed" -ForegroundColor Red
        Set-Location -Path ".."
        exit 1
    }
}

# Function to deploy backend
function Deploy-Backend {
    Write-Host "🚂 Deploying backend to Railway..." -ForegroundColor Blue
    
    # Check if Railway CLI is installed
    if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  Railway CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g @railway/cli
    }
    
    try {
        Set-Location -Path "backend"
        railway up
        Set-Location -Path ".."
        Write-Host "✅ Backend deployed to Railway" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Backend deployment failed" -ForegroundColor Red
        Set-Location -Path ".."
        exit 1
    }
}

# Function to start local development
function Start-LocalDevelopment {
    Write-Host "💻 Starting local development servers..." -ForegroundColor Blue
    
    # Kill any existing Node processes
    Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd" -ArgumentList "/c", "cd backend && npm start" -WindowStyle Normal
    
    Start-Sleep -Seconds 3
    
    Write-Host "Starting frontend server..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd" -ArgumentList "/c", "cd frontend && npm run dev" -WindowStyle Normal
    
    Write-Host "✅ Servers started!" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
    Write-Host "Backend: http://localhost:5000" -ForegroundColor Blue
    Write-Host "Press any key to continue..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Function to show menu
function Show-Menu {
    Write-Host ""
    Write-Host "What would you like to do?" -ForegroundColor Blue
    Write-Host "1. 📦 Install dependencies"
    Write-Host "2. 🔧 Setup environment files"
    Write-Host "3. 🧹 Clear cache"
    Write-Host "4. 🔨 Build projects"
    Write-Host "5. 🌐 Deploy frontend (Vercel)"
    Write-Host "6. 🚂 Deploy backend (Railway)"
    Write-Host "7. 🚀 Deploy both (Full deployment)"
    Write-Host "8. 💻 Start local development"
    Write-Host "9. 🏗️  Full setup (install + env + build)"
    Write-Host "10. ❌ Exit"
    Write-Host ""
}

# Main execution
Test-Prerequisites

do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-10)"
    
    switch ($choice) {
        "1" {
            Install-Dependencies
        }
        "2" {
            Setup-Environment
        }
        "3" {
            Clear-Cache
        }
        "4" {
            Build-Projects
        }
        "5" {
            Deploy-Frontend
        }
        "6" {
            Deploy-Backend
        }
        "7" {
            Write-Host "🚀 Full deployment starting..." -ForegroundColor Blue
            Clear-Cache
            Build-Projects
            Deploy-Frontend
            Deploy-Backend
            Write-Host "🎉 Full deployment completed!" -ForegroundColor Green
        }
        "8" {
            Start-LocalDevelopment
        }
        "9" {
            Write-Host "🏗️  Full setup starting..." -ForegroundColor Blue
            Install-Dependencies
            Setup-Environment
            Clear-Cache
            Build-Projects
            Write-Host "🎉 Full setup completed!" -ForegroundColor Green
            Write-Host "⚠️  Don't forget to update your environment files with actual values!" -ForegroundColor Yellow
        }
        "10" {
            Write-Host "👋 Goodbye!" -ForegroundColor Blue
            exit 0
        }
        default {
            Write-Host "❌ Invalid option. Please try again." -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
} while ($true)