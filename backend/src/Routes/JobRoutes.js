const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
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

const viewApplicants = require("../controllers/JobApplicationController").getApplicationsForJob;

// Alumni job management routes
router.post("/post-job", authenticate, roleMiddleware('alumni'), validate({ body: postJobSchema }), postJob);
router.get("/get-my-jobs", authenticate, roleMiddleware('alumni'), getMyJobs);
router.get("/get-job-by-id/:id", authenticate, roleMiddleware('alumni'), getJobById);
router.put("/update-job/:id", authenticate, roleMiddleware('alumni'), validate({ body: updateJobSchema }), updateJob);
router.delete("/delete-job/:id", authenticate, roleMiddleware('alumni'), deleteJob);

// Student job browsing routes
router.get("/get-all-jobs-student", getAllJobsStudent);
router.get("/get-job-by-id-student/:id", getJobByIdStudent);

// Alumni view applicants for their jobs
router.get("/view-applicants/:jobId", authenticate, roleMiddleware('alumni'), viewApplicants);

module.exports = router;
