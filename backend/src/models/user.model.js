import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    clerkId: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
