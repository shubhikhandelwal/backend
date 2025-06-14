class apiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message) // Call the parent (Error) constructor with the message
        this.statusCode = statusCode // HTTP status code (e.g., 404, 500)
        this.data = null  // Placeholder (e.g., for partial data or debug info)
        this.message = message 
        this.success = false,
        this.errors = errors  // Additional errors (e.g., validation issues)
    }
}

export {apiError}


// apiError is a custom error class that extends the built-in Error class in JavaScript.
// It allows you to:
// Set a custom status code.
// Provide an optional array of validation or detailed errors.
// Automatically capture stack traces.
// Send a standardized JSON error response from anywhere in your app.
// use => new apiError(404, "User not found"));
