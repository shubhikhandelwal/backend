import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


//****************NEW THING LEARNED **************************/
const getVideoComments = asyncHandler(async (req, res) => {  
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query //from url only

    if (!videoId) {
        throw new apiError(400, "Video ID is required");
    }

    // Convert page and limit to numbers because they are in numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const comments = await Comment.find({ video: videoId })
        .skip((pageNumber - 1) * limitNumber)  //kitne comments skip krege when we go to next page
        .limit(limitNumber); //ek page pe kitni limit


    return res.status(200).json(
        new apiResponse(200, {
            page: pageNumber,
            limit: limitNumber,
            comments
        }, "Comments fetched successfully")
    );

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {comment} = req.body
    const {videoId} = req.params
    const owner = req.user

    if(!comment){
        throw new apiError(400 , "give comment to be added")
    }

    const newComment = await Comment.create({
        owner,
        comment,
        video : videoId
    })

    if(!newComment){
        throw new apiError(400 , "trouble creating new comment")
    }

    return res.status(200)
    .json(new apiResponse (200 , newComment , "new comment has been added"))


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {comment} = req.body

    if(!comment){
        throw new apiError(400 , "give comment to be added")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId , 
        {$set : {comment}},
        {new : true}
    )

     if(!updatedComment){
        throw new apiError(400 , "trouble updating comment")
    }

    return res.status(200)
    .json(new apiResponse (200 , updatedComment , "new comment has been updated"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

     const {commentId} = req.params

     const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new apiError(404, "trouble deleting the comment");
    }

     return res.status(200).json(
        new apiResponse(200, deletedComment , " deleted successfully")
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }