import { auth } from "@/auth";
import { selectUser, User } from "@/db/users";

export async function getAuthedUser(): Promise<User | undefined> {
  const session = await auth();
  if (!session?.user?.id) {
    return undefined;
  }

  const user = await selectUser(session.user.id);
  if (!user) {
    console.error("User not found in database for id: ", session.user.id);
    return undefined;
  }

  return user;
}
