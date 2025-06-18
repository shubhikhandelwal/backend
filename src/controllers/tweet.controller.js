import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content , owner} = req.body

    if(!content) {
        throw new apiError(400 , "enter tweets content")
    }

    if (!owner) {
    throw new apiError(400, "Tweet must have an owner");
    }

    const tweet = await Tweet.create ({
        content,
        owner
    })

     if(!tweet) {
        throw new apiError(500 , "tweet not uploaded")
    }

    return res.status(200).json(
        new apiResponse(200, tweet , "Tweet uploaded successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // const userID  = req.params.id  wrong acc to routes
    const userID = req.params.userId; //  Matches route


    const userTweets = await Tweet.find({owner : userID})

    if(!userTweets || userTweets.length === 0) {
        throw new apiError(404 , "no tweets by user")
    }

    return res.status(200).json(
        new apiResponse(200, userTweets , "user tweets found")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {newContent} =  req.body
    // const tweetId = req.params.id; //routes se pta chalrha hai
    const tweetId = req.params.tweetId; // Matches route


    if(!newContent) {
        throw new apiError(400 , "upload content to be uploaded")
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId , 
        {$set :{
            content :  newContent
        }},
        {new : true}
    )

    if(!tweet) { 
         throw new apiError(500 , "problem in updating the tweet")
    }

     return res.status(200).json(
        new apiResponse(200, tweet , "tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    //  const tweetId = req.params.id;
     const tweetId = req.params.tweetId; //  Matches route

      const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new apiError(404, "Tweet not found");
    }

     return res.status(200).json(
        new apiResponse(200, {} , "tweet deleted successfully")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}