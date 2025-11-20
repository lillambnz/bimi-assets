# Australian Healthcare Management System

A comprehensive healthcare management system designed for GPs, hospitals, and patients in Australia. This system manages appointments, medical records, prescriptions, billing, and Medicare integration.

## Features

### Patient Management
- Patient registration and authentication
- Complete patient profiles with medical history
- Allergies and chronic conditions tracking
- Immunization records
- Medicare card validation
- Emergency contact management

### Doctor/GP Management
- Doctor registration with AHPRA verification
- Specialty and sub-specialty management
- Working hours and availability scheduling
- Patient reviews and ratings
- Consultation types (in-person, telehealth, home visits)
- Bulk billing options

### Hospital/Clinic Management
- Multiple facility types support
- Department management
- Service offerings and specialties
- Emergency services tracking
- Quality metrics and patient satisfaction
- Equipment and resource management

### Appointment Scheduling
- Online appointment booking
- Multiple appointment types
- Conflict detection
- Appointment reminders (email/SMS)
- Check-in and wait time tracking
- Telehealth integration
- Appointment history and analytics

### Medical Records
- Comprehensive electronic medical records (EMR)
- Clinical notes and diagnoses
- Physical examination records
- Investigation results
- Pathology and radiology integration
- Procedure documentation
- Referral management
- Secure access controls and audit trails

### Prescription Management
- Electronic prescriptions
- PBS (Pharmaceutical Benefits Scheme) integration
- Drug interaction checking
- Repeat prescriptions
- Prescription tracking and dispensing history
- Authority prescriptions
- Schedule 4 and 8 medication management

