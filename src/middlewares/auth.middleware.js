//only verifies user hai ki nhi hai

import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req , res , next) => { //This function will be used as a middleware in routes to check authentication.
    try {
        const token = req.cookies?.accessToken || req.header
        ("Authorization")?.replace("Bearer " , "")  //First tries to get the token from cookies (for browser-based auth).
           //If not found, tries to get it from the Authorization header (common for APIs and mobile clients).
           //Bearer <token> is the standard format for sending tokens in headers, so we remove "Bearer " prefix.

        if(!token){
            throw new apiError(401 , "unauthorised request")
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET) //Uses the secret key (ACCESS_TOKEN_SECRET) to decode and verify the JWT.
                    //This returns the payload, which should contain at least _id of the user
    
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        ) //Finds the user using the decoded _id. Selects all fields except password and refreshToken.
    
        if(!user){
            throw new apiError(401 , "Invalid access token")
        }
    
        req.user = user;  //req ki object mai user add krdiyaa
        next()
    } catch (error) {
        throw new apiError(401 , error?.message || "invalid access token")
    }

})