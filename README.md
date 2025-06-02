# Invoice Generator Pro

A streamlined, professional invoice generation and management system built for freelancers and small businesses.

## Features

- 📄 Professional invoice generation
- 💰 Payment tracking
- 📊 Basic financial reporting
- 📥 PDF export
- ✉️ Email integration
- 🔐 Secure user authentication

## Tech Stack

- Frontend: React with Material-UI
- Backend: Node.js & Express
- Database: PostgreSQL
- Authentication: JWT

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```
3. Create a `.env` file in the root directory with:
   ```
   DATABASE_URL=your_postgres_url
   JWT_SECRET=your_jwt_secret
   PORT=3001
   ```
4. Start the development server:
   ```bash
   npm run dev:full
   ```

## AWS Lightsail Deployment

1. Create a new Lightsail instance
2. Choose Node.js blueprint
3. Follow the deployment instructions in `docs/deployment.md`

## License

MIT 