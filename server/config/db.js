import mongoose from "mongoose";

const connectDB = async () => {
    try {
        
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database Connected");

    } catch (error) {
        console.error(error.message);
        process.exit(1); //program ended with error 0 - without error
    }
}

export default connectDB;