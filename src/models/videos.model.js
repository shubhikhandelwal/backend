import mongoose , {Schema} from "mongoose";
import { User } from "./user.model";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile : {
        type : String,
        required : true,
    },
    thumnail : {
        type : String,
        required : true,
    },
     title: {
        type : String,
        required : true,
    },
     description : {
        type : String,
        required : true,
    },
    duration : {
        type : Number,//cloudinary gives
        required : true,
    },
     views: {
        type : Number,
        default: 0
    },
    isPublished : {
        type : Boolean,
        default : true,
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : User
    }
} , {timestamps : true})

videoSchema.plugin(mongooseAggregatePaginate) //plugin is a hook Aggregation-based pagination is a method to paginate (split into pages) the results of MongoDB aggregation pipelines will be discussed further

export const Video = mongoose.model("Video" , videoSchema)