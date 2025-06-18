import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    
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