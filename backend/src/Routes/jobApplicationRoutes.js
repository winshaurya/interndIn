

// src/Routes/jobApplicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/JobApplicationController');
const { authenticate } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Student apply for a job
router.post('/apply-job',
  authenticate,
  roleMiddleware('student'),
  applicationController.applyForJob
);

// Student get their applied jobs
router.get('/get-applied-jobs',
  authenticate,
  roleMiddleware('student'),
  applicationController.getMyApplications
);

// Student withdraw their job application
router.delete('/withdraw-application/:job_id',
  authenticate,
  roleMiddleware('student'),
  applicationController.withdrawApplication
);

// Alumni view applicants of their job
router.get('/view-applicants/:jobId',
  authenticate,
  roleMiddleware('alumni', 'admin'),
  applicationController.getApplicationsForJob
);

module.exports = router;
