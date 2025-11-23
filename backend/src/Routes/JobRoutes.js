const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const validate = require('../middleware/validationMiddleware');
const { postJobSchema, updateJobSchema } = require('../validation/jobSchemas');

// Import from separate controllers
const {
  postJob,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/JobPostingController");

const {
  getAllJobsStudent,
  getJobByIdStudent,
} = require("../controllers/JobBrowsingController");

const {
  viewApplicants,
} = require("../controllers/JobManagementController");

// Alumni job management routes
router.post("/post-job", authenticate, validate({ body: postJobSchema }), postJob);
router.get("/get-my-jobs", authenticate, getMyJobs);
router.get("/get-job-by-id/:id", authenticate, getJobById);
router.put("/update-job/:id", authenticate, validate({ body: updateJobSchema }), updateJob);
router.delete("/delete-job/:id", authenticate, deleteJob);

// Student job browsing routes
router.get("/get-all-jobs-student", getAllJobsStudent);
router.get("/get-job-by-id-student/:id", getJobByIdStudent);

// Alumni view applicants for their jobs
router.get("/view-applicants/:jobId", authenticate, viewApplicants);

module.exports = router;
