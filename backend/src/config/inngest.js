import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";
import { deleteStreamUsers, upsertStreamUsers } from "./stream.js";

export const inngest = new Inngest({
  id: "slack-clone",
});

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, email_address, first_name, last_name, image_url } = event.data;

    const newUser = {
      clerkID: id,
      email: email_address[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      image: image_url,
    };

    await User.create(newUser);

    await upsertStreamUsers({
      id: newUser.clerkID.toString(),
      name: newUser.name,
      image: newUser.image,
    });
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;
    await User.deleteOne({ clerkID: id });
    await deleteStreamUsers(id.toString());
  }
);
export const functions = [syncUser, deleteUserFromDB];
