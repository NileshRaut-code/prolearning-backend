import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const uploadOnCloudinary = async (localFilePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const uploadImageToCloudinary = async (fileBuffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log(  process.env.CLOUDINARY_CLOUD_NAME,process.env.CLOUDINARY_API_KEY)
  let productImage;
  await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) {
          console.error("Error uploading image to Cloudinary:", error);
          reject(error);
        } else {
          console.log("Image uploaded to Cloudinary:", result);
          productImage = result;
          resolve();
        }
      })
      .end(fileBuffer);
  });
  return productImage;
};

const uploadPdfToCloudinary = async (fileBuffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
    let pdf;
    await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "auto" }, (error, result) => {
          if (error) {
            console.error("Error uploading image to Cloudinary:", error);
            reject(error);
          } else {
            console.log("Image uploaded to Cloudinary:", result);
            pdf = result;
            resolve();
          }
        })
        .end(fileBuffer);
    });
    return pdf;
  };

export { uploadOnCloudinary, uploadImageToCloudinary ,uploadPdfToCloudinary};