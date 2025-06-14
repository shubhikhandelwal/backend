import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router