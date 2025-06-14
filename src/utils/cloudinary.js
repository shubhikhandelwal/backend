//file alreasy local storage pe ya server pe aa chuki h

import { v2 as cloudinary} from "cloudinary";
import fs from "fs"; //node ka file system file pe opreations ke liye

cloudinary.config({  //configuration based on docu
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_SECRET_KEY 
    });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader(localFilePath , { //url and other options
            resource_type : "auto"
        })
        //uploaded
        console.log("uploaded" , response.url); //yhi to db mai save hoga
        return response
    } catch (error) { //upload to hai vo locally
        fs.unlinkSync(localFilePath) //remove the locally saved temp file taaki koi curropt file upload na ho
        return null;
    }
}

export {uploadOnCloudinary};

