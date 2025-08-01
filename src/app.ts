import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
// import expressSession from "express-session";
// import { envVars } from "./app/config/env";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(expressSession({
//     secret: envVars.EXPRESS_SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }));

app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).send({
        message: "Welcome to Digital Wallet System"
    });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;