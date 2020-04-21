
const ErrorResponse = require('../utils/errorResponse')
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');


// @desc   Get all bootcamps
// @route  GET /api/v1/bootcamps
// @access Public 
exports.getBootcamps = asyncHandler(async(req,res,next) => {
   
    let query;

    //Copy req.query
    const reqQuery = { ...req.query };
    // console.log(reqQuery)

    //Fields to exclude so that it wont match as a field
    const removeFields = ['select','sort','page','limit'];

    //Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // console.log(reqQuery)
    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    //wordboundry g = global search Create operator($gt, $gte. etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    //  console.log(queryStr)

     //Finding resource
    query = Bootcamp.find(JSON.parse(queryStr));
  

    //Select Fields must have space mongoose
    if(req.query.select) {
        // console.log(req.query.select)
        const fields = req.query.select.split(',').join(' ');
        // console.log(fields)
        query = query.select(fields);
    }

    // Sort 
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination & radix parameter is used to specify which numeral system to be used
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit,10) || 25;
    const startIndex = (page-1) * limit;
    // console.log('page',page)
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();
    // console.log('total',total)



    query = query.skip(startIndex).limit(limit);

    //Executing query
    const bootcamps = await query;     //Bootcamp.find()

    //Pagination result
    const pagination = {}

    if (endIndex < total ) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit 
        }
    }

       res
        .status(200)
        .json({success: true, count: bootcamps.length, pagination , data: bootcamps});
   
   
}); 

// @desc   Get single bootcamp
// @route  GET /api/v1/bootcamps/:id
// @access Public 
exports.getBootcamp = asyncHandler(async(req,res,next) => {
    
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp) {
        //    return res.status(400).json({success: false});
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
        }

        res.status(200).json({success: true, data: bootcamp});
   
});

// @desc   Create new bootcamp
// @route  POST /api/v1/bootcamps
// @access Private 
exports.createBootcamp = asyncHandler(async(req,res,next) => {
    // console.log(req.body)
    // res.status(200).json({success: true, msg: 'Create new bootcamp'});
   
        const bootcamp = await Bootcamp.create(req.body)

        res.status(201).json({
            success: true, 
            data: bootcamp
        });
   
});

// @desc   Update single bootcamp
// @route  PUT /api/v1/bootcamps/:id
// @access Private 
exports.updateBootcamp = asyncHandler(async(req,res,next) => {
    
        const updates = Object.keys(req.body)
        const allowedUpdates = Object.keys(Bootcamp.schema.paths)
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
       
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
         }
         res.status(200).json({success: true, data: bootcamp});

   

    // res.status(200).json({success: true, msg: `Update bootcamp ${req.params.id}`});
})

// @desc   Delete single bootcamp
// @route  DELETE /api/v1/bootcamps/:id
// @access Private 
exports.deleteBootcamp = asyncHandler(async (req,res,next) => {
//    try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
     }
     res.status(200).json({success: true, data: {}});
//    } catch (error) {
//      next(error)
//    }
   
    // res.status(200).json({success: true, msg: `Delete bootcamp ${req.params.id}`});
});


// @desc   Get bootcamp within a radius
// @route  GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private 
exports.getBootcampsInRadius = asyncHandler(async (req,res,next) => {
        const { zipcode, distance } = req.params;

        //Get lat/lang from geocoder
        const  loc = await geocoder.geocode(zipcode);
        const lat = loc[0].latitude;
        const lng = loc[0].longitude;


        //Calculate radius using radians
        //Divide dist by radius of Earth
        // Earth Radius = 3,963 mi / 6,378.1 km

        const radius = distance / 3963;

        const bootcamps = await Bootcamp.find({
            location: {$geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }}
        });

        res.status(200).json({
            success: true,
            count: bootcamps.length,
            data: bootcamps
        })

    });