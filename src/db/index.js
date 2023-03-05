import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    const {
      DB_USERNAME,
      DB_PASSWORD,
      DB_CLUSTER_URI,
      DB_NAME = "casper-discord-bot",
    } = process.env;
    if (!DB_CLUSTER_URI) {
      console.info(
        "Please provide DB credentials including DB_USERNAME and DB_PASSWORD in .env file"
      );
      process.exit(1);
    }

    let uri, opt;
    if (!DB_PASSWORD || !DB_USERNAME) {
      uri = `mongodb://${DB_CLUSTER_URI}/${DB_NAME}`;
    } else {
      uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_CLUSTER_URI}/${DB_NAME}`;
    }

    await mongoose.connect(uri, opt);
    console.info("Success to connect to MongoDB");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export { connectToDb };
