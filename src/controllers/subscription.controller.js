import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

     const isSubscribed = await Subscription.findOneAndDelete(
    {
        subscriber : req.user._id,
        channel : channelId
    }
  )

  if(!isSubscribed) { 

     await Subscription.create({
       subscriber : req.user._id,
        channel : channelId
    });
    }

    return res.status(200)
    .json(
        new apiResponse(200 , {} , "subscribtion Toggle done"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new apiError(400 , "channelId is missing")
    }

   const subscribers = await Subscription.aggregate([ 
        // {$match : {   wrong approach as You're trying to get users who have subscribed to a channel, but your current pipeline is looking for a user whose own channel matches the given channelId. That logic is backward
        //     channel : channelId
        // }}
        // ,{
        //     $lookup : { 
        //         from : "user", 
        //         localField :"channel",
        //         foreignField : "_id",
        //         as: "subscriberList"
        //     }
        // },
        // {
        //     $project: {  
        //         subscriberList : 1
        //     }
        // }

        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $project: {
                _id: 0,
                subscriber: "$subscriberDetails"
            }
        }
    ])

    if(!subscribers || subscribers.length === 0){
        throw new apiError (404 , "no subscribers")
    }

    return res.status(200)
    .json(
        // new apiResponse(200 , subscribers[0] , "subscribers fetched success")
        new apiResponse(200 , subscribers , "subscribers fetched success") //as there can be more than one subs
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new apiError(400, "subscriberId is missing");
    }

    const channelsSubscribedTo = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                _id: 0,
                channel: "$channelDetails"
            }
        }
    ]);

    if (!channelsSubscribedTo || channelsSubscribedTo.length === 0) {
        throw new apiError(404, "No channels subscribed");
    }

    return res.status(200).json(
        new apiResponse(200, channelsSubscribedTo, "Subscribed channels fetched successfully")
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}