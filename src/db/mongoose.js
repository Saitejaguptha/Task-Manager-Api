const mongoose = require("mongoose");

const connectionURL = process.env.DATABASE_URL;

if (!connectionURL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

mongoose
  .connect(connectionURL, {
    serverSelectionTimeoutMS: 2000,
    appName: "mongosh+2.2.15",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
