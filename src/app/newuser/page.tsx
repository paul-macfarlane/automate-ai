import { redirect } from "next/navigation";

export default function NewUser() {
  return redirect("/profile?newUser=true");
}
