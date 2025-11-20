const nodemailer = require('nodemailer');

/**
 * Email Service for sending notifications
 */

// Create reusable transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * Send appointment confirmation email
 */
async function sendAppointmentConfirmation(appointment, patient, doctor, hospital) {
  const mailOptions = {
    from: `${hospital.name} <${process.env.SMTP_USER}>`,
    to: patient.email,
    subject: `Appointment Confirmation - ${appointment.appointmentNumber}`,
    html: `
      <h2>Appointment Confirmation</h2>
      <p>Dear ${patient.firstName} ${patient.lastName},</p>
      <p>Your appointment has been confirmed:</p>
      <ul>
        <li><strong>Doctor:</strong> ${doctor.title} ${doctor.firstName} ${doctor.lastName}</li>
        <li><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('en-AU')}</li>
        <li><strong>Time:</strong> ${appointment.startTime}</li>
        <li><strong>Location:</strong> ${hospital.name}</li>
        <li><strong>Address:</strong> ${hospital.address.street}, ${hospital.address.suburb}, ${hospital.address.state} ${hospital.address.postcode}</li>
        <li><strong>Type:</strong> ${appointment.appointmentType}</li>
      </ul>
      <p><strong>Appointment Number:</strong> ${appointment.appointmentNumber}</p>
      <p>Please arrive 10 minutes early for check-in.</p>
      <p>If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
      <p>Best regards,<br>${hospital.name}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Appointment confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
  }
}

/**
 * Send appointment reminder email
 */
async function sendAppointmentReminder(appointment, patient, doctor, hospital) {
  const mailOptions = {
    from: `${hospital.name} <${process.env.SMTP_USER}>`,
    to: patient.email,
    subject: `Appointment Reminder - Tomorrow`,
    html: `
      <h2>Appointment Reminder</h2>
      <p>Dear ${patient.firstName} ${patient.lastName},</p>
      <p>This is a reminder of your upcoming appointment tomorrow:</p>
      <ul>
        <li><strong>Doctor:</strong> ${doctor.title} ${doctor.firstName} ${doctor.lastName}</li>
        <li><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('en-AU')}</li>
        <li><strong>Time:</strong> ${appointment.startTime}</li>
        <li><strong>Location:</strong> ${hospital.name}</li>
      </ul>
      <p>Please remember to bring your Medicare card and any relevant medical documents.</p>
      <p>See you tomorrow!</p>
      <p>Best regards,<br>${hospital.name}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Appointment reminder email sent successfully');
  } catch (error) {
    console.error('Error sending appointment reminder email:', error);
  }
}

/**
 * Send prescription notification email
 */
async function sendPrescriptionNotification(prescription, patient, doctor) {
  const mailOptions = {
    from: `Healthcare System <${process.env.SMTP_USER}>`,
    to: patient.email,
    subject: `New Prescription - ${prescription.prescriptionNumber}`,
    html: `
      <h2>New Prescription</h2>
      <p>Dear ${patient.firstName} ${patient.lastName},</p>
      <p>Dr. ${doctor.lastName} has prescribed the following medication(s):</p>
      <ul>
        ${prescription.medications.map(med => `
          <li>
            <strong>${med.medicationName}</strong><br>
            Dosage: ${med.dosage}<br>
            Directions: ${med.directions}<br>
            Quantity: ${med.quantity} ${med.unit}<br>
            Repeats: ${med.repeats}
          </li>
        `).join('')}
      </ul>
      <p><strong>Prescription Number:</strong> ${prescription.prescriptionNumber}</p>
      <p>You can take this prescription to any pharmacy in Australia.</p>
      <p>The prescription is valid until: ${new Date(prescription.expiryDate).toLocaleDateString('en-AU')}</p>
      <p>Best regards,<br>Healthcare System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Prescription notification email sent successfully');
  } catch (error) {
    console.error('Error sending prescription notification email:', error);
  }
}

/**
 * Send billing invoice email
 */
async function sendBillingInvoice(billing, patient) {
  const mailOptions = {
    from: `Healthcare Billing <${process.env.SMTP_USER}>`,
    to: patient.email,
    subject: `Invoice ${billing.invoiceNumber}`,
    html: `
      <h2>Invoice</h2>
      <p>Dear ${patient.firstName} ${patient.lastName},</p>
      <p>Please find your invoice details below:</p>
      <ul>
        <li><strong>Invoice Number:</strong> ${billing.invoiceNumber}</li>
        <li><strong>Invoice Date:</strong> ${new Date(billing.invoiceDate).toLocaleDateString('en-AU')}</li>
        <li><strong>Due Date:</strong> ${new Date(billing.dueDate).toLocaleDateString('en-AU')}</li>
        <li><strong>Total Amount:</strong> $${billing.totalAmount.toFixed(2)}</li>
        <li><strong>Medicare Rebate:</strong> $${billing.medicareRebateTotal.toFixed(2)}</li>
        <li><strong>Amount Due:</strong> $${billing.patientPaymentAmount.toFixed(2)}</li>
      </ul>
      <h3>Services:</h3>
      <ul>
        ${billing.serviceItems.map(item => `
          <li>${item.description} - $${item.chargedAmount.toFixed(2)}</li>
        `).join('')}
      </ul>
      ${billing.bulkBilled ? '<p><strong>This consultation was bulk billed. No payment required.</strong></p>' : ''}
      <p>Please make payment by the due date to avoid any late fees.</p>
      <p>Thank you,<br>Healthcare Billing Department</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Billing invoice email sent successfully');
  } catch (error) {
    console.error('Error sending billing invoice email:', error);
  }
}

/**
 * Send payment receipt email
 */
async function sendPaymentReceipt(billing, payment, patient) {
  const mailOptions = {
    from: `Healthcare Billing <${process.env.SMTP_USER}>`,
    to: patient.email,
    subject: `Payment Receipt - ${billing.invoiceNumber}`,
    html: `
      <h2>Payment Receipt</h2>
      <p>Dear ${patient.firstName} ${patient.lastName},</p>
      <p>Thank you for your payment. Here are the details:</p>
      <ul>
        <li><strong>Invoice Number:</strong> ${billing.invoiceNumber}</li>
        <li><strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString('en-AU')}</li>
        <li><strong>Amount Paid:</strong> $${payment.amount.toFixed(2)}</li>
        <li><strong>Payment Method:</strong> ${payment.paymentMethod}</li>
        <li><strong>Receipt Number:</strong> ${payment.receiptNumber || 'N/A'}</li>
        <li><strong>Remaining Balance:</strong> $${billing.balance.toFixed(2)}</li>
      </ul>
      <p>Thank you for your payment!</p>
      <p>Best regards,<br>Healthcare Billing Department</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment receipt email sent successfully');
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
  }
}

/**
 * Send test results notification
 */
async function sendTestResultsNotification(patient, doctor, testType) {
  const mailOptions = {
    from: `Healthcare System <${process.env.SMTP_USER}>`,
    to: patient.email,
    subject: `Test Results Available`,
    html: `
      <h2>Test Results Available</h2>
      <p>Dear ${patient.firstName} ${patient.lastName},</p>
      <p>Your ${testType} results are now available.</p>
      <p>Please contact Dr. ${doctor.lastName} at your earliest convenience to discuss your results.</p>
      <p>Phone: ${doctor.phone}</p>
      <p>Best regards,<br>Healthcare System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Test results notification email sent successfully');
  } catch (error) {
    console.error('Error sending test results notification email:', error);
  }
}

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendPrescriptionNotification,
  sendBillingInvoice,
  sendPaymentReceipt,
  sendTestResultsNotification
};
