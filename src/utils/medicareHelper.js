/**
 * Medicare Helper Functions for Australian Healthcare System
 */

// MBS (Medicare Benefits Schedule) Item Numbers
const MBSItemNumbers = {
  // General Practitioner Consultations
  GP_CONSULTATION_LEVEL_A: { code: '23', description: 'Level A - Brief (< 6 minutes)', fee: 39.10, rebate: 39.10 },
  GP_CONSULTATION_LEVEL_B: { code: '36', description: 'Level B - Standard (6-20 minutes)', fee: 77.70, rebate: 77.70 },
  GP_CONSULTATION_LEVEL_C: { code: '44', description: 'Level C - Long (20-40 minutes)', fee: 116.50, rebate: 116.50 },
  GP_CONSULTATION_LEVEL_D: { code: '52', description: 'Level D - Prolonged (> 40 minutes)', fee: 155.55, rebate: 155.55 },

  // Telehealth
  TELEHEALTH_LEVEL_B: { code: '91890', description: 'Telehealth Level B', fee: 77.70, rebate: 77.70 },
  TELEHEALTH_LEVEL_C: { code: '91891', description: 'Telehealth Level C', fee: 116.50, rebate: 116.50 },

  // Specialist Consultations
  SPECIALIST_INITIAL: { code: '104', description: 'Specialist Initial Consultation', fee: 151.00, rebate: 113.25 },
  SPECIALIST_SUBSEQUENT: { code: '105', description: 'Specialist Subsequent Consultation', fee: 75.50, rebate: 56.65 },

  // Health Assessments
  HEALTH_ASSESSMENT_45_49: { code: '701', description: 'Health Assessment (45-49 years)', fee: 231.00, rebate: 231.00 },
  HEALTH_ASSESSMENT_OVER_75: { code: '701', description: 'Health Assessment (75+ years)', fee: 231.00, rebate: 231.00 },

  // Chronic Disease Management
  GP_MANAGEMENT_PLAN: { code: '721', description: 'GP Management Plan', fee: 142.85, rebate: 142.85 },
  TEAM_CARE_ARRANGEMENT: { code: '723', description: 'Team Care Arrangement', fee: 116.15, rebate: 116.15 },

  // Mental Health
  MENTAL_HEALTH_ASSESSMENT: { code: '2715', description: 'Mental Health Treatment Plan', fee: 116.50, rebate: 116.50 },
  MENTAL_HEALTH_REVIEW: { code: '2717', description: 'Mental Health Treatment Review', fee: 67.45, rebate: 67.45 }
};

/**
 * Validate Medicare number using check digit algorithm
 * @param {string} medicareNumber - 10 digit Medicare number
 * @returns {boolean} - True if valid
 */
function validateMedicareNumber(medicareNumber) {
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
}

/**
 * Calculate Medicare rebate for a consultation
 * @param {string} itemNumber - MBS item number
 * @param {number} chargedFee - Fee charged by provider
 * @param {boolean} isConcession - Is patient a concession card holder
 * @returns {object} - Rebate details
 */
function calculateMedicareRebate(itemNumber, chargedFee, isConcession = false) {
  const item = Object.values(MBSItemNumbers).find(i => i.code === itemNumber);

  if (!item) {
    return {
      success: false,
      message: 'Invalid MBS item number'
    };
  }

  const rebatePercentage = isConcession ? 100 : 85;
  let rebate = item.rebate * (rebatePercentage / 100);

  // Medicare rebate cannot exceed the charged fee
  if (rebate > chargedFee) {
    rebate = chargedFee;
  }

  const gap = chargedFee - rebate;

  return {
    success: true,
    itemNumber: item.code,
    description: item.description,
    scheduleFee: item.fee,
    chargedFee: chargedFee,
    rebate: rebate.toFixed(2),
    gap: gap.toFixed(2),
    outOfPocket: gap.toFixed(2)
  };
}

/**
 * Check if bulk billing applies
 * @param {number} patientIncome - Annual patient income
 * @param {boolean} isConcession - Is concession card holder
 * @param {number} patientAge - Patient age
 * @returns {boolean} - True if eligible for bulk billing
 */
function checkBulkBillingEligibility(patientIncome, isConcession, patientAge) {
  // Bulk billing typically applies to:
  // - Concession card holders
  // - Children under 16
  // - Commonwealth Seniors Health Card holders
  // - Patients with income below threshold

  if (isConcession) return true;
  if (patientAge < 16) return true;
  if (patientIncome < 55000) return true; // Approximate threshold

  return false;
}

