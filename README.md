# Expenza - Expense Tracking Application

A full-stack expense tracking application with user authentication, transaction management, and analytics. Built with React frontend and Node.js/Express backend.

## 🚀 Features

### Frontend (React)
- 🔐 **User Authentication** - Login, signup, and logout functionality
- 💰 **Transaction Management** - Add, edit, delete transactions
- 📊 **Analytics Dashboard** - Visual charts and insights
- 🎨 **Modern UI** - Beautiful, responsive design
- 📱 **Mobile Responsive** - Works on all devices
- 🔍 **Search & Filter** - Find transactions easily
- 📈 **Income/Expense Tracking** - Separate tracking for income and expenses
- 🏷️ **Categories** - Organize transactions by categories
- 📅 **Date Filtering** - Filter by date ranges

### Backend (Node.js/Express)
- 🔐 **JWT Authentication** - Secure token-based authentication
- 🗄️ **MongoDB Database** - Scalable NoSQL database
- 🛡️ **Security Features** - Rate limiting, input validation, CORS
- 📝 **RESTful API** - Complete CRUD operations
- 🔍 **Advanced Queries** - Search, filter, and aggregation
- 📊 **Analytics Endpoints** - Transaction summaries and statistics
- 🚀 **Performance Optimized** - Efficient database queries and caching

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool
- **CSS3** - Custom styling with animations
- **Chart.js** - Data visualization
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd exp
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your configuration
# Update MongoDB URI and JWT secret
```

**Environment Variables (.env):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expenza
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

```bash
# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd Expenza

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
exp/
├── server/                 # Backend server
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   │   ├── middleware/
│   │   │   ├── auth.js         # Authentication middleware
│   │   │   └── validation.js   # Input validation
│   │   ├── models/
│   │   │   ├── User.js         # User model
│   │   │   └── Transaction.js  # Transaction model
│   │   ├── routes/
│   │   │   ├── auth.js         # Authentication routes
│   │   │   ├── transactions.js # Transaction routes
│   │   │   └── users.js        # User routes
│   │   ├── server.js           # Main server file
│   │   ├── package.json        # Backend dependencies
│   │   └── README.md           # Backend documentation
│   │
│   └── Expenza/               # Frontend application
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── context/        # React context
│       │   ├── hooks/          # Custom hooks
│       │   ├── styles/         # CSS files
│       │   ├── App.jsx         # Main app component
│       │   └── main.jsx        # Entry point
│       ├── package.json        # Frontend dependencies
│       └── README.md           # Frontend documentation
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

### Registration
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Protected Routes
All transaction and user routes require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout user

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get summary
- `GET /api/transactions/categories` - Get by category

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard` - Get dashboard data
- `GET /api/users/stats` - Get statistics

## 🗄️ Database Schema

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
  isSplit: Boolean,
  splitDetails: Object,
  location: String,
  paymentMethod: String,
  receipt: String,
  timestamps: true
}
```

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🔧 Development

### Backend Development
```bash
cd server
npm run dev          # Start development server
npm start           # Start production server
```

### Frontend Development
```bash
cd Expenza
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test            # Run tests (to be implemented)
```

### Frontend Testing
```bash
cd Expenza
npm test            # Run tests (to be implemented)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/expenza/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js team for the web framework
- MongoDB team for the database
- All contributors and users

---

**Made with ❤️ by the Expenza Team** 