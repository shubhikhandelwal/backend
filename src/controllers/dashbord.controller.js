import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//****************************everything is new*************************/
const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params

    const videoStats = await Video.aggregate([
        //total video views and total videos
        {
                    $match: {
                         owner : new mongoose.Types.ObjectId(channelId)
                    }
                },
                // {  //lookup makes no sense here
                //     $lookup: {
                //         from: "videos",
                //         localField: "channel",
                //         foreignField: "views",
                //         as: "videoViews"
                //     }
                // },
                {  //newwwww
                    $group : {
                        _id: "$owner",  //Groups documents (videos) by their owner (channel ID).
                        totalViews : {$sum : "$views"}, //Adds up the views field for each video that belongs to that owner.
                        totalVideos : {$sum : 1} //Counts how many videos each channel (owner) has — by adding 1 for each document in the group.
                    }
                }
    ]) 

    const totalSubscribers = await Subscription.countDocuments({
    channel: channelId
    })

    const totalLikesStats = await Like.aggregate([
        {
        $lookup: {    //sare videos of the same id in both model nikal liye
    //for each document in the Like collection, find the document(s) in the videos collection where _id matches Like.video, and attach them as an array under videoInfo.”
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "videoInfo"
        }
    },

    {
        $match: {
            "videoInfo.owner": new mongoose.Types.ObjectId(channelId) //This keeps only those like documents where: The joined video (from videoInfo) belongs to the target channel.
        }
    },

    {
        $count: "totalLikes" // Count all matching documents and store it in this
    }

    ])

    const stats = {
    totalViews: videoStats[0]?.totalViews || 0,
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalSubscribers,
    totalLikes: totalLikesStats[0]?.totalLikes || 0
    }

    return res.status(200).json(
    new apiResponse(200, stats, "Channel stats fetched successfully")
   );


})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {owner} = req.body

    if(!owner){
        throw new apiError(400, "give the name of the channel")
    }

    const allVideos = await Video.find({owner : owner})

    if(allVideos.length == 0){
        throw apiError(400 , "no videos by this channel")
    }

    return res.status(200)
    .json(new apiResponse(200 , allVideos , "videos by the channel fetched"))

})

export {
    getChannelStats, 
    getChannelVideos
    }