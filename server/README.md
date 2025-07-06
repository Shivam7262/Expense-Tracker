# Expenza Backend Server

A robust Node.js/Express backend server for the Expenza expense tracking application with full authentication and transaction management capabilities.

## Features

- 🔐 **JWT Authentication** - Secure login, signup, and logout functionality
- 💰 **Transaction Management** - CRUD operations for income and expenses
- 👤 **User Management** - Profile management and settings
- 📊 **Analytics** - Transaction summaries, category breakdowns, and statistics
- 🔍 **Search & Filter** - Advanced search and filtering capabilities
- 📈 **Dashboard** - Comprehensive dashboard with insights
- 🛡️ **Security** - Rate limiting, input validation, and security headers
- 📝 **Validation** - Comprehensive request validation
- 🗄️ **MongoDB** - Scalable database with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limiting

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/expenza
   
   # JWT Secret (generate a strong secret)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # JWT Expiration
   JWT_EXPIRE=7d
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/logout` | Logout user | Private |
| POST | `/api/auth/refresh` | Refresh token | Private |
| DELETE | `/api/auth/account` | Delete account | Private |

### Transactions

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/transactions` | Get all transactions | Private |
| GET | `/api/transactions/:id` | Get transaction by ID | Private |
| POST | `/api/transactions` | Create new transaction | Private |
| PUT | `/api/transactions/:id` | Update transaction | Private |
| DELETE | `/api/transactions/:id` | Delete transaction | Private |
| GET | `/api/transactions/summary` | Get transaction summary | Private |
| GET | `/api/transactions/categories` | Get transactions by category | Private |
| GET | `/api/transactions/categories/list` | Get unique categories | Private |
| DELETE | `/api/transactions/bulk` | Bulk delete transactions | Private |
| GET | `/api/transactions/export` | Export transactions | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update user profile | Private |
| GET | `/api/users/dashboard` | Get dashboard data | Private |
| GET | `/api/users/stats` | Get user statistics | Private |
| GET | `/api/users/settings` | Get user settings | Private |
| PUT | `/api/users/settings` | Update user settings | Private |
| GET | `/api/users/activity` | Get user activity | Private |
| GET | `/api/users/search` | Search transactions | Private |

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "monthlyIncome": 0,
      "currency": "USD",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Create Transaction
```bash
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "amount": -50.00,
  "type": "expense",
  "category": "Food",
  "description": "Weekly groceries from Walmart",
  "date": "2023-01-15T10:30:00.000Z"
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Rate Limiting** - Prevents brute force attacks
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Configurable cross-origin resource sharing
- **Security Headers** - Helmet.js for security headers
- **Error Handling** - Secure error responses without sensitive data

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  avatar: String,
  monthlyIncome: Number,
  currency: String (enum),
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### Transaction Model
```javascript
{
  user: ObjectId (ref: User),
  title: String (required),
  amount: Number (required),
  type: String (enum: income/expense),
  category: String (required),
  description: String,
  date: Date,
  tags: [String],
  isRecurring: Boolean,
  recurringInterval: String,
  isSplit: Boolean,
  splitDetails: Object,
  location: String,
  paymentMethod: String,
  receipt: String,
  timestamps: true
}
```

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Project Structure
```
server/
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── models/
│   ├── User.js
│   └── Transaction.js
├── routes/
│   ├── auth.js
│   ├── transactions.js
│   └── users.js
├── server.js
├── package.json
└── README.md
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expenza
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRE=7d
```

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start server.js --name expenza-server

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository. 