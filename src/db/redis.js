import redis from "redis";
import dotenv from "dotenv";
dotenv.config();  

const redisClient = redis.createClient({
  url: process.env.REDIUS_URL,
  password:process.env.REDIUS_PASS
});


redisClient.on("connect", () => {
  console.log("🔌 Redis client connected...");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error: ", err);
});

export default redisClient;
