# ELT Dashboard Frontend

Modern React frontend application for the ELT Dashboard MVP, built with React 18, Tailwind CSS, and Recharts.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
│   └── index.html
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Layout.js
│   │   ├── MetricCard.js
│   │   └── LoadingSpinner.js
│   ├── pages/           # Page components
│   │   ├── Dashboard.js
│   │   ├── DataUpload.js
│   │   ├── Analytics.js
│   │   └── Settings.js
│   ├── services/        # API services
│   │   └── api.js
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── App.js           # Main application component
│   ├── index.js         # Application entry point
│   └── index.css        # Global styles and Tailwind imports
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## 🎨 UI Components

### Layout Component
- Responsive sidebar navigation
- Mobile-friendly hamburger menu
- Status indicators
- User profile section

### MetricCard Component
- KPI display with trend indicators
- Color-coded metrics
- Icon support
- Responsive design

### LoadingSpinner Component
- Multiple size variants
- Consistent styling
- Accessibility support

## 📊 Pages

### Dashboard Page
- **KPI Cards**: Key metrics with trend indicators
- **Charts**: Multiple chart types for data visualization
- **Activity Feed**: Recent system activity
- **Data Summary**: Overview statistics

### Data Upload Page
- **Drag & Drop**: File upload with validation
- **Template Downloads**: CSV and Excel templates
- **File Management**: View and delete uploaded files
- **Requirements**: Data format specifications

### Analytics Page
- **Quarterly Comparison**: Compare metrics across quarters
- **Trend Analysis**: Time-series analysis
- **Filters**: Category and quarter selection
- **Data Export**: CSV export functionality

### Settings Page
- **Dashboard Preferences**: Refresh intervals, views
- **Notifications**: Alert configurations
- **Data Management**: Retention policies
- **Appearance**: Theme and styling options

## 🎨 Styling

### Tailwind CSS Configuration
- Custom color palette
- Extended animations
- Responsive breakpoints
- Component utilities

### Design System
- **Colors**: Primary, success, warning, danger variants
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Shadows**: Soft shadow system
- **Animations**: Fade, slide, and pulse effects

### Component Classes
```css
.btn-primary     # Primary button styling
.btn-secondary   # Secondary button styling
.card           # Card container styling
.metric-card    # Metric card styling
.input          # Form input styling
.loading-spinner # Loading animation
```

## 📡 API Integration

### API Service (`services/api.js`)
- Axios-based HTTP client
- Request/response interceptors
- Error handling
- Authentication support

### Service Modules
- **uploadService**: File upload operations
- **dataService**: Data retrieval and analysis
- **healthService**: System health checks

### API Endpoints
```javascript
// File operations
uploadService.uploadFile(file)
uploadService.getFiles()
uploadService.deleteFile(id)
uploadService.downloadTemplate(format)

// Data operations
dataService.getQuarterlyData(params)
dataService.getComparisonData(quarters)
dataService.getTrendAnalysis(metric)
dataService.getSummary()
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Collapsible sidebar
- Touch-friendly interactions
- Optimized chart sizing
- Responsive tables

## 🎯 User Experience

### Navigation
- Intuitive sidebar navigation
- Breadcrumb indicators
- Active state highlighting
- Mobile hamburger menu

### Feedback
- Toast notifications for actions
- Loading states for async operations
- Error handling with user-friendly messages
- Success confirmations

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes
- Focus indicators

## 📊 Data Visualization

### Chart Libraries
- **Recharts**: Primary charting library
- **Responsive**: Charts adapt to container size
- **Interactive**: Hover effects and tooltips
- **Customizable**: Color schemes and styling

### Chart Types
- **Line Charts**: Trend analysis
- **Bar Charts**: Comparative data
- **Area Charts**: Cumulative metrics
- **Pie Charts**: Category distribution
- **Composed Charts**: Multi-metric views

### Chart Features
- Responsive containers
- Custom tooltips
- Legend support
- Animation effects
- Export capabilities

## 🛠️ Development

### Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
npm run eject      # Eject from Create React App
```

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Development Features
- Hot reloading
- Source maps
- Error overlay
- ESLint integration

## 🧪 Testing

### Testing Strategy
- Component testing with React Testing Library
- API integration testing
- User interaction testing
- Accessibility testing

### Test Commands
```bash
npm test           # Run tests
npm run test:coverage  # Run with coverage
npm run test:watch     # Watch mode
```

## 🚀 Build & Deployment

### Production Build
```bash
npm run build
```

### Build Output
- Optimized JavaScript bundles
- Minified CSS
- Static assets
- Service worker (if enabled)

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFront, CloudFlare
- **Container**: Docker deployment
- **Server**: Nginx, Apache

## 📦 Dependencies

### Core Dependencies
- `react`: UI library
- `react-dom`: DOM rendering
- `react-router-dom`: Client-side routing
- `axios`: HTTP client
- `recharts`: Chart library
- `react-dropzone`: File upload
- `react-hot-toast`: Notifications
- `lucide-react`: Icon library
- `clsx`: Conditional class names
- `tailwindcss`: CSS framework

### Development Dependencies
- `react-scripts`: Build tools
- `@types/react`: TypeScript definitions
- `@types/react-dom`: TypeScript definitions

## 🔮 Future Enhancements

### Planned Features
- **Dark Mode**: Theme switching
- **Custom Dashboards**: User-configurable layouts
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Service worker implementation
- **Mobile App**: React Native version
- **Advanced Charts**: More chart types and interactions

### Technical Improvements
- **TypeScript**: Type safety
- **State Management**: Redux or Zustand
- **Performance**: Code splitting and lazy loading
- **Testing**: Comprehensive test coverage
- **Accessibility**: WCAG compliance
- **Internationalization**: Multi-language support
