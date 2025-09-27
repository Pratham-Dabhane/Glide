#!/bin/bash

# 🚀 Zapier Debugger & Monitor - Quick Deploy Script
# This script helps you deploy both frontend and backend quickly

echo "🚀 Zapier Debugger & Monitor - Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    echo "Installing frontend dependencies..."
    cd frontend && npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Frontend dependency installation failed${NC}"
        exit 1
    fi
    
    echo "Installing backend dependencies..."
    cd ../backend && npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Backend dependency installation failed${NC}"
        exit 1
    fi
    
    cd ..
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
}

# Function to setup environment files
setup_environment() {
    echo -e "${BLUE}🔧 Setting up environment files...${NC}"
    
    # Frontend environment
    if [ ! -f "frontend/.env.local" ]; then
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env.local
            echo -e "${YELLOW}⚠️  Created frontend/.env.local from example${NC}"
            echo -e "${YELLOW}⚠️  Please edit frontend/.env.local with your actual values${NC}"
        else
            echo -e "${RED}❌ frontend/.env.example not found${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ frontend/.env.local already exists${NC}"
    fi
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            echo -e "${YELLOW}⚠️  Created backend/.env from example${NC}"
            echo -e "${YELLOW}⚠️  Please edit backend/.env with your actual values${NC}"
        else
            echo -e "${RED}❌ backend/.env.example not found${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ backend/.env already exists${NC}"
    fi
}

# Function to build projects
build_projects() {
    echo -e "${BLUE}🔨 Building projects...${NC}"
    
    # Build frontend
    echo "Building frontend..."
    cd frontend && npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Frontend build failed${NC}"
        exit 1
    fi
    
    cd ..
    echo -e "${GREEN}✅ Projects built successfully${NC}"
}

# Function to deploy to Vercel
deploy_frontend() {
    echo -e "${BLUE}🌐 Deploying frontend to Vercel...${NC}"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
        npm install -g vercel
    fi
    
    cd frontend
    vercel --prod
    cd ..
    
    echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
}

# Function to deploy to Railway
deploy_backend() {
    echo -e "${BLUE}🚂 Deploying backend to Railway...${NC}"
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
        npm install -g @railway/cli
    fi
    
    cd backend
    railway up
    cd ..
    
    echo -e "${GREEN}✅ Backend deployed to Railway${NC}"
}

# Function to start local development
start_local() {
    echo -e "${BLUE}💻 Starting local development servers...${NC}"
    
    echo -e "${YELLOW}Starting backend server...${NC}"
    cd backend
    npm start &
    BACKEND_PID=$!
    
    echo -e "${YELLOW}Starting frontend server...${NC}"
    cd ../frontend
    npm run dev &
    FRONTEND_PID=$!
    
    cd ..
    
    echo -e "${GREEN}✅ Servers started!${NC}"
    echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}Backend: http://localhost:5000${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop servers${NC}"
    
    # Wait for interrupt
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}What would you like to do?${NC}"
    echo "1. 📦 Install dependencies"
    echo "2. 🔧 Setup environment files"
    echo "3. 🔨 Build projects"
    echo "4. 🌐 Deploy frontend (Vercel)"
    echo "5. 🚂 Deploy backend (Railway)"
    echo "6. 🚀 Deploy both (Full deployment)"
    echo "7. 💻 Start local development"
    echo "8. 🏗️  Full setup (install + env + build)"
    echo "9. ❌ Exit"
    echo ""
}

# Main execution
while true; do
    show_menu
    read -p "Enter your choice (1-9): " choice
    
    case $choice in
        1)
            install_dependencies
            ;;
        2)
            setup_environment
            ;;
        3)
            build_projects
            ;;
        4)
            deploy_frontend
            ;;
        5)
            deploy_backend
            ;;
        6)
            echo -e "${BLUE}🚀 Full deployment starting...${NC}"
            build_projects
            deploy_frontend
            deploy_backend
            echo -e "${GREEN}🎉 Full deployment completed!${NC}"
            ;;
        7)
            start_local
            ;;
        8)
            echo -e "${BLUE}🏗️  Full setup starting...${NC}"
            install_dependencies
            setup_environment
            build_projects
            echo -e "${GREEN}🎉 Full setup completed!${NC}"
            echo -e "${YELLOW}⚠️  Don't forget to update your environment files with actual values!${NC}"
            ;;
        9)
            echo -e "${BLUE}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done