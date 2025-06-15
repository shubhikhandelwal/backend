import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import fs from 'fs';


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId) //Fetches the user document from the database using the provided userId.
        const accessToken = user.generateAccessToken() //ye function banaye hue h
        const refreshToken = user.generateRefreshToken()

        user.refreshToken =  refreshToken //db mai save {user ka access hame mil hi gya h jo ki ek object ki form mai h to usme vse hi add krdiya}
        await user.save({validateBeforeSave : false}) //mongo ke function save krna hai just kou validation nhi krna

        return {accessToken , refreshToken} //kaam hone ke baad return krdo

    } catch (error) {
        throw new apiError(500 , "Something went wrong while generating refresh and access token")
    }
}

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
    // const CoverImageLocalPath = req.files?.coverImage[0]?.path

    let CoverImageLocalPath; // Declares a variable to hold the local file path of the uploaded coverImage.It’s initially undefined.
    if(req.files //check if req.files exists
        && Array.isArray(req.files.coverImage) //check if coverImage is an array (Multer uses arrays for .fields())
         && req.files.coverImage.length > 0){ //check if there’s at least one file uploaded
        CoverImageLocalPath = req.files.coverImage[0].path
    } //this functionality was added because when user uploads it without coverImage it throws error that is undefined but with this coudinary will return an empty string instead

    // console.log(avatarLocalPath , CoverImageLocalPath)

    if(!avatarLocalPath) {
        throw new apiError(400 , "Avatar image is required")
    }

     //req.files is an object provided by multer.fields().Since avatar and coverImage each accept one image (as per multer config), we access their paths using req.files.avatar[0].path.
      const avatar = await uploadOnCloudinary(avatarLocalPath);
      const coverImage = await uploadOnCloudinary(CoverImageLocalPath);

    if(!avatarLocalPath) {
        throw new apiError(400 , "Avatar image is required")
    }

    const user =  await User.create({ //method of mongoDB
        fullName,
        avatar : avatar.url, //avatar se url hi store krwana h
        coverImage : coverImage?.url || "", //hai ya nhi
        email,
        password,
        username 
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


//get user details from frontend
//validation - not empty
//check if already exist - email or username
//check for images check for avatar
//upload to cloudinary , avatar check
// create user object - create entry in db
//remove password and refresh token field from response
//check for user creation
//return response


const loginUser = asyncHandler(async (req,res) => {
    //req.body se data
    //username or email 
    //find the user
    //password check
    //access and refresh token generate
    //send cookie 
    //response

    const {email , username , password} = req.body
    
    if (!(username || email)) {
        throw new apiError(400, " username or email is required")
    }

   const user = await User.findOne({
    $or: [{ email }, { username }]
});


    if(!user){
        throw new apiError(404 , "user does not exist") 
    }

    const isPasswordValid = await user.isPasswordCorrect(password) //User moongoose ke methods access krta h prr jo methods apnne bnaye h vo apne user
        //ke paas availiable hai to vo user se access hoga

    if(!isPasswordValid){
        throw new apiError(401 , "invalid password")
    }

   const {refreshToken , accessToken} = await generateAccessAndRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
   ) //select krlo user ko kya kya bhejna h

   const options = { //cookie options
    httpOnly : true, // The cookie cannot be accessed via JavaScrip
    secure:true 
   }

   return res
   .status(200)
   .cookie("accessToken" , accessToken , options) //Sets the accessToken in a secure, HTTP-only cookie. //cookie tab hi use kr paaye kyuki cookieParser as a middleware used h
   .cookie("refreshToken" ,refreshToken , options) //ye dono as cookies jarhe hai
   .json(
    new apiResponse(
        200,
        {
            user : loggedInUser , 
            accessToken , refreshToken //not recommended
        },
        "User Logged in sucessfully"
    )
   )

})

const logOutUser = asyncHandler(async(req , res) => {
    //remove cookies and refresh tokens
    await User.findByIdAndUpdate(req.user._id , { //req.user ka abb hamare paas access hai because hamne auth middleware mai set krdiya
        $set : { //kya update krna h
            refreshToken  : undefined
        }
    },{
        new : true //abb ye response updated value dega
    })  
    const options = { 
    httpOnly : true, 
    secure:true 
   }

   return res
   .status(200)
   .clearCookie("accessToken" , options)
   .clearCookie("refreshToken" , options)
   .json(new apiResponse(200 , "user logged out"))
})

const refreshAccessToken = asyncHandler(async ( req, res ) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
    throw new apiError(401 , "unauthorised request")
   }

  try {
     const decodedToken = jwt.verify(  //ye basically aapko decode krke deta hai token ko jo ki encrypted aata hai from the user
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
     )
  
     const user = await User.findById(decodedToken?._id)
  
        if(!user){
      throw new apiError(401 , "invalid token")
     }
  
     if(incomingRefreshToken !== user?.refreshToken){
      throw new apiError(401 , "refresh token is expired or used")
     }
  
     const options = {
      httpOnly : true,
      secure : true
     }
  
     const {newRefreshToken , accessToken} = await generateAccessAndRefreshToken(user._id)
  
     res.status(200)
     .cookie("accessToken" , accessToken , options)
     .cookie("refreshToken" , newRefreshTokenefreshToken , options)
     .json(
      new apiResponse(
          200,
          {accessToken , refreshToken : newRefreshToken},
          "access token refreshed"
      )
     )
  } catch (error) {
    throw new apiError(401 , error?.message || "invalid refresh token")
  }
}) //jab access token expire hojayega to frontend mai user ko ek particular end point hit kra dege aur ye refresh hojayega


