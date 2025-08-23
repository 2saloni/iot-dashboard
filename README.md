# MQTT Data API with JWT Authentication

A robust Node.js API built with TypeScript, Express, TypeORM, and PostgreSQL featuring JWT-based authentication for MQTT data management.

## Features

- 🔐 JWT Authentication (Access & Refresh tokens)
- 🗄️ PostgreSQL database with TypeORM
- 🔒 Password hashing with bcrypt
- ✅ Request validation with class-validator
- 🛡️ Protected routes middleware
- 🚀 Express.js with TypeScript
- 📝 Comprehensive error handling
- 🔄 Token refresh mechanism

## Quick Start

### 1. Environment Setup

Copy the environment example file and configure your settings:

```bash
cp env.example .env
```

Update `.env` with your database credentials and JWT secrets:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=mqtt_data

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_ACCESS_SECRET=your-super-secret-access-token-key
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=10
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Ensure PostgreSQL is running and create your database:

```sql
CREATE DATABASE mqtt_data;
```

### 4. Run the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/refresh-token` | Refresh access token | ❌ |
| POST | `/api/auth/logout` | Logout user | ✅ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| GET | `/api/auth/verify` | Verify token validity | ✅ |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## Usage Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### 3. Access Protected Route

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
src/
├── config/
│   ├── database.config.ts    # Database configuration
│   └── index.ts
├── controllers/
│   └── auth.controller.ts    # Authentication endpoints
├── dto/
│   ├── request/
│   │   └── auth.dto.ts       # Request validation DTOs
│   └── response/
│       └── auth.dto.ts       # Response DTOs
├── entities/
│   ├── user.entity.ts        # User database entity
│   ├── device.entity.ts      # Device entity
│   └── zone.entity.ts        # Zone entity
├── middlewares/
│   └── auth.middleware.ts    # JWT authentication middleware
├── routes/
│   ├── auth.routes.ts        # Authentication routes
│   └── index.ts              # Route aggregator
├── services/
│   └── auth.service.ts       # Authentication business logic
├── app.ts                    # Express application setup
└── index.ts                  # Application entry point
```

## Authentication Flow

1. **Register/Login**: User provides credentials and receives access + refresh tokens
2. **Access Token**: Short-lived (15 minutes) for API requests
3. **Refresh Token**: Long-lived (7 days) stored securely to get new access tokens
4. **Protected Routes**: Require valid access token in Authorization header
5. **Token Refresh**: Use refresh token to get new access token when expired
6. **Logout**: Invalidates refresh token

## Security Features

- ✅ Password hashing with bcrypt (configurable salt rounds)
- ✅ Separate secrets for access and refresh tokens
- ✅ Short-lived access tokens (15 minutes)
- ✅ Refresh token rotation on refresh
- ✅ Passwords excluded from query results by default
- ✅ Input validation with class-validator
- ✅ CORS headers configuration
- ✅ Error message sanitization in production

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (not implemented yet)

### Adding Protected Routes

1. Import the auth middleware:
```typescript
import { authenticate } from '../middlewares/auth.middleware';
```

2. Apply to routes:
```typescript
router.get('/protected-route', authenticate, yourController.method);
```

3. Access user info in controllers:
```typescript
const userId = req.user?.userId;
const email = req.user?.email;
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique JWT secrets
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use environment variables for all sensitive data
6. Enable database SSL if required
7. Set up proper logging and monitoring

## License

ISC
