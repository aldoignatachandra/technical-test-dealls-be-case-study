# 🏢 Simple Payslip Generation System

This is a take-home technical test backend project implementing a scalable backend system for employee payslip generation system built with Bun, Hono, and PostgreSQL. This API-driven application handles employee data, attendance tracking, input overtime, payroll processing, payslip, and expense reimbursements.

## ✅ Main Features

- 📅 **Attendance Tracking**: Record employee clock-in times
- 💰 **Payroll Processing**: Generate employee payslips with detailed breakdowns
- 💸 **Overtime Handling**: Submit and process data input overtime
- 💸 **Reimbursement Handling**: Submit and process expense reimbursements
- 🔒 **Role-based Access Control**: Admin and employee-specific endpoints
- 📋 **Audit Logging**: Track all data changes for accountability

## ⚙️ Tech Highlights

### 🧱 Architecture

- **Modular Design**: Controllers → Services → Database layer separation
- **RESTful API**: Clean endpoints with proper HTTP methods and status codes
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Middleware Pipeline**: Authentication, logging, and error handling

### 🔧 Technologies

- **[Bun](https://bun.sh)**: Fast JavaScript runtime with built-in bundler and test runner
- **[Hono](https://hono.dev)**: Lightweight, high-performance web framework
- **[PostgreSQL](https://www.postgresql.org/)**: Reliable, scalable database
- **[Luxon](https://moment.github.io/luxon/)**: Modern date/time handling
- **[Zod](https://zod.dev/)**: Schema validation and type generation
- **[JWT](https://jwt.io/)**: Secure authentication with token-based access

### 🧪 Testing & Quality

- **Testing Framework**: Built with Bun's test runner (Jest-compatible)
- **Code Coverage**: Using Bun's built-in coverage reporting
- **Mocking**: Using Jest-compatible mocking via Bun's test API
- **Assertions**: Jest-style assertions provided by Bun's test runner

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/aldoignatachandra/Bun-Simple-Payslip-Generation-System

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Run database migrations and seeder ( 1 admin + 100 employee )
bun run migrate

# Start the development server
bun run dev
```

## 🔗 API Documentation

This project includes a Postman collection that documents all available API endpoints. The collection is available in the **api_doc** folder.

### 📁 Using the Postman Collection

Import the collection from `api_doc/api_documentation.postman_collection.json` into Postman

### 🔐 Authorization

The API uses role-based access control with JWT authentication:

- **Admin users**: Full access to all endpoints
- **Employee users**: Limited access to their own data
- **Authentication**: Include `Authorization: Bearer {token}` header with each request
- **Token Expiration**: Access tokens expire after 7 days, refresh tokens after 30 days

For detailed request/response examples and all available parameters, please refer to the Postman collection in the **api_doc** folder.

## 🧪 Testing

```bash
# Run all tests
bun run test

# Run tests with coverage
bun run test:coverage

```

## 📦 Project Structure

```
├── api_doc/             # API Documentation ( Postman Collection )
├── src/
│   ├── helpers/         # Utility functions
│   ├── middleware/      # Hono, token & user middlewares
│   ├── migrations/      # SQL For Migration Database, Tables and Seeders
│   ├── modules/         # Feature modules
│   │   ├── controllers/ # Request handlers
│   │   └── services/    # Business logic
│   │   └── sql/         # SQL Query To Database
│   ├── pipes/           # Request Validation And Additional Checking
│   ├── routes/          # API routes
│   ├── types/           # TypeScript Type Definitions
│   ├── validations/     # TypeScript Zod Validation Input
│   └── index.ts         # Application entry point
│   └── migration.ts     # File For Execute SQL Migration And Seeder
├── test/                # Test files
└── .env                 # Environment variables
```

## 🧩 Areas for Improvement

- 📝 **Unit Testing**: Increase test coverage across all modules and add more integration tests
- 📝 **Swagger Documentation**: Implement OpenAPI/Swagger for interactive API documentation
- 🐳 **Docker Containerization**: Containerize the application for consistent deployment
- 📈 **Load Testing**: Performance benchmarks and optimization with tools like k6 or Apache JMeter

## 🙏 Final Notes

This project demonstrates:

- ✅ **Modular Architecture**: Separation of concerns for maintainability
- ✅ **Type-Safe API**: End-to-end type safety with TypeScript and Zod
- ✅ **Modern JavaScript**: Leveraging Bun runtime for performance
- ✅ **Test Coverage**: Ongoing improvement of test coverage

---

**Notes:** Unit testing is still being improved. The current implementation demonstrates the testing approach with Bun's built-in test runner (Jest-compatible), but coverage could be further expanded in future iterations.

---

## 👨‍💻 Author

Created with 💻 by Ignata

- 📂 GitHub: [Aldo Ignata Chandra](https://github.com/aldoignatachandra)
- 💼 LinkedIn: [Aldo Ignata Chandra](https://linkedin.com/in/aldoignatachandra)

---
