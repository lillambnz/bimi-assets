# Australian Healthcare System - Frontend

React-based frontend application for the Australian Healthcare Management System.

## Features

### For Patients
- **User Registration & Login** - Secure authentication with Medicare validation
- **Find Doctors** - Search for AHPRA-verified doctors by specialty and location
- **Find Hospitals** - Locate healthcare facilities across Australia
- **Book Appointments** - Schedule appointments online
- **Medical Records** - Access complete medical history
- **E-Prescriptions** - View and manage prescriptions
- **Billing & Medicare** - View invoices and Medicare rebates
- **Profile Management** - Update personal and medical information

### For Doctors
- **Professional Dashboard** - Overview of appointments and patients
- **Patient Management** - Access patient records and history
- **Appointment Scheduling** - Manage daily schedule
- **E-Prescribing** - Create and manage prescriptions
- **Medical Records** - Create and update patient records
- **Billing** - Generate invoices with MBS item codes

## Technology Stack

- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **React Icons** - Icon library
- **Formik & Yup** - Form handling and validation
- **Chart.js** - Data visualization

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend API running on port 5000

### Installation

1. Install dependencies:
```bash
cd client
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure the API URL in `.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
client/
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── PrivateRoute.js
│   │   └── LoadingSpinner.js
│   ├── context/           # React Context
│   │   └── AuthContext.js
│   ├── pages/             # Page components
│   │   ├── public/        # Public pages
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── FindDoctorPage.js
│   │   │   └── FindHospitalPage.js
│   │   ├── patient/       # Patient portal
│   │   │   ├── PatientDashboard.js
│   │   │   ├── PatientAppointments.js
│   │   │   ├── BookAppointment.js
│   │   │   ├── PatientMedicalRecords.js
│   │   │   ├── PatientPrescriptions.js
│   │   │   ├── PatientBilling.js
│   │   │   └── PatientProfile.js
│   │   └── doctor/        # Doctor portal
│   │       ├── DoctorDashboard.js
│   │       ├── DoctorAppointments.js
│   │       ├── DoctorPatients.js
│   │       ├── CreatePrescription.js
│   │       ├── CreateMedicalRecord.js
│   │       └── DoctorProfile.js
│   ├── services/          # API services
│   │   ├── api.js
│   │   ├── patientService.js
│   │   ├── doctorService.js
│   │   └── hospitalService.js
│   ├── App.js             # Main app component
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
└── package.json
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner

## Features Overview

### Authentication
- Patient and doctor registration
- Secure JWT-based authentication
- Role-based access control
- Protected routes

### Patient Portal
- Dashboard with upcoming appointments
- Doctor and hospital search
- Online appointment booking
- Medical records viewer
- Prescription management
- Billing and invoice viewing
- Profile management

### Doctor Portal
- Dashboard with patient statistics
- Today's appointments
- Patient list with search
- Electronic prescribing
- Medical record creation
- Appointment management
- Schedule overview

### Search & Discovery
- Advanced doctor search with filters
- Hospital and clinic locator
- Specialty filtering
- Location-based search
- Bulk billing filter
- Accepting patients filter

## API Integration

The frontend communicates with the backend API using Axios. All API calls are centralized in service files:

- `api.js` - Base Axios configuration with interceptors
- `patientService.js` - Patient-related API calls
- `doctorService.js` - Doctor-related API calls
- `hospitalService.js` - Hospital-related API calls

## State Management

- **Auth Context** - Global authentication state
- **Local Component State** - Page-specific data

## Styling

- Custom CSS with CSS variables for theming
- Responsive design for mobile, tablet, and desktop
- Component-specific CSS modules
- Global utility classes

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Set the following in production:

```
REACT_APP_API_URL=https://your-api-domain.com
```

### Deployment Options

- **Netlify** - Automatic deployment from Git
- **Vercel** - Zero-config deployment
- **AWS S3 + CloudFront** - Scalable hosting
- **Heroku** - Easy deployment with backend

## Testing

Run tests with:

```bash
npm test
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues or questions:
- Create an issue on GitHub
- Email: support@healthcaresystem.au

## Acknowledgments

- React team for the amazing framework
- Australian healthcare professionals for requirements
- Medicare Australia for compliance guidelines
