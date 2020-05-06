const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");

// @desc   Get all bootcamps
// @route  GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  //   let query;

  //   //Copy req.query
  //   const reqQuery = { ...req.query };
  //   // console.log(reqQuery)

  //   //Fields to exclude so that it wont match as a field
  //   const removeFields = ["select", "sort", "page", "limit"];

  //   //Loop over removeFields and delete them from reqQuery
  //   removeFields.forEach((param) => delete reqQuery[param]);

  //   // console.log(reqQuery)
  //   //Create query string
  //   let queryStr = JSON.stringify(reqQuery);

  //   //wordboundry g = global search Create operator($gt, $gte. etc)
  //   queryStr = queryStr.replace(
  //     /\b(gt|gte|lt|lte|in)\b/g,
  //     (match) => `$${match}`
  //   );
  //   //  console.log(queryStr)

  //   //Finding resource
  //   query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");

  //   //Select Fields must have space mongoose
  //   if (req.query.select) {
  //     // console.log(req.query.select)
  //     const fields = req.query.select.split(",").join(" ");
  //     // console.log(fields)
  //     query = query.select(fields);
  //   }

  //   // Sort
  //   if (req.query.sort) {
  //     const sortBy = req.query.sort.split(",").join(" ");
  //     query = query.sort(sortBy);
  //   } else {
  //     query = query.sort("-createdAt");
  //   }

  //   //Pagination & radix parameter is used to specify which numeral system to be used
  //   const page = parseInt(req.query.page, 10) || 1;
  //   const limit = parseInt(req.query.limit, 10) || 25;
  //   const startIndex = (page - 1) * limit;
  //   // console.log('page',page)
  //   const endIndex = page * limit;
  //   const total = await Bootcamp.countDocuments();
  //   // console.log('total',total)

  //   query = query.skip(startIndex).limit(limit);

  //   //Executing query
  //   const bootcamps = await query; //Bootcamp.find()

  //   //Pagination result
  //   const pagination = {};

  //   if (endIndex < total) {
  //     pagination.next = {
  //       page: page + 1,
  //       limit,
  //     };
  //   }

  //   if (startIndex > 0) {
  //     pagination.prev = {
  //       page: page - 1,
  //       limit,
  //     };
  //   }

  //   res.status(200).json({
  //     success: true,
  //     count: bootcamps.length,
  //     pagination,
  //     data: bootcamps,
  //   });
  res.status(200).json(res.advanceResults);
});

// @desc   Get single bootcamp
// @route  GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    //    return res.status(400).json({success: false});
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc   Create new bootcamp
// @route  POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // console.log(req.body)
  // res.status(200).json({success: true, msg: 'Create new bootcamp'});

  // add user to req.body
  req.body.user = req.user.id;

  // Check for pusblished bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // if the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc   Update single bootcamp
// @route  PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = Object.keys(Bootcamp.schema.paths);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });

  // res.status(200).json({success: true, msg: `Update bootcamp ${req.params.id}`});
});

// @desc   Delete single bootcamp
// @route  DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  //    try {
  //findByIdandDelete doesnt trigger the pre delete mongoose middleware
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin' ) {
    return next(
        new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401)
      );
  }

  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
  //    } catch (error) {
  //      next(error)
  //    }

  // res.status(200).json({success: true, msg: `Delete bootcamp ${req.params.id}`});
});

// @desc   Get bootcamp within a radius
// @route  GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/lang from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Calculate radius using radians
  //Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378.1 km

  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc   Upload photo for bootcamp
// @route  PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  //    try {
  //findByIdandDelete doesnt trigger the pre delete mongoose middleware
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

 // Make sure user is bootcamp owner
 if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin' ) {
    return next(
        new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401)
      );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  //   console.log(req.files)
  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // cHECK file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than 
        ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
