// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import morgan from "morgan";
// import {SDK} from '@ringcentral/sdk'
// dotenv.config();

// const app = express();

// app.use(morgan("dev"));
// app.use(express.json());

// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:5174",
//   "https://vahlayastro.com",
// ];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );



// var rcsdk = new SDK({
//     'server':       process.env.RINGCENTRAL_SERVER,
//     'clientId':     process.env.RINGCENTRAL_CLIENT_ID,
//     'clientSecret': process.env.RINGCENTRAL_CLIENT_SECRET
// });
// var platform = rcsdk.platform();
// platform.login({
//     'jwt': process.env.RINGCENTRAL_AUTH_TOKEN
// })

// platform.on(platform.events.loginSuccess, () => {
//       start_meeting()
// });

// async function start_meeting(){
//   try{
//     var endpoint = "/restapi/v1.0/account/~/extension/~/meeting"
//     var resp = await platform.post(endpoint, {
//               topic: 'Test Meeting',
//               meetingType: 'Instant',
//               allowJoinBeforeHost: true,
//               startHostVideo: true,
//               startParticipantsVideo: false

//         })
//     var jsonObj = await resp.json()
//     console.log( 'Start Your Meeting: ' + jsonObj.links.startUri )
//     console.log( 'Meeting id: ' + jsonObj.id )
//     return jsonObj
//   }catch(e){
//     console.log(e.message)
//     return e
//   }
// }

// app.post('/create-meeting',async(req,res)=>{
//     try {
//         const { topic, meetingType, allowJoinBeforeHost, startHostVideo, startParticipantsVideo } = req.body;
//         if (!topic || !meetingType) {
//             return res.status(400).json({ error: "Topic and meetingType are required" });
//         }
//         const data = await start_meeting();
//         console.log("Meeting created successfully:", data);
//         console.log(data)
//         return res.status(200).json(data);
//     } catch (error) {
//         console.error("Error creating meeting:", error);
//        return res.status(500).json({ error: "Failed to create meeting" });
//     }
// })

// app.get("/", (req, res) => {
//   res.send("Welcome to the RingCentral Meeting Scheduler API");
// });

// // Handle 404 for unmatched routes
// app.use((req, res, next) => {
//   console.log(`No route matched for: ${req.method} ${req.originalUrl}`);
//   res.status(404).json({ error: "Endpoint not found" });
// });
// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(5000, () => console.log(`🚀 Server running on port ${PORT}`));

import express from 'express';
import cors from 'cors';

const app = express();

const allowedOrigins = [
  'http://localhost:5173', // local dev
  'https://where-by-test-app.onrender.com', // deployed frontend
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
const createWherebyRoom = async (endDate) => {
  const res = await axios.post('https://api.whereby.dev/v1/meetings', {
    endDate: endDate || new Date(Date.now() + 60 * 60 * 1000).toISOString(), // default to 1 hour from now
  }, {
    headers: {
      Authorization: `Bearer ${process.env.TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  return res.data;
};
// Your API routes
app.post('/api/create-room', async (req, res) => {
    try {
        const roomData = await createWherebyRoom();
       return res.json(roomData);
    } catch (error) {
        console.error('Error creating room:', error);
      return  res.status(500).json({ error: 'Failed to create room' });
    }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
  console.log('CORS enabled for origins:', allowedOrigins.join(', '));
});
