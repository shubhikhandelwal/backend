import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {

     // TODO: get video, upload to cloudinary, create video
    const { title, description} = req.body

    if(!(title && description)){
        throw new apiError(400 , "give title and description of the video")
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoLocalPath) {
       throw  new apiError(  400 , "video file is missing" )
    }

     if(!thumbnailLocalPath) {
       throw  new apiError(  400 , "thumbnail file is missing" )
    }

    const video  = await uploadOnCloudinary(videoLocalPath)
    const thumbnail  = await uploadOnCloudinary(thumbnailLocalPath) 

     if (!video?.url || !video?.duration) {
    throw new apiError(400, "Error while uploading video or missing duration");
    }

     if (!thumbnail?.url) {
    throw new apiError(400, "Error while uploading thumbnail");
    }
    
   const newVideo = await Video.create({
     videoFile  : video.url,
     title,
     description,
     thumbnail : thumbnail.url,
     duration : video.duration,
     owner : req.user._id
     
   })


    return res.status(200)
    .json(
        new apiResponse(200 , newVideo , "video published successfully")
    )
   
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await Video.findById(videoId) 
    if(!video){
         throw new apiError(404 , "trouble in finding the video")
    }

     return res.status(200).json(
        new apiResponse(200, video , "video of given id found")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
    const {title  , description} = req.body
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!(title || description || thumbnailLocalPath)){
        throw new apiError ( 400 , "details to be updated are missing")
    }

    // let thumbnail;  this will work but agar title aur description nhi provide kiye to vo mongoDB mai vhanges krke undefined set krdega in fields ko
    // if(thumbnailLocalPath) {
    //  thumbnail  = await uploadOnCloudinary(thumbnailLocalPath) 
    // }

    // const videoUpdate = await Video.findByIdAndUpdate(videoId , 
    //     {$set :{
    //         thumbnail :thumbnail?.url,
    //         if(title){title},
    //         if(description ){description}
    //     }
    // },
    //     {new : true}
    // )

    //************** a better approach **************************/
     let updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;

    if (thumbnailLocalPath) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!uploadedThumbnail?.url) {
            throw new apiError(400, "Thumbnail upload failed");
        }
        updateData.thumbnail = uploadedThumbnail.url;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true }
    );

    if (!updatedVideo) {
        throw new apiError(404, "Video not found");
    }

    return res.status(200)
    .json(
        new apiResponse(200 , videoUpdate , "video updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
     //TODO: delete video
    const { videoId } = req.params

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new apiError(404, "video not found");
    }

     return res.status(200).json(
        new apiResponse(200, deletedVideo , "video deleted successfully")
    )

   
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

     const video = await Video.findOne(
    {
        _id: videoId,
        owner  : req.user._id 
    }
  )

  if (!video) {
        throw new apiError(404, "Video not found");
    }  
    //publish nhi krna bss status btna h 
    //   if(!isPublished) { 

   //      await Video.create({
    //         videoFile : videoId,
   //         owner  : req.user._i
   //     });
   //     }

    //    if(!isPublished){  this is not toggling
    //     await Video.findByIdAndUpdate(videoId , {
    //         $set : {
    //             isPublished : false
    //         }
    //     } , {new : true})
    //    }

    if (video.isPublished === true) {
    newStatus = false; // unpublish the video
    } else {
    newStatus = true; // publish the video
    };   //Flips the current status of the isPublished flag

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: newStatus } },
        { new: true }
    );


    return res.status(200)
    .json(
        new apiResponse(200 , updatedVideo , "publish Toggle done"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}