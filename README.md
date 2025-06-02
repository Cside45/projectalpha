# Project Alpha - YouTube Title Tool

A powerful tool for optimizing and managing YouTube content, built with modern web technologies.

## Features

- 🎥 YouTube content optimization
- 📊 Analytics and data visualization
- 🤖 AI-powered assistance
- 💳 Premium features with Stripe integration
- 🔐 Secure authentication
- 📈 Real-time data tracking

## Tech Stack

### Core Technologies
- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

### Key Dependencies
- **UI Components**: 
  - Radix UI components (Label, Popover, Select, Slot, Switch, Tabs, Toast)
  - Framer Motion for animations
  - Chart.js & React-chartjs-2 for data visualization
  - Lucide React for icons
  - DayPicker for date selection

- **Data & Authentication**:
  - Next-Auth for authentication
  - Zod for schema validation
  - Nanoid for ID generation
  - date-fns for date manipulation

### Third-Party Services
- **OpenAI**: AI functionality for content optimization
- **Stripe**: Payment processing and subscription management
- **Cloudinary**: Media asset management
- **Vercel**: 
  - Hosting and deployment
  - KV Storage for data persistence
- **YouTube API**: Content management and analytics

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```
   # Authentication
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=http://localhost:3000

   # OpenAI
   OPENAI_API_KEY=your_openai_key

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   STRIPE_PRICE_ID=your_price_id

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Vercel KV
   KV_URL=your_kv_url
   KV_REST_API_URL=your_rest_api_url
   KV_REST_API_TOKEN=your_token
   KV_REST_API_READ_ONLY_TOKEN=your_readonly_token
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment

### AWS Lightsail Deployment

1. **Prerequisites**:
   - An AWS Lightsail instance running Ubuntu
   - A domain name pointed to your Lightsail instance's IP
   - SSH access to your instance

2. **Preparation**:
   - The `deployment` directory contains all necessary configuration files
   - `apache-config.conf`: Apache virtual host configuration
   - `setup.sh`: Automated setup script

3. **Deployment Steps**:
   ```bash
   # On your local machine
   git clone https://github.com/yourusername/projectalpha.git
   cd projectalpha
   
   # Copy files to Lightsail (replace with your instance details)
   scp -r deployment/* ubuntu@your-instance-ip:/home/ubuntu/
   
   # SSH into your instance
   ssh ubuntu@your-instance-ip
   
   # Make the setup script executable
   chmod +x setup.sh
   
   # Edit the configuration files with your domain
   nano apache-config.conf   # Replace yourdomain.com with your actual domain
   
   # Run the setup script
   ./setup.sh
   ```

4. **SSL Configuration**:
   - After running the setup script, uncomment and run the certbot command:
   ```bash
   sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
   ```
   - Follow the interactive prompts to set up SSL

5. **Verification**:
   - Check Apache status: `sudo systemctl status apache2`
   - Check Node.js app status: `pm2 status`
   - Visit your domain in a browser - should load with HTTPS

6. **Troubleshooting**:
   - Apache logs: `/var/log/apache2/error.log`
   - Application logs: `pm2 logs`
   - SSL issues: `certbot certificates`

## License

MIT 