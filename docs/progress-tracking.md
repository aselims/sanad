# Progress Tracking Feature

This document explains how to use the Progress Tracking feature for collaborations.

## Overview

Progress Tracking allows collaboration owners and team members to:
- Set and update overall progress percentage
- Define start and end dates
- Create and manage milestones
- Track project completion over time

## Accessing Progress Tracking

1. Navigate to a collaboration detail page
2. The Progress Tracking section is displayed in the center column
3. Only collaboration owners and team members can edit progress information

## Features

### Overall Progress

- Visual progress bar shows current completion percentage
- Edit mode allows setting a custom progress percentage (0-100%)
- Start and end dates define the project timeline

### Milestones

- Create, complete, and delete milestones
- Each milestone has a name and due date
- Mark milestones as completed to automatically update the progress
- View all milestones in a clear, chronological list

## API Endpoints

For developers, the following API endpoints are available:

- `GET /api/collaborations/:id/milestones` - Get all milestones for a collaboration
- `POST /api/collaborations/:id/milestones` - Create a new milestone
- `PUT /api/collaborations/:id/progress` - Update progress information
- `PUT /api/collaborations/milestones/:id` - Update a specific milestone
- `DELETE /api/collaborations/milestones/:id` - Delete a milestone

All endpoints except the GET method require authentication.

## Database Schema

Progress tracking uses two main entities:

1. `Collaboration` - Enhanced with:
   - `progressValue` (number) - Overall progress percentage
   - `startDate` and `endDate` (date fields) - Project timeline

2. `Milestone` - New entity with:
   - `name` (string) - Milestone name
   - `dueDate` (date) - Target completion date
   - `completed` (boolean) - Completion status
   - `collaborationId` (foreign key) - Associated collaboration

## Implementation

To implement this feature, run the database migration:

```bash
cd /path/to/backend
npm run migration:run
```

This will add all necessary database tables and fields. 