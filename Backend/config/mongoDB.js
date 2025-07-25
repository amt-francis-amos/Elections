import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database Connected"));
  mongoose.connect(`${process.env.MONGO_URI}/Nsbt-DB`);
};

export default connectDB;
