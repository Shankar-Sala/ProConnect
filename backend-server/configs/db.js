import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected:", mongoose.connection.name),
    );
    await mongoose.connect(`${process.env.MONGODB_URL}/proconnect`);
  } catch (error) {
    console.log(error.message);
  }
};

export default connectDB;