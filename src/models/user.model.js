import mongoose, {Schema} from "mongoose";
import { JsonWebTokenError } from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    usermame : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true //searching easy banadeta hai
    },
     email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
    },
     fullName : {
        type : String,
        required : true,
        lowercase : true,
        trim : true,
    },
     avatar : {
        type : String, //cloudinary url
        required : true,
    },
     coverImage : {
        type : String,
    },
    watchHistory :[
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    password : {
        type : String, //futher discussion
        required : [true, 'Password is required']
    },
    refreshToken : {

    }
} , {timestamps : true})

userSchema.pre("save" , async function (next) { //middleware h to next to hoga hi jab kaam hojaye to next m pass krdo
    if(!this.isModified("password")) return next(); //agar password hi modify nhi hua to run hi nhi krna ye method
    this.password = await bcrypt.hash(this.password, 10) //encrypt password 
    next()
}) //a hook to do some work just before saving the data

userSchema.methods.isPasswordCorrect = async function(password) {
   return await bcrypt.compare(password, this.password) //compares the password given by user and encrypted password
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        { //This is the data (claims) that will be encoded inside the token. It’s typically:
            _id: this._id, //mongoDB gives this 
            email: this.email,
            username : this.username,
            fullName :this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY //Tells JWT how long the token is valid for.
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
        return jwt.sign(  //syntax
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User" , userSchema);


//This adds a custom method to all user instances created from your userSchema.
//this refers to the current user document.
// You can now call user.generateAccessToken() wherever you have a user instance (like after login).


