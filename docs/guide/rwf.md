# Release Workflow (RWF)

The **Release Workflow** module adds **branch-based change governance** to the EA landscape. All changes are proposed inside a named *branch*, reviewed by an architect, and merged into the live landscape only after approval.

!!! note
    The Release Workflow module can be enabled or disabled by an administrator in [Settings](../admin/settings.md). When disabled, the "Releases" navigation item and all branch endpoints are hidden.

## Overview

The Release Workflow is inspired by Git branching and ADOIT's Release Workflow concept:

| Concept | Description |
|---------|-------------|
| **Branch** | A named sandbox. Cards, relations, and diagrams can be edited inside a branch in full isolation from the live landscape |
| **Workspace** | The branch-scoped view (Cards, Relations, Diagrams tabs) where contributors make changes |
| **Diff** | A per-field comparison between the branch draft and the current live landscape, with conflict detection |
| **Merge** | Applying a branch's changes to the live landscape after approval |
| **Snapshot** | An immutable point-in-time copy of the full landscape, used as a baseline for comparison |

### The isolation guarantee

**Branches never affect any existing view.** Reports, BPM, PPM, GRC, TurboLens, Diagrams, the Inventory, and Card Detail always show the live landscape. Branch data is only visible inside the dedicated branch workspace.

## Permissions

| Permission | Who needs it | What it enables |
|-----------|--------------|-----------------|
| `rwf.view` | All users who should see branches | Read the branch list, diff view, and snapshot list |
| `rwf.contribute` | Contributors | Create branches, edit cards/relations/diagrams inside a branch, submit for review |
| `rwf.approve` | EA Architects / reviewers | Approve, reject, and merge branches into the live landscape |

The seeded **EA Architect** role has all three permissions. Admins have all permissions by default.

## Branch Lifecycle

```
open  →  in_review  →  approved  →  merged
                   ↘  rejected   ↗  (re-open as new branch)
                   ↘  abandoned
```

| Status | Description |
|--------|-------------|
| **Open** | Branch is editable; contributors can add/change/delete cards, relations, and diagrams |
| **In Review** | Submitted for review; workspace is read-only; architects receive a notification |
| **Approved** | Approved by an architect; ready to merge |
| **Merged** | All changes have been applied to the live landscape |
| **Rejected** | Returned to the contributor with a comment |
| **Abandoned** | Permanently closed without merging |

## Creating a Branch

1. Navigate to **Releases → Branches**.
2. Click **New Branch**.
3. Enter a name and an optional description, then click **Create Branch**.

The branch is created at the current landscape state. This moment becomes the *base snapshot* used for conflict detection.

## Working in the Workspace

Open a branch and click **Open Workspace**. The workspace has three tabs:

### Cards tab

Shows all cards visible in this branch — the live landscape overlaid with branch overrides. Each card row shows the type of change:

| Badge | Meaning |
|-------|---------|
| **New** | Card was created inside this branch (not in the live landscape) |
| **Modified** | An existing card has been changed in this branch |
| **Deleted** | An existing card has been marked for deletion |
| *(none)* | Card is from the live landscape, unchanged in this branch |

Click any card row to open the branch-scoped card detail panel, where you can edit the card's name, description, and custom attributes. Changes are saved only to the branch.

### Relations tab

Shows all relations visible in this branch with their change status. New and deleted relations are indicated by badges.

### Diagrams tab

Lists all VisualFirst diagram overrides in this branch. Click a row to open the full VisualFirst diagram editor in branch-scoped mode — all edits, including palette-drop card creates, are saved to the branch and never touch the live landscape.

## Submitting for Review

When your changes are complete, open the branch detail page and click **Submit for Review**. The branch status changes to **In Review** and all users with `rwf.approve` receive an in-app notification.

## Reviewing and Approving

1. Navigate to **Releases → Branches** and select the branch in review (or click the review badge in the nav bar).
2. Click **View Changes** to see the full diff — added, modified, and deleted items, with conflict flags where the live landscape has changed since the branch was created.
3. Click **Approve** or **Reject** (with an optional comment).

## Merging into the Live Landscape

After approval, click **Merge into Main**. If there are no conflicts, the merge completes immediately. If conflicts exist (the same field was changed both in the branch and in the live landscape), a conflict resolution dialog appears. For each conflicting field you choose:

- **Use main value** — keep the current live value
- **Use branch value** — apply the branch's change

Once all conflicts are resolved, click **Merge into Main** to apply.

The branch author and all contributors receive a notification when the merge completes.

## Rollback

Merged branches support a **Rollback Merge** action (available from the branch detail page) that reverts all cards, relations, and diagrams to their state before the merge. Rollback is only available for branches merged with this version or later.

!!! warning
    Rollback cannot be undone. Use it only to correct a mistaken merge.

## Sync from Main

If the live landscape has changed since the branch was created, click **Sync from Main** to pull the latest changes into the branch. Conflicts are surfaced and must be resolved before syncing.

## Snapshots

Snapshots are named, immutable copies of the full landscape at a moment in time — like `git tag`.

1. Navigate to **Releases → Branches → Snapshots** tab (or **Releases → Snapshots**).
2. Click **New Snapshot**, enter a name, and click **Create Snapshot**.
3. Click **View Changes** on a snapshot to see what has changed in the live landscape since that snapshot was taken.

Snapshots are useful for milestone reviews, audit trails, and pre-project baselines.

## Dashboard

The **Release Dashboard** (`/rwf`) provides an overview:

- Open branches grouped by age and contributor
- Branches pending review (primary action for architects)
- Merged branches this month
- Recent snapshots

## Frequently Asked Questions

**Can I have multiple open branches at once?**
Yes. Each branch is fully independent.

**Does a branch affect reports or other modules?**
No. All existing views always read from the live landscape. Branch changes are invisible outside the workspace.

**What happens if I edit a card in a branch and someone else edits the same card in the live landscape?**
The conflict is detected at merge time using a 3-way diff. You choose which value wins per field.

**Who can delete a branch?**
Contributors can abandon their own open branches. Users with `rwf.approve` can abandon any branch.