### Billing and Medicare
- MBS (Medicare Benefits Schedule) item billing
- Bulk billing support
- Medicare claim submission
- Private health insurance integration
- DVA (Department of Veterans' Affairs) support
- Payment plans
- Invoice generation and tracking
- Gap cover calculations

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **React Toastify** - Notifications
- **React Icons** - Icon library

### Security
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing
- **Express Validator** - Input validation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd bimi-assets
```

2. Install backend dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Configure environment variables in .env:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/australian_healthcare
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
```

5. Start MongoDB:
```bash
mongod
```

6. Seed the database (optional):
```bash
node src/database/seed.js -i
```

7. Start the backend server:
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install frontend dependencies:
```bash
npm install
```

3. Create frontend .env file:
```bash
cp .env.example .env
```

4. Configure the API URL in client/.env:
```env
REACT_APP_API_URL=http://localhost:5000
```

5. Start the frontend development server:
```bash
npm start
```

The React app will be available at `http://localhost:3000`

### Quick Start (Both Backend & Frontend)

**Terminal 1 - Backend:**
```bash
# From project root
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# From project root
cd client
npm install
npm start
```

Access the application at `http://localhost:3000`

## API Endpoints

### Authentication & Users

#### Patients
- `POST /api/patients/register` - Register new patient
- `POST /api/patients/login` - Patient login
- `GET /api/patients/me` - Get current patient profile
- `PUT /api/patients/me` - Update patient profile
- `GET /api/patients` - Get all patients (Admin/Staff)
- `GET /api/patients/:id` - Get specific patient
- `GET /api/patients/:id/appointments` - Get patient appointments
- `GET /api/patients/:id/medical-records` - Get patient medical records
- `GET /api/patients/:id/prescriptions` - Get patient prescriptions

#### Doctors
- `POST /api/doctors/register` - Register new doctor
- `POST /api/doctors/login` - Doctor login
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get specific doctor
- `GET /api/doctors/search` - Search doctors by specialty/location
- `GET /api/doctors/:id/availability` - Check doctor availability
- `GET /api/doctors/:id/patients` - Get doctor's patients
- `GET /api/doctors/:id/appointments` - Get doctor's appointments
- `POST /api/doctors/:id/reviews` - Add review for doctor

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get specific appointment
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment
- `PUT /api/appointments/:id/checkin` - Check-in to appointment
- `PUT /api/appointments/:id/start` - Start consultation
- `PUT /api/appointments/:id/complete` - Complete appointment
- `GET /api/appointments/today` - Get today's appointments
- `GET /api/appointments/upcoming` - Get upcoming appointments

### Hospitals/Clinics
- `GET /api/hospitals` - Get all hospitals/clinics
- `GET /api/hospitals/:id` - Get specific hospital
- `GET /api/hospitals/search` - Search hospitals
- `GET /api/hospitals/:id/doctors` - Get hospital doctors
- `POST /api/hospitals` - Create hospital (Admin)
- `PUT /api/hospitals/:id` - Update hospital (Admin)
- `POST /api/hospitals/:id/reviews` - Add review

### Prescriptions
- `POST /api/prescriptions` - Create prescription (Doctor)
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get specific prescription
- `PUT /api/prescriptions/:id` - Update prescription
- `PUT /api/prescriptions/:id/cancel` - Cancel prescription
- `POST /api/prescriptions/:id/dispense` - Dispense prescription
- `POST /api/prescriptions/check-interactions` - Check drug interactions
- `GET /api/prescriptions/expiring` - Get expiring prescriptions

### Medical Records
- `POST /api/medical-records` - Create medical record (Doctor)
- `GET /api/medical-records` - Get all medical records
- `GET /api/medical-records/:id` - Get specific medical record
- `PUT /api/medical-records/:id` - Update medical record
- `GET /api/medical-records/patient/:patientId/history` - Get patient medical history
- `PUT /api/medical-records/:id/approve` - Approve medical record
- `POST /api/medical-records/:id/attachments` - Add attachment

### Billing
- `POST /api/billing` - Create invoice
- `GET /api/billing` - Get all invoices
- `GET /api/billing/:id` - Get specific invoice
- `POST /api/billing/:id/payment` - Add payment
- `POST /api/billing/:id/medicare-claim` - Submit Medicare claim
- `POST /api/billing/:id/payment-plan` - Create payment plan
- `GET /api/billing/patient/:patientId/history` - Get patient billing history
- `GET /api/billing/statistics` - Get billing statistics

## Australian Healthcare Compliance

### Medicare Integration
- MBS item number validation
- Medicare number validation (check digit algorithm)
- Bulk billing support
- Medicare rebate calculations
- Safety net threshold tracking

### PBS (Pharmaceutical Benefits Scheme)
- PBS listed medications
- Copayment calculations
- Authority prescriptions
- Streamlined authority process
- Safety net tracking

### Regulatory Compliance
- AHPRA registration validation
- Schedule 4 and 8 medication controls
- Narcotic prescription tracking
- Controlled substance management
- Privacy Act compliance
- My Health Record compatible data structure

### DVA Support
- DVA gold, white, and orange card support
- DVA specific billing
- Veterans' healthcare tracking

## Database Schema

### Collections
1. **Patients** - Patient demographics and medical history
2. **Doctors** - Doctor profiles and credentials
3. **Hospitals** - Healthcare facilities
4. **Appointments** - Appointment bookings and tracking
5. **MedicalRecords** - Clinical documentation
6. **Prescriptions** - Medication prescriptions
7. **Medications** - Drug database
8. **Billing** - Financial transactions and invoicing
9. **Staff** - Administrative and support staff

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- HTTPS/TLS encryption (production)
- Secure session management
- Audit trails for medical records
- HIPAA-compliant data handling

## User Roles

1. **Patient** - Book appointments, view records, manage profile
2. **Doctor/GP** - Manage patients, write prescriptions, clinical notes
3. **Specialist** - Advanced medical care and referrals
4. **Staff/Receptionist** - Manage appointments, check-ins, basic admin
5. **Admin** - Full system access, user management, configuration

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Run database seeder
npm run seed

# Run database migrations
npm run migrate
```

## Production Deployment

1. Set `NODE_ENV=production` in .env
2. Use a production MongoDB instance
3. Configure proper SMTP settings
4. Set up SSL/TLS certificates
5. Use environment variables for secrets
6. Enable MongoDB authentication
7. Set up backup procedures
8. Configure monitoring and logging

## API Documentation

API documentation is available at `/api/health` when the server is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For support, email support@healthcaresystem.au or create an issue in the repository.

## Acknowledgments

- Medicare Australia for MBS and PBS guidelines
- AHPRA for medical registration standards
- Australian Digital Health Agency for My Health Record compatibility
- PBS for pharmaceutical listings

## Version History

- **1.0.0** - Initial release with core functionality
  - Patient, Doctor, and Hospital management
  - Appointment scheduling
  - Medical records
  - Prescriptions
  - Billing and Medicare integration

## Future Enhancements

- Mobile application (iOS/Android)
- Patient portal web interface
- Real-time video consultations
- Integration with pathology/radiology systems
- Advanced analytics and reporting
- AI-powered diagnosis assistance
- Integration with My Health Record
- SMS notifications
- Online payment gateway
- Pharmacy integration
- Automated appointment reminders
- Waiting room management system
