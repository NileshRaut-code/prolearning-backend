import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { PhysicalAnswerCopy } from "../models/physicalAnswerCopyModel.js";
import { PhysicalTest } from "../models/physicalTestModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary,uploadImageToCloudinary,uploadPdfToCloudinary } from "../utils/cloudinary.js";
const uploadsingle=asyncHandler(async(req,res)=>{
    const imagebuffer = req?.files[0]?.buffer;
   // req.body.author = req.user._id;
    // console.log(req.body);
    // console.log(req.body.author);
   // console.log(req.body.image);
    // console.log(req.user);
    if (imagebuffer) {
      const imageurl = await uploadImageToCloudinary(imagebuffer);
      if (!imageurl) {
        throw new ApiError(404, "Image is not Uploaded Properly");
      }
      req.body.image = imageurl.url;
    }
    return res
    .status(201)
    .json(new ApiResponse(201, req.body.image, "Answer copy submitted successfully"));
})
export { uploadsingle };
