# Issue tracker: Linear

Issues and specs for this repo live in Linear, not GitHub Issues. Use the `mcp__claude_ai_Linear__*` MCP tools (load their schemas via ToolSearch before calling).

- **Team**: My workspace (key `MY`, id `8ae317c5-3a79-44c4-9244-764d8eebddc7`) — issue IDs look like `MY-61`
- **Project**: Ski Blažek — https://linear.app/my-projects-david/project/ski-blazek-8ebdeb5ee164
- **Statuses**: Backlog, Todo, In Progress, Done, Canceled, Duplicate

## Conventions

- **Create an issue**: `save_issue` with team "My workspace" and project "Ski Blažek". Write the markdown body with real newlines, not `\n` escapes.
- **Read an issue**: `get_issue` (e.g. `MY-61`), plus `list_comments` for the discussion.
- **List issues**: `list_issues` filtered by project "Ski Blažek", with `label` / `state` filters as needed.
- **Comment on an issue**: `save_comment`.
- **Apply / remove labels**: `save_issue` with the updated `labels` list. If a label doesn't exist yet, create it with `save_issue_label` on the team first.
- **Close**: set the state to Done (or Canceled for `wontfix`) and leave a comment explaining why.

## When a skill says "publish to the issue tracker"

Create a Linear issue in the Ski Blažek project.

## When a skill says "fetch the relevant ticket"

Run `get_issue <MY-xx>` and `list_comments` for it.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single parent issue with **child** issues as tickets.

- **Map**: an issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: a sub-issue of the map (`parentId` on `save_issue`), labelled `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: Linear's native "blocked by" issue relations. A ticket is unblocked when every blocker is Done or Canceled.
- **Frontier query**: list the map's open children, drop any with an open blocker or an assignee; first in map order wins.
- **Claim**: assign the issue to "me" via `save_issue`, as the session's first write.
- **Resolve**: `save_comment` with the answer, set the state to Done, then append a context pointer (gist + issue link) to the map's Decisions-so-far.
