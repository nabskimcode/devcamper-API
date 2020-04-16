
const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');


// @desc   Get all bootcamps
// @route  GET /api/v1/bootcamps
// @access Public 
exports.getBootcamps = asyncHandler(async(req,res,next) => {
   
       const bootcamps = await Bootcamp.find()

       res
        .status(200)
        .json({success: true, count: bootcamps.length, data: bootcamps});
   
   
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