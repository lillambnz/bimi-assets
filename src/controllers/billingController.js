const Billing = require('../models/Billing');
const Patient = require('../models/Patient');

// @desc    Create billing invoice
// @route   POST /api/billing
// @access  Private/Doctor/Staff
exports.createBilling = async (req, res, next) => {
  try {
    // Calculate financial summary
    let subtotal = 0;
    let medicareRebateTotal = 0;

    req.body.serviceItems.forEach(item => {
      subtotal += item.chargedAmount * item.quantity;
      if (item.eligibleForMedicare) {
        medicareRebateTotal += item.medicareRebate * item.quantity;
      }
    });

    // Add additional charges
    if (req.body.additionalCharges) {
      req.body.additionalCharges.forEach(charge => {
        subtotal += charge.amount;
      });
    }

    // Apply discounts
    let discountTotal = 0;
    if (req.body.discounts) {
      req.body.discounts.forEach(discount => {
        if (discount.type === 'percentage') {
          discount.amount = (subtotal * discount.value) / 100;
        } else {
          discount.amount = discount.value;
        }
        discountTotal += discount.amount;
      });
    }

    const totalBeforeTax = subtotal - discountTotal;

    // Calculate GST (if applicable)
    const gst = req.body.taxInvoice ? totalBeforeTax * 0.1 : 0;

    req.body.subtotal = subtotal;
    req.body.gst = gst;
    req.body.totalAmount = totalBeforeTax + gst;
    req.body.medicareRebateTotal = medicareRebateTotal;
    req.body.patientPaymentAmount = req.body.totalAmount - medicareRebateTotal;
    req.body.balance = req.body.patientPaymentAmount;

    // Set due date (14 days from invoice date)
    if (!req.body.dueDate) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      req.body.dueDate = dueDate;
    }

    const billing = await Billing.create(req.body);

    const populatedBilling = await Billing.findById(billing._id)
      .populate('patient', 'firstName lastName medicareNumber')
      .populate('doctor', 'firstName lastName')
      .populate('hospital', 'name');

    res.status(201).json({
      success: true,
      data: populatedBilling
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all billings
// @route   GET /api/billing
// @access  Private
exports.getAllBillings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by user role
    if (req.userRole === 'patient') {
      query.patient = req.user.id;
    } else if (req.userRole === 'doctor') {
      query.doctor = req.user.id;
    }

    // Filter by patient
    if (req.query.patient) {
      query.patient = req.query.patient;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.invoiceDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Filter overdue invoices
    if (req.query.overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.paymentStatus = { $in: ['unpaid', 'partially-paid'] };
    }

    const total = await Billing.countDocuments(query);
    const billings = await Billing.find(query)
      .populate('patient', 'firstName lastName medicareNumber phone email')
      .populate('doctor', 'firstName lastName')
      .populate('hospital', 'name')
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: billings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: billings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single billing
// @route   GET /api/billing/:id
// @access  Private
exports.getBilling = async (req, res, next) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'firstName lastName specialty')
      .populate('hospital', 'name address phone')
      .populate('appointment');

    if (!billing) {
      return res.status(404).json({
        success: false,
        error: 'Billing record not found'
      });
    }

    // Check authorization
    if (req.userRole === 'patient' && billing.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this billing record'
      });
    }

    res.status(200).json({
      success: true,
      data: billing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add payment to billing
// @route   POST /api/billing/:id/payment
// @access  Private
exports.addPayment = async (req, res, next) => {
  try {
    const billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({
        success: false,
        error: 'Billing record not found'
      });
    }

    const paymentData = {
      ...req.body,
      processedBy: req.user.id,
      processedByModel: req.userRole === 'patient' ? 'Patient' : req.userRole === 'doctor' ? 'Doctor' : 'Staff'
    };

    await billing.addPayment(paymentData);

    // Add to audit log
    billing.auditLog.push({
      action: 'payment_added',
      performedBy: req.user.id,
      changes: `Payment of $${req.body.amount} added via ${req.body.paymentMethod}`,
      ipAddress: req.ip
    });

    await billing.save();

    res.status(200).json({
      success: true,
      data: billing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Submit Medicare claim
// @route   POST /api/billing/:id/medicare-claim
// @access  Private/Staff
exports.submitMedicareClaim = async (req, res, next) => {
  try {
    const billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({
        success: false,
        error: 'Billing record not found'
      });
    }

    if (billing.bulkBilled) {
      return res.status(400).json({
        success: false,
        error: 'This invoice is bulk billed'
      });
    }

    // Update Medicare claim status for service items
    billing.serviceItems.forEach(item => {
      if (item.eligibleForMedicare) {
        item.medicareClaimStatus = 'submitted';
        item.medicareClaimDate = Date.now();
      }
    });

    billing.auditLog.push({
      action: 'medicare_claim_submitted',
      performedBy: req.user.id,
      ipAddress: req.ip
    });

    await billing.save();

    res.status(200).json({
      success: true,
      message: 'Medicare claim submitted successfully',
      data: billing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create payment plan
// @route   POST /api/billing/:id/payment-plan
// @access  Private/Staff
exports.createPaymentPlan = async (req, res, next) => {
  try {
    const billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({
        success: false,
        error: 'Billing record not found'
      });
    }

    const { numberOfInstallments, frequency } = req.body;
    const installmentAmount = Math.ceil(billing.balance / numberOfInstallments);

    billing.paymentPlan = {
      active: true,
      startDate: Date.now(),
      numberOfInstallments,
      installmentAmount,
      frequency,
      nextPaymentDate: new Date() // Calculate based on frequency
    };

    billing.auditLog.push({
      action: 'payment_plan_created',
      performedBy: req.user.id,
      changes: `Payment plan created: ${numberOfInstallments} installments of $${installmentAmount}`,
      ipAddress: req.ip
    });

    await billing.save();

    res.status(200).json({
      success: true,
      data: billing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Write off balance
// @route   POST /api/billing/:id/writeoff
// @access  Private/Admin
exports.writeOffBalance = async (req, res, next) => {
  try {
    const billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({
        success: false,
        error: 'Billing record not found'
      });
    }

    billing.writtenOff = true;
    billing.writeOffReason = req.body.reason;
    billing.writeOffDate = Date.now();
    billing.writeOffAmount = billing.balance;
    billing.authorizedBy = req.user.id;
    billing.paymentStatus = 'written-off';
    billing.balance = 0;

    billing.auditLog.push({
      action: 'balance_written_off',
      performedBy: req.user.id,
      changes: `Balance of $${billing.writeOffAmount} written off. Reason: ${req.body.reason}`,
      ipAddress: req.ip
    });

    await billing.save();

    res.status(200).json({
      success: true,
      data: billing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get patient billing history
// @route   GET /api/billing/patient/:patientId/history
// @access  Private
exports.getPatientBillingHistory = async (req, res, next) => {
  try {
    const billings = await Billing.find({ patient: req.params.patientId })
      .populate('doctor', 'firstName lastName')
      .populate('hospital', 'name')
      .sort({ invoiceDate: -1 });

    const summary = {
      totalInvoiced: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      overdueAmount: 0
    };

    billings.forEach(billing => {
      summary.totalInvoiced += billing.totalAmount;
      summary.totalPaid += billing.amountPaid;
      summary.totalOutstanding += billing.balance;
      if (billing.isOverdue) {
        summary.overdueAmount += billing.balance;
      }
    });

    res.status(200).json({
      success: true,
      count: billings.length,
      summary,
      data: billings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get billing statistics
// @route   GET /api/billing/statistics
// @access  Private/Admin
exports.getBillingStatistics = async (req, res, next) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const stats = await Billing.aggregate([
      {
        $facet: {
          statusBreakdown: [
            { $group: { _id: '$paymentStatus', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
          ],
          monthlyRevenue: [
            { $match: { invoiceDate: { $gte: thisMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, collected: { $sum: '$amountPaid' } } }
          ],
          overdueInvoices: [
            { $match: { paymentStatus: { $in: ['unpaid', 'partially-paid'] }, dueDate: { $lt: today } } },
            { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$balance' } } }
          ],
          medicareRebates: [
            { $group: { _id: null, total: { $sum: '$medicareRebateTotal' } } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
