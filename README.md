# 💇‍♀️ Salon & Spa Booking Backend

A comprehensive backend API for salon and spa booking management with admin panel, built with Express.js, TypeScript, MySQL (Prisma), and Redis.

## 🚀 Features

### Core Features
- **Admin-Only Management**: Streamlined admin panel for managing all bookings and services
- **Public Booking API**: Simple booking submission for customers
- **WhatsApp Integration**: Instant notifications to admin via WhatsApp
- **Service Management**: Complete CRUD operations for salon services
- **Media Upload**: S3 integration for service images and videos
- **Real-time Notifications**: Booking status updates and reminders

### Technical Features
- **TypeScript**: Full type safety and modern JavaScript features
- **JWT Authentication**: Secure admin authentication with access/refresh tokens
- **Rate Limiting**: Redis-based rate limiting for different endpoints
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: Comprehensive error handling with custom error classes
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Testing**: Jest test suite with coverage reports
- **Docker Support**: Complete Docker Compose setup
- **Database**: MySQL with Prisma ORM and migrations

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- MySQL 8.0+
- Redis 7+
- AWS S3 account (for media uploads)
- Twilio account (for WhatsApp integration)

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd salon-spa-backend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="mysql://salonuser:salonpass@localhost:3306/salon_spa_db"

# JWT Secrets (Change these!)
JWT_ACCESS_SECRET="your-super-secret-jwt-access-key"
JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-key"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
S3_BUCKET_NAME="salon-spa-media"

# WhatsApp/Twilio
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
ADMIN_WHATSAPP_NUMBER="whatsapp:+1234567890"
```

### 3. Start Services with Docker

```bash
# Start MySQL and Redis
npm run docker:up

# Verify services are running
docker ps
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data (creates default admin)
npm run prisma:seed

# Optional: Open Prisma Studio
npm run prisma:studio
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

Once the server is running, visit:
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🔗 API Endpoints

### Public Endpoints
```
GET  /api/services          # Get all active services
POST /api/bookings          # Submit booking request
```

### Admin Endpoints
```
# Authentication
POST /api/admin/auth/login      # Admin login
POST /api/admin/auth/refresh    # Refresh access token
POST /api/admin/auth/logout     # Admin logout

# Booking Management
GET  /api/admin/bookings        # Get all bookings
PUT  /api/admin/bookings/:id/status  # Update booking status

# Service Management  
GET    /api/admin/services      # Get all services
POST   /api/admin/services      # Create new service
PUT    /api/admin/services/:id  # Update service
DELETE /api/admin/services/:id  # Delete service

# Media & Dashboard
POST /api/admin/upload          # Upload media files
GET  /api/admin/dashboard/stats # Get dashboard statistics
```

## 🗄️ Database Schema

### Core Tables
- **admins**: Admin user management
- **services**: Salon services (name, price, duration, etc.)
- **bookings**: Customer booking requests
- **notifications**: System notifications

### Booking Status Flow
```
PENDING → CONFIRMED → COMPLETED
        → CANCELLED
        → NO_SHOW
```

## 🔧 Development Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:seed        # Seed database with initial data
npm run prisma:studio      # Open Prisma Studio

# Docker
npm run docker:up          # Start Docker services
npm run docker:down        # Stop Docker services

# Testing
npm test                   # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage

# Code Quality
npm run lint               # Check code style
npm run lint:fix           # Fix code style issues
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📱 WhatsApp Integration

The system integrates with Twilio's WhatsApp API to send notifications:

1. **New Booking**: Instant notification to admin
2. **Status Updates**: Booking confirmations, cancellations
3. **Reminders**: Upcoming appointment reminders

### Setup WhatsApp:
1. Create Twilio account
2. Enable WhatsApp sandbox or get approved number
3. Configure webhook URLs in Twilio console
4. Add credentials to `.env` file

## 🔒 Security Features

- **JWT Authentication**: Secure admin sessions
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configurable origin whitelist
- **Helmet Security**: Security headers
- **Error Handling**: Safe error responses

## 🚀 Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Strong JWT secrets
- Production database URL
- AWS S3 credentials
- Twilio credentials

### Build & Deploy
```bash
npm run build
npm start
```

### Docker Production
```bash
# Build production image
docker build -t salon-spa-backend .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring & Logs

- **Health Check**: `/health` endpoint for monitoring
- **Request Logging**: Morgan HTTP request logger
- **Error Tracking**: Comprehensive error logging
- **Performance**: Redis-based rate limiting and caching

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: admin@alcobrasalon.com
- Documentation: http://localhost:3000/api-docs

## 🔄 Changelog

### v1.0.0
- Initial release
- Admin authentication system
- Public booking API
- Service management
- WhatsApp integration
- Docker setup
- Complete API documentation
