import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({ //kya kya allow kr skte h to uski preparation chal rhi h kisko allow krna h kisko nhi middleware h ye
    origin: process.env.CORS_ORIGIN,
    credentials: true
})) // origin: process.env.CORS_ORIGIN: Only allows requests from the origin (URL/domain) defined in the environment variable CORS_ORIGIN.
//credentials: true: Allows cookies and authorization headers to be included in requests.

app.use(express.json({limit: "10kb"})) //json accept krrhe h to json configure krrhe h kitne limit ke liye krna h (form se data aarha hai)
app.use(express.urlencoded({extended: true , limit: "10kb"})) //jab url se data aarha h to use smjho
app.use(express.static("public")) //static mtb koi bhi assets like pdf photo use public folder mai save rkhn hai
app.use(cookieParser()) 

//routes

import userRouter from './routes/user.routes.js' //vha default export kiya h to kisi bhi naam se import kr skte h

//routes declaration
// app.get use nhi krskte because abb yhi pe route nhi banaya h alag banaya h to middleware use krne pdege 

app.use("/api/v1/users" , userRouter); //=> ye api/v1/users aate hi control userRouter pe transfer hojayega
// http://locallhost:8000/api/v1/users/register 

export {app};