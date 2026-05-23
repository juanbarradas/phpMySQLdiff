#!/bin/bash

# ==============================================================================
# phpMySQLDiff - Environment Setup Script
# ==============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}      phpMySQLDiff - Development Environment Setup    ${NC}"
echo -e "${BLUE}======================================================${NC}\n"

# Ensure we are in the project root
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory.${NC}"
    echo -e "Usage: ./script/setup_env.sh"
    exit 1
fi

# 1. Detect OS Package Manager
PKG_MANAGER=""
if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt"
elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
elif command -v yum &> /dev/null; then
    PKG_MANAGER="yum"
elif command -v pacman &> /dev/null; then
    PKG_MANAGER="pacman"
fi

install_packages() {
    local packages=$1
    if [ -z "$PKG_MANAGER" ]; then
        echo -e "${RED}Unsupported or unknown package manager. Please install manually: $packages${NC}"
        return 1
    fi
    echo -e "${YELLOW}Running: sudo $PKG_MANAGER install -y $packages${NC}"
    sudo $PKG_MANAGER install -y $packages
}

# 2. Check Node.js
echo -e "${BLUE}--- Checking Node.js Environment ---${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed.${NC}"
    read -p "Do you want to install Node.js and npm? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ "$PKG_MANAGER" == "apt" ]; then
            install_packages "nodejs npm"
        elif [ "$PKG_MANAGER" == "dnf" ] || [ "$PKG_MANAGER" == "yum" ]; then
            install_packages "nodejs npm"
        elif [ "$PKG_MANAGER" == "pacman" ]; then
            install_packages "nodejs npm"
        fi
    else
        echo -e "${RED}Node.js is required for the frontend. Please install it manually.${NC}"
    fi
else
    echo -e "${GREEN}✓ Node.js is installed ($(node -v)).${NC}"
fi

# 3. Check Angular CLI
if command -v npm &> /dev/null; then
    if ! command -v ng &> /dev/null; then
        echo -e "${YELLOW}Angular CLI is not installed.${NC}"
        read -p "Do you want to install Angular CLI globally? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Running: sudo npm install -g @angular/cli${NC}"
            sudo npm install -g @angular/cli
        fi
    else
        # Extract version carefully as ng version outputs a whole graphic
        NG_VERSION=$(ng version 2>/dev/null | grep -i "Angular CLI:" | awk '{print $3}')
        if [ -z "$NG_VERSION" ]; then
             NG_VERSION="installed"
        fi
        echo -e "${GREEN}✓ Angular CLI is installed ($NG_VERSION).${NC}"
    fi
fi

# 4. Install Frontend dependencies
echo -e "\n${BLUE}--- Installing Frontend Components ---${NC}"
if [ -d "frontend" ] && command -v npm &> /dev/null; then
    echo -e "${YELLOW}Installing npm packages in /frontend...${NC}"
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed.${NC}"
else
    echo -e "${YELLOW}Skipping frontend dependencies installation (npm not found).${NC}"
fi

# 5. Check PHP and Extensions
echo -e "\n${BLUE}--- Checking PHP Environment ---${NC}"
PHP_MISSING=0
PHP_EXT_MISSING_MYSQL=0
PHP_EXT_MISSING_SQLITE=0

if ! command -v php &> /dev/null; then
    PHP_MISSING=1
    echo -e "${YELLOW}PHP is not installed.${NC}"
else
    PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2)
    echo -e "${GREEN}✓ PHP is installed ($PHP_VERSION).${NC}"
    
    if ! php -m | grep -q -i "pdo_mysql"; then
        echo -e "${YELLOW}PHP extension 'pdo_mysql' is missing.${NC}"
        PHP_EXT_MISSING_MYSQL=1
    else
        echo -e "${GREEN}✓ PHP extension 'pdo_mysql' is installed.${NC}"
    fi
    
    if ! php -m | grep -q -i "pdo_sqlite"; then
        echo -e "${YELLOW}PHP extension 'pdo_sqlite' is missing.${NC}"
        PHP_EXT_MISSING_SQLITE=1
    else
        echo -e "${GREEN}✓ PHP extension 'pdo_sqlite' is installed.${NC}"
    fi
fi

if [ $PHP_MISSING -eq 1 ] || [ $PHP_EXT_MISSING_MYSQL -eq 1 ] || [ $PHP_EXT_MISSING_SQLITE -eq 1 ]; then
    read -p "Do you want to install the missing PHP components via your package manager? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PKGS_TO_INSTALL=""
        if [ "$PKG_MANAGER" == "apt" ]; then
            [ $PHP_MISSING -eq 1 ] && PKGS_TO_INSTALL="php php-cli"
            [ $PHP_EXT_MISSING_MYSQL -eq 1 ] && PKGS_TO_INSTALL="$PKGS_TO_INSTALL php-mysql"
            [ $PHP_EXT_MISSING_SQLITE -eq 1 ] && PKGS_TO_INSTALL="$PKGS_TO_INSTALL php-sqlite3"
        elif [ "$PKG_MANAGER" == "dnf" ] || [ "$PKG_MANAGER" == "yum" ]; then
            [ $PHP_MISSING -eq 1 ] && PKGS_TO_INSTALL="php php-cli"
            [ $PHP_EXT_MISSING_MYSQL -eq 1 ] && PKGS_TO_INSTALL="$PKGS_TO_INSTALL php-mysqlnd"
            [ $PHP_EXT_MISSING_SQLITE -eq 1 ] && PKGS_TO_INSTALL="$PKGS_TO_INSTALL php-pdo"
        elif [ "$PKG_MANAGER" == "pacman" ]; then
            [ $PHP_MISSING -eq 1 ] && PKGS_TO_INSTALL="php"
            [ $PHP_EXT_MISSING_MYSQL -eq 1 ] && PKGS_TO_INSTALL="$PKGS_TO_INSTALL php"
            [ $PHP_EXT_MISSING_SQLITE -eq 1 ] && PKGS_TO_INSTALL="$PKGS_TO_INSTALL php-sqlite"
        fi
        
        if [ ! -z "$PKGS_TO_INSTALL" ]; then
            install_packages "$PKGS_TO_INSTALL"
            echo -e "${YELLOW}Note: Depending on your Linux distribution, you may need to manually enable these extensions in your php.ini file (e.g. uncommenting extension=pdo_mysql).${NC}"
        fi
    else
        echo -e "${YELLOW}Skipping PHP installation.${NC}"
    fi
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}      Environment Setup Completed!                    ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "You can now start development using: ${BLUE}./script/start_dev.sh${NC}\n"
