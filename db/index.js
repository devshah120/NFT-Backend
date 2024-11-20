import mongoose from "mongoose";
import {DB_NAME} from "../config/constants.js";


const connectDB = async () => {

    try {
        // const sanitizedMongoUri = process.env.MONGO_URI.replace(/\/$/, '');
        // const sanitizedDbName = DB_NAME.replace(/^\//, '');
        const connection = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true 
        })
        console.log(`\n connected: ${connection.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}

export default connectDB