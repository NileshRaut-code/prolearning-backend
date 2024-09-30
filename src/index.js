// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'
import redisClient from "./db/redis.js";
dotenv.config({
    path: './.env'
})

connectDB()
  .then(() => {
    console.log("✅ MongoDB connected successfully!");

    return redisClient.connect();   // Chain Redis connection
  })
  .then(() => {
    console.log("✅ Redis connected successfully!");

    // Start the Express server after both MongoDB and Redis are connected
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error connecting to database or Redis:", err);
  });

