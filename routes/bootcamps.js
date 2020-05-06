const express = require("express");
const router = express.Router();

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");

// Include other resource routers
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

const advanceResults = require("../middleware/advanceResults");
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers anything that hits the url path will be forwarded to the callback router
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router
  .route("/")
  .get(advanceResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

// router.get('/', (req,res) => {
//     // res.send('Hello from the server');
//     res.status(200).json({success: true, msg: 'Show all bootcamps'});
// });

// router.get('/:id', (req,res) => {
//     // res.send('Hello from the server');
//     res.status(200).json({success: true, msg: `get bootcamp ${req.params.id}`});
// });

// router.post('/', (req,res) => {
//     // res.send('Hello from the server');
//     res.status(200).json({success: true, msg: 'Create new bootcamp'});
// });

// router.put('/:id', (req,res) => {
//     // res.send('Hello from the server');
//     res.status(200).json({success: true, msg: `Update bootcamp ${req.params.id}`});
// });

// router.delete('/:id', (req,res) => {
//     // res.send('Hello from the server');
//     res.status(200).json({success: true, msg: `Delete bootcamp ${req.params.id}`});
// });

module.exports = router;
