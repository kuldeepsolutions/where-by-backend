// import {
//   // authenticate,
//   createMeeting,
//   // getMeetings as rcGetMeetings,
//   // scheduleMeeting,
// } from "../services/ringCentralService.js";

// export const scheduleMeeting = async (req, res) => {
//   try {
//     if (!req.body || !req.body.name) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Meeting name is required" });
//     }
//     console.log(req.headers);
//     console.log(
//       "============================== RingCentral Platform =============================="
//     );
//     if (!req.session.ringCentralTokens?.refreshToken) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Refresh token is missing" });
//     }
//     if (!req.session.ringCentralTokens?.accessToken) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Access token is missing" });
//     }
//     if (!req.session.ringCentralTokens) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }

//    console.log("Session tokens:", req.session.ringCentralTokens);
//     const ringCentralPlatform = await authenticate(
//       req.session.ringCentralTokens.accessToken,
//       req.session.ringCentralTokens.refreshToken,
//       req.session.ringCentralTokens.expiresAt
//     );
//     console.log(
//       "============================== RingCentral Platform Authenticated =============================="
//     );
//     console.log("Access token:", ringCentralPlatform.auth().accessToken());
//     const meetingDetails = req.body;

//     const meeting = await createMeeting(meetingDetails);
//     console.log(meeting)
//     if (!meeting || !meeting.discovery || !meeting.discovery.web) {
//       return res
//         .status(500)
//         .json({ success: false, error: "Failed to create meeting" });
//     }

//     return res.json({
//       success: true,
//       meetingInfo: {
//         id: meeting.id,
//         name: meeting.name,
//         joinUrl: meeting.discovery.web,
//         host: meeting.host,
//         pins: meeting.pins,
//         type: meeting.type,
//         security: meeting.security,
//         recordings: meeting.recordings,
//       },
//     });
//   } catch (error) {
//     console.error("Error scheduling meeting:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

// export const createMeet = async (req, res) => {
//   try {
//     const meetingInfo = await createMeeting(req);
//     return res.status(200).json({ success: true, meetingInfo });
//   } catch (error) {
//     console.error("Error scheduling meeting:", error.message);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

// export const getMeetings = async (req, res) => {
//   try {
//     await authenticate();
//     return rcGetMeetings(req, res);
//   } catch (error) {
//     console.error("Error getting meetings:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };



import { authenticate, createMeeting } from "../services/ringCentralService.js";

export const createMeet = async (req, res) => {
  try {
    const session = req.session?.ringCentralTokens;
    if (!session?.accessToken || !session?.refreshToken) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const platform = await authenticate(
      session.accessToken,
      session.refreshToken,
      session.expiresIn
    );

    if (!platform) {
      return res.status(401).json({ success: false, error: "Authentication failed" });
    }

    const meetingPayload = req.body;
    if (!meetingPayload?.name) {
      return res.status(400).json({ success: false, error: "Meeting name is required" });
    }

    const meeting = await createMeeting(platform, meetingPayload); // ✅ pass platform in

    if (!meeting?.discovery?.web) {
      return res.status(500).json({ success: false, error: "Failed to create meeting" });
    }

    return res.status(200).json({
      success: true,
      meetingInfo: {
        id: meeting.id,
        name: meeting.name,
        joinUrl: meeting.discovery.web,
        host: meeting.host,
        pins: meeting.pins,
        type: meeting.type,
        security: meeting.security,
        recordings: meeting.recordings,
      },
    });
  } catch (error) {
    console.error("❌ Error scheduling meeting:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
