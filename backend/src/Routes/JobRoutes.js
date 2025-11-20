const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const validate = require('../middleware/validationMiddleware');
const { postJobSchema, updateJobSchema } = require('../validation/jobSchemas');
// const { authorize } = require("../middleware/roleMiddleware");
const {
  postJob,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAllJobsStudent,
  getJobByIdStudent,
  applyJob,
  getAppliedJobs,
  withdrawApplication,
  viewApplicants,
} = require("../controllers/JobController");

// Alumni can post jobs
// router.post("/", protect, authorize("alumni"), postJob);

router.post("/post-job", authenticate, validate({ body: postJobSchema }), postJob);
router.get("/get-my-jobs", authenticate, getMyJobs);
router.get("/get-job-by-id/:id", authenticate, getJobById);
router.put("/update-job/:id", authenticate, validate({ body: updateJobSchema }), updateJob);
router.delete("/delete-job/:id", authenticate, deleteJob);


router.get("/get-all-jobs-student",getAllJobsStudent);
router.get("/get-job-by-id-student/:id",getJobByIdStudent);
router.post("/apply-job",authenticate,applyJob);
router.get("/get-applied-jobs",authenticate,getAppliedJobs);


router.delete("/withdraw-application/:job_id", authenticate, withdrawApplication);
router.get("/view-applicants/:jobId", authenticate, viewApplicants);


// Anyone can view jobs
// router.get("/", protect, getJobs);
// router.get("/:id", protect, getJobById);
// // Admin can delete jobs
// router.delete("/:id", protect, authorize("admin"), deleteJob);

module.exports = router;
