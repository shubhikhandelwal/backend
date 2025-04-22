import connectDB from "./db/db.js";
// require('dotenv').config({path : './env'})  //to just improve consistency
import dotenv from "dotenv";
dotenv.config({path : './.env'}) //this is not a very availiable syntax so we can use it as an experimental feature as you can see in package.json


connectDB();





/* in this approach we have polluted index.js too much so not very clean code but also not a very bad code
import express from "express";
const app = express()


(async () => {
    try {
       await moongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) //documentation se format
       app.on("error" , (error) => {
        console.error("ERROR" , error)
        throw error
       }) //express ki app listen nhi kr parhi h to error listen kr liya .on is a listener provided by express

       app.listen(process.env.PORT , () => {
        console.log(`App is listening on port ${process.env.PORT}`)
       })
    } catch (error) {
        console.error("ERROR" , error)
        throw error
    }
})() //IIFE always use async await and try catch while using any sort of db 
 */