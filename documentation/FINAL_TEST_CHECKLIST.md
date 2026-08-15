# TourFlow Final Test Checklist

## Start
1. Start WAMP / MySQL.
2. Start Spring Boot backend on port 8080.
3. Start frontend with `npm run dev`.
4. Open the exact Vite localhost URL.

## Role tests

### System Administrator
`admin@tourflow.local`
- Dashboard cards load.
- Recent Activity loads.
- System Health loads.
- Add/Edit/Delete tourist site works.
- Destination images load.

### Tourist
`tourist@tourflow.local`
- Destination cards load.
- Booking works.
- QR ticket works.
- My Bookings works.
- Cancel works when booking is cancellable.

### Site Manager
`manager@tourflow.local`
- Crowd dashboard loads.
- Time Slot Add/Edit/Delete works.

### Entrance Officer
`entrance@tourflow.local`
- Search booking works.
- Confirm Check-in works.
- Duplicate check-in is blocked.
- Current visitor count increases.

### Safety Officer
`safety@tourflow.local`
- Create Alert works.
- Start Response works.
- Mark Resolved works.

### Maintenance Officer
`maintenance@tourflow.local`
- Add Task works.
- Start Task works.
- Mark Completed works.

### Tour Guide
`guide@tourflow.local`
- Requests load.
- Accept/Reject works.
- Accepted count updates.

## Visual checks
- TourFlow symbol is visible on Login and every role header.
- No broken image icon.
- Horton Plains shows an actual Horton Plains landscape while online.
- If internet image fails, local image fallback still displays.
- Success messages auto-hide.
