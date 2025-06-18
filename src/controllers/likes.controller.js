import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

  const isLiked = await Like.findOneAndDelete(
    {
        video: videoId,
        likedBy: req.user._id
    }
  )

  if(!isLiked) { 
    // await Like.findByIdAndUpdate(videoId ,  //wrong approach as videoId is the ID of a video, not a Like document.
    //     {$set :{
    //         likedBy :  req.user._id
    //     }},
    //     {new : true}

     await Like.create({
    video: videoId,
    likedBy: req.user._id
    });
    }

    res.status(200)
    .json(
        new apiResponse(200 , {} , "Video like Toggle done"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

     const isLiked = await Like.findOneAndDelete(
    {
        comment : commentId,
        likedBy: req.user._id
    }
  )

  if(!isLiked) { 

     await Like.create({
    comment : commentId,
    likedBy: req.user._id
    });
    }

    res.status(200)
    .json(
        new apiResponse(200 , {} , "comment  like Toggle done"))



})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

     const isLiked = await Like.findOneAndDelete(
    {
        tweet : tweetId,
        likedBy: req.user._id
    }
  )

  if(!isLiked) { 

     await Like.create({
    tweet : tweetId,
    likedBy: req.user._id
    });
    }

    res.status(200)
    .json(
        new apiResponse(200 , {} , "tweet  like Toggle done"))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

     const likedVideos = await Like.find({likedBy : req.user._id})

     if (!likedVideos || likedVideos.length === 0) { 
     throw new apiError(404, "No videos liked by user");
     }


    return res.status(200).json(
        new apiResponse(200, likedVideos , "liked videos found")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}