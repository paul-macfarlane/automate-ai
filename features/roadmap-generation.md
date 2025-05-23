# Roadmap Generation

## Generator

The first core feature of automanager will be the ability to generate roadmaps for a project.

1. A roadmap requests 1 or more tasks. Tasks have a title, description (optional), assignee (optional), time-estimate (optional). In the future tasks will also have a status and comment section to facilitate an project being active, but for the sake of roadmap generation this is not necessary.
2. Assignees are not the always same thing as project members, though they can be. Project members are in-app users who can amministrate, edit, or view projects. Assignees are representations of people or teams on a project that can work on tasks. They don't have an account/login associated with them.
3. Tasks can have relate to each other. For the initial phase the only relations type will be that tasks are blocked/are blocked by other tasks, but in the future there will also be support for subtasks.
4. Note there is a slight distinction between an epic and a parent task that has subtasks. An epic is not something that can be assigned or executed, it is just a way to group tasks together. A parent tasks has subtasks but both can be assigned and worked on. Subtasks cannot have other subtasks, they don't have time estimate, and are not part of roadmap generations.
5. To generate an initial roadmap, the only tasks that will be placed on the roadmap will be tasks with time estimates, tasks with no estimate cannot be placed. Tasks do not need assignees to be on the roadmap, but to generate the initial roadmap the user needs to at least specify the amount of assignees that would be available and the amount of tasks that can be worked on concurrently by a signle assignee. Tasks will get start date and end dates associated with them that are tied to the roadmap itself. This will enable start and end date of tasks to vary depending on roadmap. A roadmap also needs a start date.
6. There will be a roadmap visualizer that displays the roadmap. The ability to edit the roadmap will be a separate feature entirely. A Project can have multiple roadmap candidates that are generated. Roadmap candidates are titled and can be deleted. As mentioned, editability will be a separate feature.

## Builder

Not v1, but another thing people might want to do is create a project with tasks from scratch and start with a visual builder where you create tasks on the roadmap and can manage them just looking at the roadmap.
