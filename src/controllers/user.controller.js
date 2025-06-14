import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async (req,res) => {
    const {fullName , email, username, password} = req.body  //Destructures values from form data  most of the times data yhi se aajata h
    console.log("email" , email)

    // if(fullName === ""){
    //     throw new apiError(400,"fullname is required")
    // } //aese krte krte bht hojayegi conditions

    if([fullName , email, username, password].some((field) => field?.trim() === "")) { //another syntax of js
        throw new apiError(400 , "All fields are required")
    } //Checks if any of the fields is empty or just spaces.trim() removes spaces, and .some() checks if any are invalid

    const existedUser = await User.findOne({ //user is the one interacting with db and findOne is method of mongoDB
        $or : [{email} , {username}] //in dono mai se kuch bhi same
    })
    if(existedUser){
        throw new apiError(409 , "User with email or username already exist")
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path
    const CoverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new apiError(400 , "Avatar image is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath) //req.files is an object provided by multer.fields().Since avatar and coverImage each accept one image (as per multer config), we access their paths using req.files.avatar[0].path.
    const coverImage = await uploadOnCloudinary(CoverImageLocalPath)

    if(!avatarLocalPath) {
        throw new apiError(400 , "Avatar image is required")
    }

    const user =  await User.create({ //method of mongoDB
        fullName,
        avatar : avatar.url, //avatar se url hi store krwana h
        coverImage : coverImage?.url || "", //hai ya nhi
        email,
        password,
        username : username.toLowerCase() 
    })

    const createdUser = await User.findById(user._id).select( //access kiya same user with the help of if
        "-password -refreshToken"
    ) //In Mongoose, .select("-password") tells it to exclude the field.
    
    if(!createdUser) {
        throw new apiError(500 , "registering problem")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser , "User registered successfully")
    )


    
} )
// Currently, it just returns a JSON response with status 200 and message "ok" — a placeholder response.
export {registerUser}

//get user details from frontend
//validation - not empty
//check if already exist - email or username
//check for images check for avatar
//upload to cloudinary , avatar check
// create user object - create entry in db
//remove password and refresh token field from response
//check for user creation
//return response