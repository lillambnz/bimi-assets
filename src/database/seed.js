const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config();

// Load models
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Medication = require('../models/Medication');
const Staff = require('../models/Staff');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample Hospitals
const hospitals = [
  {
    name: 'Sydney General Practice Clinic',
    facilityType: 'gp-clinic',
    classification: 'clinic',
    phone: '02 9876 5432',
    email: 'info@sydneygp.com.au',
    website: 'https://www.sydneygp.com.au',
    address: {
      street: '123 George Street',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000'
    },
    abn: '12345678901',
    numberOfBeds: 0,
    services: [
      { serviceName: 'General Consultation', available24Hours: false, bulkBilling: true },
      { serviceName: 'Telehealth', available24Hours: false, bulkBilling: true },
      { serviceName: 'Health Assessments', available24Hours: false, bulkBilling: true }
    ],
    departments: [
      { name: 'General Practice', operatingHours: { startTime: '08:00', endTime: '18:00', available24Hours: false } }
    ],
    specialties: ['General Practice'],
    operatingHours: [
      { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', is24Hours: false },
      { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', is24Hours: false },
      { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00', is24Hours: false },
      { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00', is24Hours: false },
      { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00', is24Hours: false }
    ],
    bulkBillingAvailable: true,
    isActive: true
  },
  {
    name: 'Melbourne Family Medical Centre',
    facilityType: 'medical-centre',
    classification: 'clinic',
    phone: '03 9876 5432',
    email: 'contact@melbournefmc.com.au',
    website: 'https://www.melbournefmc.com.au',
    address: {
      street: '456 Collins Street',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000'
    },
    abn: '98765432109',
    numberOfBeds: 5,
    services: [
      { serviceName: 'General Consultation', available24Hours: false, bulkBilling: true },
      { serviceName: 'Women\'s Health', available24Hours: false, bulkBilling: false },
      { serviceName: 'Children\'s Health', available24Hours: false, bulkBilling: true }
    ],
    specialties: ['General Practice', 'Paediatrics'],
    bulkBillingAvailable: true,
    isActive: true
  }
];

// Sample Doctors
const doctors = [
  {
    ahpraNumber: 'MED0123456789',
    medicareProviderNumber: '1234567AB',
    prescribingNumber: 'RX123456',
    title: 'Dr',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: new Date('1985-05-15'),
    gender: 'female',
    email: 'sarah.johnson@healthcaremail.com',
    password: 'Password123!',
    phone: '0412345678',
    address: {
      street: '10 Medical Lane',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000'
    },
    specialty: 'General Practice',
    qualifications: [
      {
        degree: 'MBBS',
        institution: 'University of Sydney',
        country: 'Australia',
        yearObtained: 2008,
        verified: true
      },
      {
        degree: 'FRACGP',
        institution: 'Royal Australian College of General Practitioners',
        country: 'Australia',
        yearObtained: 2013,
        verified: true
      }
    ],
    yearsOfExperience: 15,
    employmentStatus: 'full-time',
    bulkBillingAvailable: true,
    acceptingNewPatients: true,
    workingHours: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '14:00' }
    ],
    languagesSpoken: [
      { language: 'English', proficiency: 'native' },
      { language: 'Mandarin', proficiency: 'fluent' }
    ],
    isActive: true,
    isVerified: true,
    ahpraRegistrationExpiry: new Date('2025-12-31')
  },
  {
    ahpraNumber: 'MED9876543210',
    medicareProviderNumber: '9876543XY',
    prescribingNumber: 'RX987654',
    title: 'Dr',
    firstName: 'Michael',
    lastName: 'Chen',
    dateOfBirth: new Date('1980-03-20'),
    gender: 'male',
    email: 'michael.chen@healthcaremail.com',
    password: 'Password123!',
    phone: '0423456789',
    address: {
      street: '25 Health Avenue',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000'
    },
    specialty: 'General Practice',
    qualifications: [
      {
        degree: 'MBBS',
        institution: 'Monash University',
        country: 'Australia',
        yearObtained: 2005,
        verified: true
      }
    ],
    yearsOfExperience: 18,
    employmentStatus: 'full-time',
    bulkBillingAvailable: true,
    acceptingNewPatients: true,
    workingHours: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' }
    ],
    languagesSpoken: [
      { language: 'English', proficiency: 'native' }
    ],
    isActive: true,
    isVerified: true,
    ahpraRegistrationExpiry: new Date('2025-12-31')
  }
];

// Sample Patients
const patients = [
  {
    medicareNumber: '2123456789',
    irnNumber: '1',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: new Date('1990-01-15'),
    gender: 'male',
    email: 'john.smith@email.com',
    password: 'Password123!',
    phone: '0401234567',
    address: {
      street: '1 Smith Street',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000'
    },
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Wife',
      phone: '0409876543'
    },
    bloodType: 'O+',
    height: 180,
    weight: 80,
    consentToTreat: true,
    consentToShareInfo: true,
    consentDate: new Date()
  },
  {
    medicareNumber: '2987654321',
    irnNumber: '1',
    firstName: 'Emily',
    lastName: 'Brown',
    dateOfBirth: new Date('1985-07-22'),
    gender: 'female',
    email: 'emily.brown@email.com',
    password: 'Password123!',
    phone: '0412345678',
    address: {
      street: '10 Brown Avenue',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000'
    },
    emergencyContact: {
      name: 'David Brown',
      relationship: 'Husband',
      phone: '0423456789'
    },
    bloodType: 'A+',
    height: 165,
    weight: 60,
    consentToTreat: true,
    consentToShareInfo: true,
    consentDate: new Date()
  }
];

// Sample Medications
const medications = [
  {
    genericName: 'Amoxicillin',
    brandNames: [
      { name: 'Amoxil', manufacturer: 'GSK' },
      { name: 'Moxacin', manufacturer: 'Alphapharm' }
    ],
    therapeuticClass: 'Antibiotic',
    drugClass: ['antibiotic'],
    scheduleClass: 'S4',
    pbsListed: true,
    pbsCodes: [
      {
        code: '1215K',
        restriction: 'General Schedule',
        maxQuantity: 25,
        maxRepeats: 0,
        patientContribution: 42.50,
        pharmacistPrice: 11.50
      }
    ],
    formulations: [
      {
        form: 'capsule',
        strengths: [{ value: '500', unit: 'mg' }],
        route: 'oral',
        packaging: [{ size: 25, unit: 'capsules' }]
      }
    ],
    indications: [
      { condition: 'Bacterial infections', approved: true, offLabel: false }
    ],
    status: 'active'
  },
  {
    genericName: 'Paracetamol',
    brandNames: [
      { name: 'Panadol', manufacturer: 'GSK' },
      { name: 'Panamax', manufacturer: 'Sanofi' }
    ],
    therapeuticClass: 'Analgesic',
    drugClass: ['analgesic'],
    scheduleClass: 'S2',
    pbsListed: true,
    formulations: [
      {
        form: 'tablet',
        strengths: [{ value: '500', unit: 'mg' }],
        route: 'oral',
        packaging: [{ size: 20, unit: 'tablets' }]
      }
    ],
    indications: [
      { condition: 'Pain relief', approved: true, offLabel: false },
      { condition: 'Fever', approved: true, offLabel: false }
    ],
    status: 'active'
  }
];

// Import data
const importData = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...'.yellow);
    await Hospital.deleteMany();
    await Doctor.deleteMany();
    await Patient.deleteMany();
    await Medication.deleteMany();
    await Staff.deleteMany();

    // Import hospitals
    console.log('Importing hospitals...'.green);
    const createdHospitals = await Hospital.insertMany(hospitals);
    console.log(`✓ ${createdHospitals.length} hospitals imported`.green);

    // Update doctors with hospital references
    doctors[0].primaryWorkplace = createdHospitals[0]._id;
    doctors[1].primaryWorkplace = createdHospitals[1]._id;

    // Import doctors
    console.log('Importing doctors...'.green);
    const createdDoctors = await Doctor.insertMany(doctors);
    console.log(`✓ ${createdDoctors.length} doctors imported`.green);

    // Update patients with primary doctor
    patients[0].primaryDoctor = createdDoctors[0]._id;
    patients[1].primaryDoctor = createdDoctors[1]._id;

    // Import patients
    console.log('Importing patients...'.green);
    const createdPatients = await Patient.insertMany(patients);
    console.log(`✓ ${createdPatients.length} patients imported`.green);

    // Import medications
    console.log('Importing medications...'.green);
    const createdMedications = await Medication.insertMany(medications);
    console.log(`✓ ${createdMedications.length} medications imported`.green);

    console.log('\n✓ Data Import Complete!'.green.bold);
    console.log('\nTest Credentials:'.cyan.bold);
    console.log('\nDoctor:'.cyan);
    console.log('Email: sarah.johnson@healthcaremail.com');
    console.log('Password: Password123!');
    console.log('\nPatient:'.cyan);
    console.log('Email: john.smith@email.com');
    console.log('Password: Password123!\n');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error}`.red);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    console.log('Deleting all data...'.red);
    await Hospital.deleteMany();
    await Doctor.deleteMany();
    await Patient.deleteMany();
    await Medication.deleteMany();
    await Staff.deleteMany();

    console.log('✓ Data Deleted!'.green);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error}`.red);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please specify -i to import or -d to delete data'.yellow);
  process.exit(0);
}
