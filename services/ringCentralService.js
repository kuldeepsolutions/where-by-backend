// import { SDK } from "@ringcentral/sdk";
// import dotenv from "dotenv";
// import fs from "fs";
// import path from "path";
// import axios from "axios";

// dotenv.config();

// // const getPlatform = () => {
// //   const rcsdk = new SDK({
// //     server:
// //       process.env.RINGCENTRAL_SERVER || "https://platform.ringcentral.com",
// //     clientId: process.env.RINGCENTRAL_CLIENT_ID,
// //     clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
// //     redirectUri: process.env.RINGCENTRAL_REDIRECT_URI,
// //   });

// //   const platformData = rcsdk.platform();
// //   if (!platformData) {
// //     throw new Error(
// //       "Platform data is not available. Please check your RingCentral SDK configuration."
// //     );
// //   }
// //   return platformData;
// // };
// // export async function authenticate(access_token,refresh_token, expires_in) {
// //   console.log("I am in authenticate function");
// //  const platform = getPlatform();
// //   try {
// //     const loggedIn = await platform.login({
// //       jwt: process.env.RINGCENTRAL_AUTH_TOKEN,
// //         // access_token: access_token,
// //         // refresh_token: refresh_token,
// //         // expires_in: expires_in,

// //     });
// //     console.log("============================== RingCentral Authentication ==============================");
// //     console.log("Logged in successfully:", loggedIn);
// //     return loggedIn;
// //   } catch (error) {
// //     // console.log(error)
// //     console.error("RingCentral authentication error:", error.originalMessage);
// //     return error;
// //   }
// // }
// // import SDK from '@ringcentral/sdk'

// const getPlatform = () => {
//   const rcsdk = new SDK({
//     server: process.env.RINGCENTRAL_SERVER || 'https://platform.ringcentral.com',
//     clientId: process.env.RINGCENTRAL_CLIENT_ID,
//     clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
//     redirectUri: process.env.RINGCENTRAL_REDIRECT_URI,
//   });

//   return rcsdk.platform();
// };

// /**
//  * Authenticates the RingCentral platform using OAuth2 access token.
//  * @param {string} accessToken
//  * @param {string} refreshToken
//  * @param {number} expiresIn
//  * @returns {object} platform instance (logged in)
//  */
// export const authenticate = async (accessToken, refreshToken, expiresIn) => {
//   try {
//     const platform = getPlatform();

//     // Manually set the access token into platform
//     platform.auth().setData({
//       access_token: accessToken,
//       refresh_token: refreshToken,
//       expires_in: expiresIn,
//     });

//     const isLoggedIn = await platform.loggedIn();
//     console.log(isLoggedIn)
//     if (!isLoggedIn) {
//       throw new Error("RingCentral platform is not logged in");
//     }

//     console.log("✅ RingCentral authenticated. Access token set.");
//     return platform;
//   } catch (error) {
//     console.error("❌ RingCentral authentication error:", error.message || error);
//     return null;
//   }
// };

// export const scheduleMeeting = async (req) => {
//   console.log("++++++++++++++++++++++++++++++++++++")
//   console.log(req.session)
//   console.log("++++++++++++++++++++++++++++++++++++")
//   if (!req.session || !req.session.ringCentralTokens) {
//     throw new Error("User not authenticated");
//   }

//   const { name } = req.body;

//   if (!name) {
//     throw new Error("Meeting name is required");
//   }

//   const { accessToken, refreshToken, expiresIn } =
//     req.session.ringCentralTokens;

//   const ringCentralPlatform = await authenticate(
//     accessToken,
//     refreshToken,
//     expiresIn
//   );
//   console.log(ringCentralPlatform)
//   if (!ringCentralPlatform) {
//     throw new Error("Authentication failed");
//   }

//   const meetingDetails = req.body;
//   const meeting = await createMeeting(meetingDetails);

//   if (!meeting || !meeting.discovery || !meeting.discovery.web) {
//     throw new Error("Failed to create meeting");
//   }

//   return {
//     id: meeting.id,
//     name: meeting.name,
//     joinUrl: meeting.discovery.web,
//     host: meeting.host,
//     pins: meeting.pins,
//     type: meeting.type,
//     security: meeting.security,
//     recordings: meeting.recordings,
//   };
// };

// export async function getMeetings(req, res) {
//   const platform = getPlatform();
//   try {
//     const response = await platform.get(
//       "/rcvideo/v1/accounts/~/extensions/~/delegators"
//     );
//     const meetings = await response.json();
//     return res.status(200).json(meetings);
//   } catch (error) {
//     console.error("Error fetching meetings:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// }
import { SDK } from "@ringcentral/sdk";
import dotenv from "dotenv";
dotenv.config();

let platform = null; // shared instance

const initPlatform = () => {
  const rcsdk = new SDK({
    server: process.env.RINGCENTRAL_SERVER || "https://platform.ringcentral.com",
    clientId: process.env.RINGCENTRAL_CLIENT_ID,
    clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
    redirectUri: process.env.RINGCENTRAL_REDIRECT_URI,
  });

  platform = rcsdk.platform();
  return platform;
};

export const authenticate = async (accessToken, refreshToken, expiresIn) => {
  try {
    if (!platform) {
      initPlatform();
    }

    platform.auth().setData({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      token_type: "Bearer",
      scope: "Meeting:RW RCM:Meeting",
    });

    // Test token by hitting a safe endpoint
    await platform.get("/restapi/v1.0/account/~");

    console.log("✅ RingCentral token validated and authenticated");
    return platform;
  } catch (error) {
    console.error("❌ RingCentral authentication error:", error.message || error);
    return null;
  }
};

export async function createMeeting(platform, payload) {
  try {
    const resp = await platform.post("/rcvideo/v2/account/~/extension/~/bridges", {
      name: payload?.name,
      allowJoinBeforeHost: true,
      muteAudio: false,
      muteVideo: true,
      type: "Scheduled",
    });

    return await resp.json();
  } catch (error) {
    console.error("Error creating meeting:", error.message);
    return null;
  }
}

// export async function createMeeting(payload) {
//   try {
//     if (!platform) {
//       throw new Error("Platform is not authenticated. Call authenticate() first.");
//     }

//     const resp = await platform.post("/rcvideo/v2/account/~/extension/~/bridges", {
//       name: payload?.name,
//       allowJoinBeforeHost: true,
//       muteAudio: false,
//       muteVideo: true,
//       type: "Scheduled",
//       // Optional security settings can be added here
//     });

//     return await resp.json();
//   } catch (error) {
//     console.error("Error creating meeting:", error.message);
//     return null;
//   }
// }
