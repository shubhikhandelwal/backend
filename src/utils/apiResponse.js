class apiResponse {
    constructor(StatusCode, data, message = "Success"){
        this.StatusCode = StatusCode
        this.data = data
        this.message = message
        this.success = StatusCode < 400 //true if the status code is < 400 (successful response).false otherwise (you can handle errors using your apiError class).
    }
}

// This class is designed to standardize all successful responses from your API.
// Instead of sending plain res.json(...), you can send structured responses like: