# ELT Dashboard Backend

Node.js/Express backend API for the ELT Dashboard MVP application.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment configuration
cp env.example .env

# Start development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── routes/           # API route handlers
│   ├── dataRoutes.js
│   └── uploadRoutes.js
├── services/         # Business logic services
│   ├── database.js
│   └── fileProcessor.js
├── uploads/          # File upload directory
├── data/             # SQLite database storage
├── server.js         # Main application entry point
├── package.json      # Dependencies and scripts
└── env.example      # Environment configuration template
```

## 🔧 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### File Upload
- `POST /api/upload/file` - Upload CSV/Excel file
- `GET /api/upload/files` - List uploaded files
- `DELETE /api/upload/file/:id` - Delete uploaded file
- `GET /api/upload/template/:format` - Download data template

### Data Management
- `GET /api/data/quarterly` - Get quarterly data
- `GET /api/data/comparison` - Get comparison data across quarters
- `GET /api/data/quarters` - Get available quarters
- `GET /api/data/metrics/:category` - Get metrics by category
- `GET /api/data/summary` - Get dashboard summary statistics
- `GET /api/data/trend/:metric` - Get trend analysis for specific metric

### Configuration
- `POST /api/data/config` - Save dashboard configuration
- `GET /api/data/config/:name` - Get dashboard configuration

## 🗄️ Database Schema

### Files Table
```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_size INTEGER,
  status TEXT DEFAULT 'uploaded'
);
```

### Quarterly Data Table
```sql
CREATE TABLE quarterly_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id INTEGER,
  quarter TEXT NOT NULL,
  year INTEGER NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value REAL,
  metric_unit TEXT,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files (id)
);
```

### Dashboard Config Table
```sql
CREATE TABLE dashboard_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_name TEXT UNIQUE NOT NULL,
  config_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📊 Data Processing

### Supported File Formats
- CSV (.csv)
- Excel (.xlsx, .xls)

### Data Validation
- Required columns: quarter, year, metric_name, metric_value
- Optional columns: metric_unit, category, description
- Quarter format: Q1, Q2, Q3, Q4
- Year range: 2020-2030
- Metric values: Numeric validation

### File Processing Flow
1. File upload validation
2. Format detection (CSV/Excel)
3. Data parsing and validation
4. Database storage
5. Error handling and cleanup

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Request throttling
- **CORS**: Cross-origin resource sharing
- **File Validation**: Type and size restrictions
- **Input Sanitization**: Data validation and cleaning

## 🛠️ Development

### Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run test suite
```

### Environment Variables
```env
PORT=5000                          # Server port
NODE_ENV=development               # Environment mode
FRONTEND_URL=http://localhost:3000 # CORS origin
DB_PATH=./data/dashboard.db        # Database path
MAX_FILE_SIZE=10485760            # Max upload size (10MB)
UPLOAD_DIR=./uploads              # Upload directory
```

## 📦 Dependencies

### Core Dependencies
- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `helmet`: Security middleware
- `express-rate-limit`: Rate limiting
- `multer`: File upload handling
- `sqlite3`: Database driver
- `csv-parser`: CSV file parsing
- `xlsx`: Excel file parsing
- `dotenv`: Environment variable management

### Development Dependencies
- `nodemon`: Development server with auto-restart
- `jest`: Testing framework

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
# Install production dependencies only
npm install --production

# Start production server
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up file storage (local or cloud)
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure monitoring and logging

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Performance Considerations

- **File Size Limits**: 10MB maximum upload size
- **Database Indexing**: Optimized queries for large datasets
- **Memory Management**: Efficient file processing
- **Rate Limiting**: Prevents abuse and overload
- **Error Handling**: Graceful failure handling

## 🔮 Future Enhancements

### Planned Features
- **Google Sheets API**: Direct data import
- **Authentication**: JWT-based user management
- **Caching**: Redis for improved performance
- **Monitoring**: Application performance metrics
- **Webhooks**: Real-time data synchronization
- **Batch Processing**: Large file handling
- **Data Export**: Multiple export formats

### Technical Improvements
- **Database Migration**: PostgreSQL for scalability
- **Microservices**: Service decomposition
- **Message Queues**: Asynchronous processing
- **API Versioning**: Backward compatibility
- **Documentation**: OpenAPI/Swagger specs
- **Load Testing**: Performance benchmarking
