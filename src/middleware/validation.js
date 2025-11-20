const { validationResult } = require('express-validator');

// Middleware to check validation results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }

  next();
};

// Validate Australian Medicare number
exports.validateMedicareNumber = (medicareNumber) => {
  if (!/^\d{10}$/.test(medicareNumber)) {
    return false;
  }

  const weights = [1, 3, 7, 9, 1, 3, 7, 9];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    sum += parseInt(medicareNumber[i]) * weights[i];
  }

  const checkDigit = sum % 10;
  return checkDigit === parseInt(medicareNumber[8]);
};

// Validate Australian phone number
exports.validateAustralianPhone = (phone) => {
  return /^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/.test(phone);
};

// Validate Australian mobile number
exports.validateAustralianMobile = (mobile) => {
  return /^(\+?61|0)4(?:[ -]?[0-9]){8}$/.test(mobile);
};

// Validate Australian postcode
exports.validatePostcode = (postcode) => {
  return /^\d{4}$/.test(postcode);
};

// Validate ABN (Australian Business Number)
exports.validateABN = (abn) => {
  if (!/^\d{11}$/.test(abn)) {
    return false;
  }

  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;

  // Subtract 1 from first digit
  const digits = abn.split('').map(Number);
  digits[0] -= 1;

  for (let i = 0; i < 11; i++) {
    sum += digits[i] * weights[i];
  }

  return sum % 89 === 0;
};

// Validate AHPRA number
exports.validateAHPRA = (ahpraNumber) => {
  return /^[A-Z]{3}\d{10}$/.test(ahpraNumber);
};

// Validate date is not in future
exports.isDateNotFuture = (date) => {
  return new Date(date) <= new Date();
};

// Validate date is not in past
exports.isDateNotPast = (date) => {
  return new Date(date) >= new Date();
};

// Validate date range
exports.isValidDateRange = (startDate, endDate) => {
  return new Date(startDate) < new Date(endDate);
};

// Validate age is at least minimum
exports.isMinimumAge = (dateOfBirth, minimumAge) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= minimumAge;
};

// Sanitize input
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remove HTML tags
  input = input.replace(/<[^>]*>/g, '');

  // Remove script tags and their content
  input = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Trim whitespace
  input = input.trim();

  return input;
};

// Validate prescription dosage format
exports.validateDosageFormat = (dosage) => {
  // Examples: "500mg", "10ml", "2 tablets"
  return /^\d+(\.\d+)?\s*(mg|ml|g|mcg|units?|tablets?|capsules?|drops?)$/i.test(dosage);
};

// Validate time format (HH:MM)
exports.validateTimeFormat = (time) => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

// Check if email domain is valid
exports.isValidEmailDomain = (email) => {
  const domain = email.split('@')[1];
  // Add logic to check against allowed domains or DNS lookup
  return domain && domain.includes('.');
};
