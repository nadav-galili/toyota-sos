# Mixpanel Boards (Admin Analytics)

This document tracks the Mixpanel boards configured for the admin analytics.

## Boards

- DAU/WAU by role
  - URL: (add link)
  - Definition: Daily/Weekly Active Users segmented by `role` super property (`admin`, `manager`, `driver`).

- On-time Completion Rate (7/30)
  - URL: (add link)
  - Definition: Percent tasks with `status=completed` where `estimated_end >= actual_end`, over last 7 and 30 days.

- Overdue by Driver (bar)
  - URL: (add link)
  - Definition: Count of overdue tasks grouped by lead driver (`lead_driver_id`) over selected period.

- Task Lifecycle Funnel
  - URL: (add link)
  - Definition: Funnel: `created` → `in_progress` → `completed` events. Segmented by `type` and `priority`.

## Event definitions (key properties)

- Task Created (`trackTaskCreated`)
  - `task_id`, `type`, `priority`, `lead_driver_id`
  - Super properties: `flag.*`, `cohort.variant`

- Task Assigned (`trackTaskAssigned`)
  - `task_id`, `new_lead_driver_id`
  - Super properties: `flag.*`, `cohort.variant`

- Task Status Change (`trackTaskStatusChange`)
  - `task_id`, `from_status`, `to_status`
  - Super properties: `flag.*`, `cohort.variant`

- Notification Received / Opened
  - `notification_id`, `event_type`, `task_id?`
  - Super properties: `flag.*`, `cohort.variant`

- Form Submitted
  - `form`, `mode`, `success`, `task_id?`, `error_message?`
  - Super properties: `flag.*`, `cohort.variant`


