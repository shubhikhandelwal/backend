import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req,res) => {
    res.status(200).json({
        message : "ok"
    })
} )
// Currently, it just returns a JSON response with status 200 and message "ok" — a placeholder response.
export {registerUser}