/**
 * Calculate PBS (Pharmaceutical Benefits Scheme) copayment
 * @param {boolean} isConcession - Is concession card holder
 * @param {number} medicationCost - Cost of medication
 * @returns {object} - Copayment details
 */
function calculatePBSCopayment(isConcession, medicationCost) {
  const generalCopayment = 42.50; // 2024 general copayment
  const concessionCopayment = 6.90; // 2024 concession copayment
  const safetyNetThreshold = isConcession ? 277.20 : 1563.00; // 2024 thresholds

  const copayment = isConcession ? concessionCopayment : generalCopayment;
  const patientPays = Math.min(copayment, medicationCost);
  const governmentSubsidy = medicationCost - patientPays;

  return {
    medicationCost: medicationCost.toFixed(2),
    copayment: copayment.toFixed(2),
    patientPays: patientPays.toFixed(2),
    governmentSubsidy: governmentSubsidy.toFixed(2),
    safetyNetThreshold: safetyNetThreshold.toFixed(2)
  };
}

/**
 * Calculate Medicare Levy
 * @param {number} income - Taxable income
 * @param {boolean} hasPrivateHealthInsurance - Has private health insurance
 * @returns {object} - Levy details
 */
function calculateMedicareLevy(income, hasPrivateHealthInsurance = false) {
  const levyRate = 0.02; // 2% Medicare Levy
  const surchargeTiers = [
    { min: 90000, max: 105000, rate: 0.01 },
    { min: 105001, max: 140000, rate: 0.0125 },
    { min: 140001, max: Infinity, rate: 0.015 }
  ];

  let levy = income * levyRate;
  let surcharge = 0;

  // Medicare Levy Surcharge for high income earners without private health insurance
  if (!hasPrivateHealthInsurance) {
    const tier = surchargeTiers.find(t => income >= t.min && income <= t.max);
    if (tier) {
      surcharge = income * tier.rate;
    }
  }

  return {
    income: income.toFixed(2),
    medicareLevy: levy.toFixed(2),
    medicareLevySurcharge: surcharge.toFixed(2),
    totalLevy: (levy + surcharge).toFixed(2)
  };
}

/**
 * Format Medicare number for display
 * @param {string} medicareNumber - Medicare number
 * @param {string} irnNumber - IRN (Individual Reference Number)
 * @returns {string} - Formatted Medicare number
 */
function formatMedicareNumber(medicareNumber, irnNumber) {
  if (!medicareNumber) return '';

  // Format: 1234 56789 0
  const formatted = medicareNumber.match(/.{1,4}/g).join(' ');
  return irnNumber ? `${formatted}-${irnNumber}` : formatted;
}

/**
 * Get MBS item details
 * @param {string} itemCode - MBS item code
 * @returns {object} - Item details
 */
function getMBSItemDetails(itemCode) {
  return Object.values(MBSItemNumbers).find(item => item.code === itemCode) || null;
}

/**
 * Calculate gap cover payment
 * @param {number} totalFee - Total fee charged
 * @param {number} medicareRebate - Medicare rebate amount
 * @param {string} insuranceLevel - Health insurance level (bronze, silver, gold)
 * @returns {object} - Gap cover details
 */
function calculateGapCover(totalFee, medicareRebate, insuranceLevel = 'basic') {
  const gapCoverPercentages = {
    basic: 0,
    bronze: 25,
    silver: 50,
    gold: 100
  };

  const gap = totalFee - medicareRebate;
  const coveragePercentage = gapCoverPercentages[insuranceLevel] || 0;
  const insurancePays = (gap * coveragePercentage) / 100;
  const patientPays = gap - insurancePays;

  return {
    totalFee: totalFee.toFixed(2),
    medicareRebate: medicareRebate.toFixed(2),
    gap: gap.toFixed(2),
    insuranceLevel,
    insuranceContribution: insurancePays.toFixed(2),
    patientOutOfPocket: patientPays.toFixed(2)
  };
}

module.exports = {
  MBSItemNumbers,
  validateMedicareNumber,
  calculateMedicareRebate,
  checkBulkBillingEligibility,
  calculatePBSCopayment,
  calculateMedicareLevy,
  formatMedicareNumber,
  getMBSItemDetails,
  calculateGapCover
};
