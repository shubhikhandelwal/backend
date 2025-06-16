import mongoose from "mongoose";

const likeSchema = new Schema({
    video : {
        type : Schema.Types.ObjectId,
        ref : "Video"
    },
    likedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    comment  :{
        type : Schema.Types.ObjectId,
        ref : "Comment"
    }, 
    tweet  :{
        type : Schema.Types.ObjectId, //tweet like ki
        ref : "Tweet"
    }, 
})

export const Like =  mongoose.model("Like" , likeSchema)