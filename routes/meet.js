import express from "express";
import { createMeet,  } from "../controllers/meetingController.js";

// getMeetings
const meetRouter = express.Router();

meetRouter.post("/create-meeting", createMeet);
// meetRouter.get("/meetings", getMeetings);

export default meetRouter;
