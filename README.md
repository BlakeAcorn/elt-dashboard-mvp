# ELT Dashboard MVP

A comprehensive analytics dashboard application for software companies, designed to display and analyze key performance indicators (KPIs) and metrics across quarters.

## 🚀 Features

### Data Upload and Management
- **File Upload**: Support for CSV, XLS, and XLSX file formats
- **Data Validation**: Automatic validation of uploaded data with clear error messages
- **Template Downloads**: Pre-formatted templates for easy data entry
- **File Management**: View, manage, and delete uploaded files

### Data Display and Analysis
- **Interactive Dashboard**: Real-time KPI cards with trend indicators
- **Chart Visualizations**: Multiple chart types including line, bar, area, and pie charts
- **Quarterly Comparison**: Compare metrics across different quarters
- **Trend Analysis**: Analyze trends for specific metrics over time
- **Data Export**: Export comparison data to CSV format

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Real-time Updates**: Auto-refresh capabilities with configurable intervals
- **Toast Notifications**: User-friendly feedback for all actions

### Scalability
- **Modular Architecture**: Separated frontend and backend for easy scaling
- **Database Integration**: SQLite database with structured data storage
- **API-First Design**: RESTful API ready for future integrations
- **Google Sheets Ready**: Architecture prepared for Google Sheets API integration

## 🏗️ Architecture

### Backend (Node.js/Express)
- **API Server**: RESTful API with Express.js
- **File Processing**: Support for CSV and Excel file parsing
- **Database**: SQLite for data persistence
- **Security**: Helmet.js for security headers, rate limiting
- **Validation**: Comprehensive data validation and error handling

### Frontend (React)
- **Modern React**: Built with React 18 and functional components
- **Routing**: React Router for navigation
- **Charts**: Recharts library for data visualization
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks for state management
- **File Upload**: React Dropzone for drag-and-drop file uploads

## 📊 Dashboard Components

### KPI Cards
- ARR (Annual Recurring Revenue)
- Customer Churn Rate
- Deployment Frequency
- Uptime/SLA
- And more customizable metrics

### Chart Types
- **Line Charts**: For trend analysis over time
- **Bar Charts**: For quarterly comparisons
- **Area Charts**: For cumulative metrics
- **Pie Charts**: For category distribution
- **Composed Charts**: For complex multi-metric views

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DB_PATH=./data/dashboard.db
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

## 📁 Data Format

### Required Columns
- `quarter`: Q1, Q2, Q3, or Q4
- `year`: 2020-2030
- `metric_name`: Name of the metric (e.g., "ARR", "Churn Rate")
- `metric_value`: Numeric value

### Optional Columns
- `metric_unit`: Unit of measurement (e.g., "USD", "%")
- `category`: Category grouping (e.g., "Financial", "Customer")
- `description`: Additional context

### Sample Data
```csv
quarter,year,metric_name,metric_value,metric_unit,category,description
Q1,2024,ARR,6500000,USD,Financial,Annual Recurring Revenue
Q1,2024,Customer Churn Rate,5.2,%,Customer,Percentage of customers lost
Q1,2024,Deployment Frequency,12,per month,Engineering,Number of deployments per month
```

## 🔧 API Endpoints

### Upload Endpoints
- `POST /api/upload/file` - Upload data file
- `GET /api/upload/files` - Get uploaded files
- `DELETE /api/upload/file/:id` - Delete file
- `GET /api/upload/template/:format` - Download template

### Data Endpoints
- `GET /api/data/quarterly` - Get quarterly data
- `GET /api/data/comparison` - Get comparison data
- `GET /api/data/quarters` - Get available quarters
- `GET /api/data/metrics/:category` - Get metrics by category
- `GET /api/data/summary` - Get dashboard summary
- `GET /api/data/trend/:metric` - Get trend analysis

### Configuration Endpoints
- `POST /api/data/config` - Save dashboard configuration
- `GET /api/data/config/:name` - Get dashboard configuration

## 🚀 Future Enhancements

### Planned Features
- **Google Sheets Integration**: Direct import from Google Sheets
- **Real-time Data Sync**: WebSocket support for live updates
- **Advanced Analytics**: Statistical analysis and forecasting
- **Custom Dashboards**: User-configurable dashboard layouts
- **Team Collaboration**: Multi-user support with role-based access
- **Mobile App**: React Native mobile application
- **API Integrations**: Connect with popular business tools

### Technical Improvements
- **Database Migration**: PostgreSQL for production scalability
- **Authentication**: JWT-based user authentication
- **Caching**: Redis for improved performance
- **Monitoring**: Application performance monitoring
- **Testing**: Comprehensive test suite
- **CI/CD**: Automated deployment pipeline

## 📝 Usage Guide

### 1. Upload Data
1. Navigate to the Data Upload page
2. Download a template (CSV or Excel)
3. Fill in your quarterly data
4. Upload the file using drag-and-drop or file browser
5. Review validation results

### 2. View Dashboard
1. The main dashboard shows key metrics
2. Charts display trends and comparisons
3. Use filters to focus on specific time periods
4. Export data for external analysis

### 3. Analyze Trends
1. Go to the Analytics page
2. Select quarters for comparison
3. Choose metrics to analyze
4. View trend charts and comparison tables
5. Export results for reporting

### 4. Configure Settings
1. Access the Settings page
2. Customize dashboard preferences
3. Configure notifications
4. Manage data retention policies
5. Adjust appearance settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

### Phase 1 (Current MVP)
- ✅ Basic file upload and processing
- ✅ Dashboard with KPI cards
- ✅ Chart visualizations
- ✅ Quarterly comparisons
- ✅ Settings configuration

### Phase 2 (Next Release)
- 🔄 Google Sheets integration
- 🔄 User authentication
- 🔄 Advanced analytics
- 🔄 Custom dashboards

### Phase 3 (Future)
- 🔄 Real-time data sync
- 🔄 Mobile application
- 🔄 Team collaboration features
- 🔄 API marketplace integrations