const changeCurrentPassword = asyncHandler(async ( req , res) => {
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user._id)  //route mai jwt verify lgayege t vo tabhi access kr parha hai hence req.user to h
    const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new apiError(400 , "wrong password")
    }

    user.password = newPassword 
    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json(new apiResponse (200 , {} , "password change successfully"))
})

const getCurrentUser = asyncHandler(async (req , res) => {
    return res.status(200)
    .json(200 , req.user , "current user fetched") 
})

const updateAccountDetails = asyncHandler(async (req , res) => {
    const {fullName , email} = req.body

    if(!fullName || !email){
        throw new apiError(400 , "all fields are required")
    }

   const user = await User.findByIdAndUpdate(req.user._id , 
        {$set :{
            fullName,
            email
        }},
        {new : trur}
    ).select("-password")

    return res.status(200)
    .json(
        new apiResponse(200 , user , "account updated successfully")
    )
})

const updateAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        new apiError(  400 , "avatar file is missing" )
    }

    const avatar  = await uploadOnCloudinary(avatarLocalPath)

     if(!avatar) {
        new apiError(  400 , "error while uploading on avatar")
    }
    
   const user = await User.findByIdAndUpdate(req.user._id , 
        {$set :{
            avatar: avatar.url //imp
        }},
        {new : trur}
    ).select("-password")

    //delete old avatar


    return res.status(200)
    .json(
        new apiResponse(200 , user , "avatar updated successfully")
    )

})

const updateCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath) {
        new apiError(  400 , "cover image  file is missing" )
    }

    const coverImage  = await uploadOnCloudinary(coverImageLocalPath)

     if(!coverImage) {
        new apiError(  400 , "error while uploading on cover image")
    }

    
   const user = await User.findByIdAndUpdate(req.user._id , 
        {$set :{
            coverImage: coverImage.url //imp
        }},
        {new : trur}
    ).select("-password")

    return res.status(200)
    .json(
        new apiResponse(200 , user , "cover image updated successfully")
    )

})

export {
    registerUser
    ,loginUser
    ,logOutUser
    ,refreshAccessToken
    ,changeCurrentPassword
    ,getCurrentUser
    ,updateAccountDetails
    ,updateAvatar
    ,updateCoverImage
}