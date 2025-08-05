# 🚖 Ride Booking System API

A secure, role-based backend API for managing a ride-booking system built with **Node.js**, **Express**, **MongoDB**, and **TypeScript**.

# Live Link
# [https://next-fifth-assignment-backend-production.up.railway.app/](https://next-fifth-assignment-backend-production.up.railway.app/)

## 🚀 Features

### 🔐 Authentication & Authorization
- 🗯 JWT-based Authentication with Roles (Admin, Rider, Driver)
- 🎯 Secure Password Hashing using bcrypt
- ✅ Role-Based Route Protection with Authorization Middleware

### 🧑‍💼 Rider Features
- 🚖 Request/Cancel Rides with Pickup & Destination Locations
- 🕓 View Ride History
- 💳 Secure Payments via Integrated Payment Gateway (using SSLCommerz)
- 🎯 Full Ride Lifecycle Management with History Tracking

### 🚗 Driver Features
- ✅ Accept/Cancel Ride Requests
- 🔄 Update Ride Status 
- 📍 Geo-based Driver Search

### 🧑‍⚖️ Admin Features
- 👥 View & Manage Users, Drivers, Rides and Bookings
- ✔️ Approve/Suspend Drivers
- 🚫 Block/Unblock Users
- 📊 Admin Dashboard with User, Ride, Driver, Booking and Payment  Analytics


### 📦 Infrastructure & Enhancements
- 🧠 Clean, Modular Architecture with Full Type Safety
- ☁️ Upload/View Invoice PDFs & images (stored on Cloudinary via multer)
- 📩 Send Invoice PDF & OTP via Email (using nodemailer)
- 🔁 OTP Storage with Redis for Expiration & Verification Logic
- 🚀 Optimized for Scalability & Maintainability
---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **JWT** for Authentication
- **bcryptjs** for Password Hashing
- **cors, cookie-parser, zod, dotenv** for Validate and Secure
- **Postman** – for API testing
---

## 📁 Project Structure

```txt
src/
├── modules/
│   ├── auth/                 # Login, registration, JWT logic
│   ├── user/                 # User CRUD and role logic (rider/driver/admin)
│   ├── driver/               # Driver operations (approval, status, etc.)
│   ├── ride/                 # Ride request, status, and history
│   ├── booking/              # Booking-specific logic 
│   ├── payment/              # Payment processing, history
│   ├── stats/                # Admin dashboard stats, reports
│   ├── otp/                  # OTP logic for verification 
│   └── sslcommerz/           # Integration with SSLCommerz payment gateway

├── middlewares/             # Auth, role guards, error handlers
├── config/                  # Env, DB, and passport config
├── utils/                   # Common utilities (e.g. token, hash, response)
├── app.ts                   # Main Express app setup
├── server.ts                # Server entry point

# Root files
.env.example/                  # Example environment configuration
Backend Ride Booking System APIs.postman_collection.json  # API testing collection

```

## 🧑‍💻 Getting Started

Follow these steps to run the project locally:

### 1. Clone the Repository.
### 2. Install the necessary dependencies.
### 3. Configure Environment Variables.
### 4. Run the application.

## 📡 API Endpoints

### Users
- `POST /api/v1/user/register` Register a new user
- `GET /api/v1/user/all-users` List all users (with filters)

**Query Parameters:**
- `fields` Select fields to return (e.g. `name,email`)
- `sort` `1` or `-1`
- `limit` Max number of users
- `page` For pagination

- `GET /api/v1/user/me` Get current logged-in user
- `PATCH /api/v1/user/:id` Update user profile
- `DELETE /api/v1/user/:id` Delete user profile
---

### OTP
- `POST /api/v1/otp/send` Send OTP to user
- `POST /api/v1/otp/verify` Verify OTP 

### Auth
- `POST /api/v1/auth/login` Login
- `POST /api/v1/auth/logout` Logout
- `POST /api/v1/auth/change-password` Change password
- `POST /api/v1/auth/reset-password` Reset password
- `POST /api/v1/auth/forgot-password` Forgot password
- `POST /api/v1/auth/refresh-token` Refresh JWT
- `POST /api/v1/auth/set-password` Set password
---

### Drivers
- `POST /api/v1/drivers/create` Create a driver profile
- `GET /api/v1/drivers` List all drivers (with filters)

**Query Parameters:**
- `searchTerm` Keyword search
- `limit` Number of drivers
- `page` Page number
- `sortBy` e.g. `createdAt`
- `sortOrder` `asc` or `desc`

- `GET /api/v1/drivers/:id` Get driver by ID
- `PATCH /api/v1/drivers/:id/status` Update drivers status
- `GET /api/v1/drivers/nearest` Find nearest drivers by geo-location

**Geo Query Parameters:**
- `lng` Longitude
- `lat` Latitude
- `radius` In kilometers
---

### Rides
- `POST /api/v1/rides/request` Request a new ride
- `GET /api/v1/rides` List rides (with filters)

**Query Parameters:**
- `status` e.g. `COMPLETED`, `CANCELLED`
- `limit` Number of results
- `sortBy` e.g. `createdAt`
- `sortOrder` `asc` or `desc`

- `GET /api/v1/rides/my-rides-history` Get logged-in user's ride history
- `PATCH /api/v1/rides/:id/cancel` Cancel a ride
---

### Bookings
- `POST /api/v1/booking` Create a booking
- `GET /api/v1/booking` List all bookings
- `GET /api/v1/booking/my-bookings` Get logged-in user's bookings
- `GET /api/v1/booking/:id` Get a booking by ID
- `PATCH /api/v1/booking/:id/status` Update booking status
---

### Payments
- `POST /api/v1/payment/init-payment/:bookingId` Initiate payment for booking
- `GET /api/v1/payment/invoice/:bookingId` Get invoice download URL
---

### Stats
- `GET /api/v1/stats/user` Get user statistics
- `GET /api/v1/stats/driver` Get driver statistics
- `GET /api/v1/stats/ride` Get ride statistics
- `GET /api/v1/stats/booking` Get booking statistics
- `GET /api/v1/stats/payment` Get payment statistics
---

## 🧹 Code Quality
- TypeScript interfaces for type safety.
- Centralized error handling.

## ✅ Status
Project is functional and under active development.