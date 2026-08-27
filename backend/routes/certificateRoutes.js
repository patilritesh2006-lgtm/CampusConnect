const express = require('express');
const router = express.Router();

const {
  issueCertificate,
  bulkIssueCertificates,
  getMyCertificates,
  verifyCertificate,
  getAllCertificates,
} = require('../controllers/certificateController');

const {
  authenticateToken,
  requireRole,
} = require('../middleware/authMiddleware');

// Public Certificate Verification (No login required)
router.get('/verify/:code', verifyCertificate);

// Student Certificates
router.get(
  '/my-certificates',
  authenticateToken,
  requireRole('STUDENT'),
  getMyCertificates
);

// Admin / Faculty / Coordinator - Issue single certificate
router.post(
  '/issue',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'EVENT_COORDINATOR'),
  issueCertificate
);

// Admin / Faculty / Coordinator - Bulk issue certificates
router.post(
  '/bulk-issue',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'EVENT_COORDINATOR'),
  bulkIssueCertificates
);

// Admin - View all certificates
router.get(
  '/all',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  getAllCertificates
);

module.exports = router;
