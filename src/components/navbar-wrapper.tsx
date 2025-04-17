import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";

export async function NavbarWrapper() {
  const session = await auth();

  return <Navbar user={session?.user || null} />;
}
