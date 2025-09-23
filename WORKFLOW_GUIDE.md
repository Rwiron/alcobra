# Alcobra Salon - Complete Workflow Guide

## 🚀 System Overview

Your salon booking system follows this flow:
**Admin Creates Services** → **Customers Browse & Book** → **Admin Manages Bookings**

---

## 📋 Phase 1: Initial Setup

### 1. Start the System
```bash
# Start the development server
npm run dev

# Server runs on: http://localhost:3000
# API Documentation: http://localhost:3000/api-docs
```

### 2. Seed Initial Data
```bash
# Creates categories, services, and admin user
npm run seed:salon
```

**What gets created:**
- ✅ Admin user: `admin@alcobrasalon.com` (password: `admin123`)
- ✅ 6 service categories (Face, Hair, Nails, Body, Bridal, Men's)
- ✅ 18 sample services with realistic pricing

---

## 👨‍💼 Phase 2: Admin Workflow

### Step 1: Admin Login
```bash
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@alcobrasalon.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "admin-id",
      "email": "admin@alcobrasalon.com",
      "name": "Alcobra Salon Admin"
    }
  }
}
```

### Step 2: Create Service Categories
```bash
POST /api/admin/categories
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Face Treatments",
  "description": "Professional facial treatments and skincare services",
  "color": "#FF6B6B",
  "iconClass": "fas fa-spa",
  "sortOrder": 1
}
```

### Step 3: Create Services
```bash
POST /api/admin/services
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Deep Cleansing Facial",
  "description": "Thorough facial treatment that deep cleanses pores",
  "duration": 60,
  "price": 85.00,
  "priceType": "fixed",
  "serviceType": "individual",
  "difficultyLevel": "intermediate",
  "categoryId": "face-treatments",
  "tags": ["facial", "cleansing", "skincare"],
  "preparationTime": 10,
  "cleanupTime": 15,
  "isActive": true,
  "isBookable": true,
  "requiresConsultation": false
}
```

### Step 4: Manage Services
```bash
# View all services
GET /api/admin/services?page=1&limit=20

# Update a service
PUT /api/admin/services/service-id

# Delete a service (only if no active bookings)
DELETE /api/admin/services/service-id
```

---

## 👥 Phase 3: Customer Workflow

### Step 1: Browse Available Services
```bash
# Get all categories
GET /api/categories

# Get services by category
GET /api/services?categoryId=face-treatments

# Get specific service details
GET /api/services/service-id
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "service-123",
      "name": "Deep Cleansing Facial",
      "description": "Thorough facial treatment...",
      "duration": 60,
      "price": "85.00",
      "category": {
        "name": "Face Treatments",
        "color": "#FF6B6B"
      }
    }
  ]
}
```

### Step 2: Create Booking Request
```bash
POST /api/bookings
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerEmail": "john@example.com",
  "serviceId": "service-123",
  "requestedDate": "2023-12-25",
  "requestedTime": "14:30",
  "notes": "First time customer, sensitive skin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking request submitted successfully. We will contact you soon to confirm.",
  "data": {
    "id": "booking-456",
    "customerName": "John Doe",
    "status": "PENDING",
    "service": {
      "name": "Deep Cleansing Facial",
      "duration": 60,
      "price": "85.00"
    }
  }
}
```

### Step 3: Check Booking Status
```bash
# Customer can check their booking with phone verification
GET /api/bookings/booking-456?phone=+1234567890
```

---

## 🔧 Phase 4: Admin Booking Management

### Step 1: View All Bookings
```bash
GET /api/admin/bookings?status=PENDING&page=1&limit=10
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking-456",
        "customerName": "John Doe",
        "customerPhone": "+1234567890",
        "status": "PENDING",
        "requestedDate": "2023-12-25",
        "requestedTime": "14:30:00",
        "service": {
          "name": "Deep Cleansing Facial",
          "price": "85.00"
        },
        "createdAt": "2023-12-20T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "total": 5,
      "pages": 1
    }
  }
}
```

### Step 2: Update Booking Status
```bash
PUT /api/admin/bookings/booking-456/status
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "CONFIRMED",
  "adminNotes": "Confirmed for 2:30 PM. Customer has sensitive skin."
}
```

### Step 3: Advanced Booking Management
```bash
# Filter bookings by status
GET /api/admin/bookings?status=CONFIRMED

# Search bookings by customer
GET /api/admin/bookings?search=john

# Filter by date range
GET /api/admin/bookings?dateFrom=2023-12-01&dateTo=2023-12-31

# View specific booking details
GET /api/admin/bookings/booking-456
```

---

## 📊 Booking Status Flow

```
PENDING → CONFIRMED → COMPLETED
    ↓         ↓
CANCELLED   NO_SHOW
```

**Status Meanings:**
- **PENDING**: New booking request, needs admin review
- **CONFIRMED**: Admin approved, appointment scheduled
- **COMPLETED**: Service was provided successfully
- **CANCELLED**: Booking was cancelled
- **NO_SHOW**: Customer didn't show up

---

## 🎯 Complete Example Workflow

### 1. Admin Sets Up Service
```bash
# 1. Login as admin
POST /api/admin/auth/login
{
  "email": "admin@alcobrasalon.com",
  "password": "admin123"
}

# 2. Create category
POST /api/admin/categories
{
  "name": "Face Wash Services",
  "description": "Various face washing treatments"
}

# 3. Create service
POST /api/admin/services
{
  "name": "Premium Face Wash",
  "duration": 30,
  "price": 45.00,
  "categoryId": "face-wash-category-id"
}
```

### 2. Customer Books Service
```bash
# 1. Browse services
GET /api/services

# 2. Create booking
POST /api/bookings
{
  "customerName": "Sarah Johnson",
  "customerPhone": "+1555123456",
  "serviceId": "premium-face-wash-id",
  "requestedDate": "2023-12-28",
  "requestedTime": "15:00"
}
```

### 3. Admin Manages Booking
```bash
# 1. View pending bookings
GET /api/admin/bookings?status=PENDING

# 2. Confirm booking
PUT /api/admin/bookings/booking-id/status
{
  "status": "CONFIRMED",
  "adminNotes": "Confirmed for Thursday 3 PM"
}

# 3. After service completion
PUT /api/admin/bookings/booking-id/status
{
  "status": "COMPLETED",
  "adminNotes": "Service completed successfully"
}
```

---

## 🔑 Key API Endpoints Summary

### **Public Endpoints (No Auth Required)**
- `GET /api/categories` - Browse service categories
- `GET /api/services` - Browse available services
- `GET /api/services/:id` - Get service details
- `POST /api/bookings` - Create booking request
- `GET /api/bookings/:id?phone=xxx` - Check booking status

### **Admin Auth Endpoints**
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/refresh` - Refresh tokens
- `GET /api/admin/auth/me` - Get admin profile
- `POST /api/admin/auth/logout` - Admin logout

### **Admin Management Endpoints (Auth Required)**
- `GET /api/admin/categories` - Manage categories
- `POST /api/admin/categories` - Create category
- `GET /api/admin/services` - Manage services
- `POST /api/admin/services` - Create service
- `GET /api/admin/bookings` - View all bookings
- `PUT /api/admin/bookings/:id/status` - Update booking status

---

## 🎨 Frontend Integration Tips

### 1. **Service Catalog Display**
```javascript
// Fetch categories with services
const categories = await fetch('/api/categories').then(r => r.json());

// Display with colors and icons
categories.data.forEach(category => {
  // Use category.color for styling
  // Use category.iconClass for icons
  // Show category.services for available services
});
```

### 2. **Booking Form**
```javascript
// Service selection
const services = await fetch('/api/services?categoryId=selected-category');

// Time slot validation (frontend)
const bookingData = {
  customerName: "John Doe",
  customerPhone: "+1234567890",
  serviceId: selectedService.id,
  requestedDate: "2023-12-25",
  requestedTime: "14:30"
};

const booking = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
});
```

### 3. **Admin Dashboard**
```javascript
// Login and store token
const login = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken } = login.data;
localStorage.setItem('adminToken', accessToken);

// Use token for admin requests
const bookings = await fetch('/api/admin/bookings', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

---

## 🚀 Next Steps

Your system is now ready for:

1. **Frontend Development** - Build React/Vue/Angular frontend
2. **File Upload** - Add service image upload functionality  
3. **Notifications** - Email/SMS notifications for booking updates
4. **Dashboard Analytics** - Booking statistics and reports
5. **Payment Integration** - Stripe/PayPal for online payments

The backend API is complete and production-ready! 🎉
