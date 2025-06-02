#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to read environment variables from file
read_env_file() {
    if [ -f "../.env.production" ]; then
        echo "Reading environment variables from .env.production"
        export $(cat ../.env.production | sed 's/#.*//g' | xargs)
    else
        echo "Error: .env.production file not found in project root"
        exit 1
    fi
}

# Function to check required environment variables
check_env_vars() {
    read_env_file
    required_vars=("NEXTAUTH_SECRET" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET" "OPENAI_API_KEY" "STRIPE_SECRET_KEY" "STRIPE_WEBHOOK_SECRET" "STRIPE_PRICE_ID_PAY_PER_USE" "STRIPE_PRICE_ID_SUBSCRIPTION")
    
    for var in "${required_vars[@]}"; do
        eval value=\$$var
        if [ -z "$value" ]; then
            echo "Error: Required environment variable $var is not set"
            exit 1
        else
            echo "✓ Found $var"
        fi
    done
    echo "All required environment variables are set!"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Check environment variables
check_env_vars

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
sudo apt-get install -y apache2 certbot python3-certbot-apache

# Enable required Apache modules
sudo a2enmod ssl
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod rewrite

# Install Node.js 18.x (or your preferred version)
if ! command_exists node; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
if ! command_exists pm2; then
    sudo npm install -g pm2
fi

# Create production environment file
cat > .env.production << EOL
NEXTAUTH_URL=https://youtubetitletool.com
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
OPENAI_API_KEY=${OPENAI_API_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
STRIPE_PRICE_ID_PAY_PER_USE=${STRIPE_PRICE_ID_PAY_PER_USE}
STRIPE_PRICE_ID_SUBSCRIPTION=${STRIPE_PRICE_ID_SUBSCRIPTION}
EOL

# Copy Apache configuration
sudo cp apache-config.conf /etc/apache2/sites-available/projectalpha.conf

# Check if domain is accessible
if ! ping -c 1 youtubetitletool.com &> /dev/null; then
    echo "Warning: Domain youtubetitletool.com is not accessible. Please ensure DNS is properly configured."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get SSL certificate
sudo certbot --apache -d youtubetitletool.com -d www.youtubetitletool.com --non-interactive --agree-tos --email your-email@example.com

# Build and start the Next.js app
npm ci --production
npm run build
pm2 start npm --name "projectalpha" -- start

# Enable the site and restart Apache
sudo a2ensite projectalpha.conf
sudo a2dissite 000-default.conf
sudo systemctl restart apache2

# Save PM2 process list and configure startup
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Final checks
echo "Running final checks..."

# Check if Apache is running
if ! systemctl is-active --quiet apache2; then
    echo "Error: Apache is not running"
    exit 1
fi

# Check if PM2 process is running
if ! pm2 list | grep -q "projectalpha"; then
    echo "Error: Next.js application is not running"
    exit 1
fi

# Check if ports are listening
if ! netstat -tuln | grep -q ":80 "; then
    echo "Error: Port 80 is not listening"
    exit 1
fi

if ! netstat -tuln | grep -q ":443 "; then
    echo "Error: Port 443 is not listening"
    exit 1
fi

if ! netstat -tuln | grep -q ":3000 "; then
    echo "Error: Next.js application (Port 3000) is not listening"
    exit 1
fi

echo "Deployment completed successfully!"
echo "Please verify the following:"
echo "1. Visit https://youtubetitletool.com in your browser"
echo "2. Check Apache logs: tail -f /var/log/apache2/youtubetitletool.com-error.log"
echo "3. Check application logs: pm2 logs projectalpha" 