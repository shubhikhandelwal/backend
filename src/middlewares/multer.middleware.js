import multer from "multer";

const storage = multer.diskStorage({ //The disk storage engine gives you full control on storing files to disk.
  destination: function (req, file, cb) { //file sirf multer ke paas hota h cb = call back
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) //not a good practice because overwrite ho skta h but yha pe ek bht minute amount ke liye storage pe rhega locally to yha chalega
  }
})

export const upload = multer({ storage, })

// Your code sets up multer for handling file uploads in an Express.js application, using diskStorage to temporarily save uploaded files to disk.
// destination: Tells multer to save uploaded files in ./public/temp.
// cb(null, "./public/temp"): First argument null means no error, second is the directory path.
// Uses the original filename as the saved filename.                          