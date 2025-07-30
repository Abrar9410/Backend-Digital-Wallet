import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);

        if (envVars.NODE_ENV === "development") {
            console.log("Connected to Database!");
        };

        server = app.listen(envVars.PORT, () => {
            if (envVars.NODE_ENV === "development") {
                console.log("Server is running on port", envVars.PORT);
            };
        });
    } catch (error) {
        if (envVars.NODE_ENV === "development") {
            console.log(error);
        };
    }
};

startServer();