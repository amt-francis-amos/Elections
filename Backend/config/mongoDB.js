

import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "Nsbt-Db", 
    });
    console.log("✅ Connected to DB:", conn.connection.name);
  } catch (error) {
    console.error("❌ Error connecting to the database:", error.message);
    process.exit(1);
  }
};

export default connectDb;
