import connectDB from "./db/db.js";
// require('dotenv').config({path : './env'})  //to just improve consistency
import dotenv from "dotenv";
dotenv.config({path : './.env'}) //this is not a very availiable syntax so we can use it as an experimental feature 
import {app} from './app.js'

//dot env se as soon as you load your app environment variables har jagah availiable hojaye

connectDB() //ye apn ne async await ki tarah likha hai so we can use .then and .catch to handle it because it returns a promise
.then(() => {
    app.on("error" , (error) => {
        console.error("ERROR" , error)
        throw error
       })
    app.listen(process.env.PORT, () => { //aur listen to kiya hi nhi tha to yuu krega
        console.log(`App is listening on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.error("MongoDb connection failed", error)
}) //yeh promise hai jo connectDB se aa raha hai so we can use .then and .catch to handle it








/* in this approach we have polluted index.js too much so not very clean code but also not a very bad code
import express from "express";
const app = express()


(async () => {
    try {
       await moongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) //documentation se format
       app.on("error" , (error) => { //agar koi error aagya to just in case
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