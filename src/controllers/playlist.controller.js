import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
       if (!(name && description)) {
        throw new apiError(400, "  name and description is required")
    }

     const playlist =  await Playlist.create({ //method of mongoDB
            name,
            description,
            owner: req.user._id
        })

    if(!playlist) {
        throw new apiError(500 , "playlist can't be created")
    }

    return res.status(201).json(
        new apiResponse(200, playlist , "Playlist created successfully")
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const userPlaylist = await Playlist.find({owner : userId})

     if (!userPlaylist || userPlaylist.length === 0) { //.find() often returns an empty array so it is imp to check length
     throw new apiError(404, "No playlist by user");
     }


    return res.status(200).json(
        new apiResponse(200, userPlaylist , "user playlist found")
    )
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    // const playlist = await Playlist.find({playlistId}) //wrong
    const playlist = await Playlist.findById(playlistId) 
    if(!playlist){
         throw new apiError(404 , "trouble in finding the playlist")
    }

     return res.status(200).json(
        new apiResponse(200, playlist , "playlist of given id found")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!(playlistId && videoId)) {
        throw new apiError(400, "Playlist ID and Video ID are required");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId }  //new thing learned videos ki array mai add krdiya
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new apiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new apiResponse(200, updatedPlaylist, "Video added to playlist")
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

     if (!(playlistId && videoId)) {
        throw new apiError(400, "Playlist ID and Video ID are required");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }  //new thing learned videos ki array mai se remove krdiya
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new apiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new apiResponse(200, updatedPlaylist, "Video deleted from playlist")
    );


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

      const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
        throw new apiError(404, "playlist not found");
    }

     return res.status(200).json(
        new apiResponse(200, deletedPlaylist , "playlist deleted successfully")
    )

    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

     if(!(playlistId && name && description)) {
        throw new apiError(400 , "unsufficient info")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId , 
        {$set :{
            name,
            description
        }},
        {new : true}
    )

    if(!playlist) { 
         throw new apiError(500 , "problem in updating the playlist")
    }

     return res.status(200).json(
        new apiResponse(200, playlist , "playlist updated successfully")
    )
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}