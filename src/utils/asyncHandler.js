//2nd syntax

const asyncHandler = (requestHandler) => {
    return  (req, res , next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}

// This is a higher-order function that wraps your async route handlers and automatically catches errors, passing them to Express's error handling middleware via next(err).
// Forwards them to Express's global error-handling middleware via next(err).
// Wrapping it in Promise.resolve(...) ensures that even if it’s not async, it still becomes a Promise — making this approach universal
// he .catch(...) block catches that error.
// next(err) passes it to Express’s built-in error-handling middleware.


export {asyncHandler};

//1st syntax
// const asyncHandler = (fn) => async (req , res , next) => {
//     try {
//         await fn(req ,res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success : false,
//             message : error.message
//         })
//     }
// } //ek function liya use further ek aur function mai pass krdiya


// This is a higher-order function — a function that takes another function (fn) as a parameter and returns a new function that wraps it with error handling.
// an Express.js utility often called asyncHandler, used to handle async errors in route handlers without writing repetitive try-catch
// // In Express, without this helper, every async route needs a try-catch:
// app.get('/users', asyncHandler(async (req, res) => { with asynchandler
//   const users = await User.find();
//   res.json(users);
// }));
// Then, instead of crashing the app, we respond with a JSON error:
// Status code: error.code || 500
// Message: error.message
// Success: false