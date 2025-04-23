export enum ProjectRole {
  Admin = "admin",
  Editor = "editor",
  Viewer = "viewer",
}

export const PROJECT_ROLES = Object.values(ProjectRole);

export const EDITABLE_PROJECT_ROLES = [ProjectRole.Admin, ProjectRole.Editor];
export const DELETABLE_PROJECT_ROLES = [ProjectRole.Admin];
export const MEMBER_MANAGEMENT_PROJECT_ROLES = [ProjectRole.Admin];
