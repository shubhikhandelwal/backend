import mongoose from "mongoose";


const connectDB = async () => {
    try {
        console.log("MongoDB URI:", `${process.env.MONGODB_URI}`);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`
        ) //connection hone ke baad jo response aarha hai jo moongoose as an object deta h vo yha store krliya
        console.log(`\n MongoDB connected!! DB host : ${connectionInstance.connection.host}`); //ye connectionInstance log krwake dekhna
        //agar galti se khi aur connect hojaye to pta chaljaye
    } catch (error) {
        console.log("MONGODB connection error" , error)
        process.exit(1) //read about this more here 1 represents failure se exit yha basically throw ki jagah
    }
}

export default connectDB