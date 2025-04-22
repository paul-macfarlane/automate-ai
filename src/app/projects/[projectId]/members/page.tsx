import { redirect } from "next/navigation";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return redirect(`/projects/${projectId}/members/manage`);
}
