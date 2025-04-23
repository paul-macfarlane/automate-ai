import {
  DELETABLE_PROJECT_ROLES,
  EDITABLE_PROJECT_ROLES,
  MEMBER_MANAGEMENT_PROJECT_ROLES,
  ProjectRole,
} from "@/models/project-members";

export function isProjectEditable(role: ProjectRole) {
  return EDITABLE_PROJECT_ROLES.includes(role);
}

export function isProjectDeletable(role: ProjectRole) {
  return DELETABLE_PROJECT_ROLES.includes(role);
}

export function areMembersManageable(role: ProjectRole) {
  return MEMBER_MANAGEMENT_PROJECT_ROLES.includes(role);
}
