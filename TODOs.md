# List of TODOs

- [x] generate README for development process, link out to other markdown files
- [x] create database abstraction layer
- [x] add timezone to user profile, default to est
- [x] use user timezone for dates displayed
- [x] make user set their profile after sign up (if possible)
- [x] allow ability to delete project for admins
- [x] allow ability to edit project for admins and editors
- [] add members management page or modal (wip)
  - [x] add ability to invite members
  - [x] add ability for people to accept/decline invites
    - [] add ability for users not yet in the platform to get invites after they sign up
  - [x] add ability to remove members or change their roles
    - [x] handle edge case where user removes themselves, for now just prevent user from removing themselves
    - [x] better separate project and project member code in db and action and model
- [] re-update documentation
- [] add ability to add/update/delete tasks
- [] make some of the server action stuff like zod error and general error handling more dry
