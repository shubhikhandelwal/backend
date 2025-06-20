import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;
    //We are extracting query parameters from the URL like this: /videos?page=2&limit=5&query=funny&sortBy=views&sortType=asc&userId=abc123Default values are set in case any of these aren't provided.

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    //parseInt converts the string values (from URL) to numbers. skip tells MongoDB how many documents to skip for pagination.

    // Create the filter
    const filter = {};
    //This will hold MongoDB query filters to narrow down which videos we want.

    if (query) { 
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    } //This part does searching:
// If the user typed a word (like "funny") into the search bar (query),
//It looks for that word in either:
// video title or description
//✅ $regex allows partial matches (like "fun" matches "funny"). ✅ $options: "i" means case-insensitive search.

    // Create the sort
    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1; //We let users choose what they want, like this: This sets: 1 for ascending (A → Z, 0 → 9) -1 for descending (Z → A, latest → oldest)  sortBy mai pass hoga kse sort krna h like createdBy
  //Sorting means in what order you want to show videos: newest first → sort by date (descending) most views → sort by views (descending)alphabetically → sort by title

    // Fetch total count for pagination
    const total = await Video.countDocuments(filter);
    // Before fetching actual data, we count how many total videos match the filter (after search and userId filter). This helps calculate totalPages for pagination on frontend.



    // Fetch videos
    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);


    // Send response
    res.status(200).json(
        new apiResponse(200 , videos , "video got successfully")
    );
});


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