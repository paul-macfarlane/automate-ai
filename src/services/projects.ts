import { ProjectWithMember } from "@/db/projects";

import { EDITABLE_PROJECT_ROLES, ProjectRole } from "@/models/projects";

export function isProjectEditable(project: ProjectWithMember) {
  return EDITABLE_PROJECT_ROLES.includes(project.member.role as ProjectRole);
}
