//file alreasy local storage pe ya server pe aa chuki h

import { v2 as cloudinary} from "cloudinary";
import fs from "fs"; //node ka file system file pe opreations ke liye




// cloudinary.config({  //configuration based on docu
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//         api_key: process.env.CLOUDINARY_API_KEY, 
//         api_secret: process.env.CLOUDINARY_SECRET_KEY 
//     });

    cloudinary.config({  //configuration based on docu
        cloud_name: "dfvinzpcq", 
        api_key: 817566721319897,  
        api_secret: "Lav6gYNbLuF3yNJxqq2QfSHehmM"
    });  //above one is a good practice but error aaaaaarhe the to we have done this

//     console.log("⛅ ENV DEBUG:");
// console.log("CLOUDINARY_CLOUD_NAME =>", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY    =>", process.env.CLOUDINARY_API_KEY);
// console.log("CLOUDINARY_SECRET_KEY =>", process.env.CLOUDINARY_SECRET_KEY);

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath , { //url and other options
            resource_type : "auto"
        })
        //uploaded
        console.log("uploaded" , response.url); //yhi to db mai save hoga
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) { //upload to hai vo locally
    console.error("Cloudinary upload error:", error);
    fs.unlinkSync(localFilePath);
    return 
        // fs.unlinkSync(localFilePath) //remove the locally saved temp file taaki koi curropt file upload na ho
        // return null;
    }
}

export {uploadOnCloudinary};

