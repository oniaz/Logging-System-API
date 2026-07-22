import { env } from "./config/env.js";
import connectDB from "./infrastructure/database/connection.js";
import createApp from "./app.js";

const start = async () => {
    await connectDB(env.mongoUri);

    const app = createApp();

    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
};

start();
