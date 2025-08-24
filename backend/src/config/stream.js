import { StreamChat } from "stream-chat";

const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const upsertStreamUsers = async (userData) => {
  try {
    await streamClient.upsertUser(userData);
    console.log("Stream user upserted Successfully", userData.name);
    return userData;
  } catch (error) {
    console.log("Error upserting user data :", error);
  }
};

export const deleteStreamUsers = async (userId) => {
  try {
    await streamClient.deleteUser(userId);
    console.log("Stream user deleted Successfully");
  } catch (error) {
    console.log("Error deleting user data :", error);
  }
};

export const generateStreamToken = async (userId) => {
  try {
    const userIdString = userId.toString();
    return streamClient.createToken(userIdString);
  } catch (error) {
    console.log("Error creating the token", error);
    return null;
  }
};
