import { ProjectWithMember } from "@/db/projects";

import {
  DELETABLE_PROJECT_ROLES,
  EDITABLE_PROJECT_ROLES,
  ProjectRole,
} from "@/models/projects";

export function isProjectEditable(project: ProjectWithMember) {
  return EDITABLE_PROJECT_ROLES.includes(project.member.role as ProjectRole);
}

export function isProjectDeletable(project: ProjectWithMember) {
  return DELETABLE_PROJECT_ROLES.includes(project.member.role as ProjectRole);
}
