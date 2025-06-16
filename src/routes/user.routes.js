import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logOutUser, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/register").post(
    upload.fields([ //middleware 
        //for two different fields we wat to upload
        {
            name : "avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser) //Sets up a route for the path /register.
//This method (route(path)) allows chaining multiple HTTP methods (like .get(), .post(), .put(), etc.) on the same path.
// when any browser sends post request on /register then registerUser chalega 
// A POST request is one of the main HTTP methods used by web browsers or apps to send data to a server — typically when you're submitting a form, uploading a file, or creating new data (like registering a user).

router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(
    verifyJWT  //isliye next likhte hai 
    ,logOutUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route ( "/change-password" ).post(
    verifyJWT,
    changeCurrentPassword
)

router.route ( "/current-user" ).get(
    verifyJWT,
    getCurrentUser
)

router.route ( "/update-acc-details" ).patch(
    verifyJWT,
    updateAccountDetails
)

router.route ( "/update-avatar" ).patch(
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
)

router.route ( "/update-cover-image" ).patch(
    verifyJWT,
    upload.single("coverImage"), //multer middleware to upload a single image named coverImage
    updateCoverImage 
)

router.route ( "/c/:username" ).get( // : ke baad jo username aayega vhi username req.params mai se extract hoga 
    verifyJWT,
    getUserChannelProfile
)

router.route ( "/history" ).get(
    verifyJWT,
    getWatchHistory
)
export default router