# Changelog - QueueFlow MERN Queue Management System

All notable changes to the frontend of the Queue Management System (`QueueFlow`) are documented below.

## [1.0.0] - 2026-08-03

### Added
- **Protected Routes & Role-Based Authentication (`feat(auth)`)**:
  - Implemented `ProtectedRoute` wrapper guarding customer (`/dashboard`) and admin (`/admin`) routes.
  - Role verification for `customer` vs `admin` with unauthorized access redirection to `/unauthorized`.
  - Responsive navbar with user profile details, active counter badge, and sign-out handler.

- **Dashboard Enhancements & Queue Controls (`feat(dashboard)`)**:
  - Customer Dashboard with live active ticket display, real-time wait progress, service counter selector, priority selection, and notes.
  - Admin Counter Console with real-time analytics stats (Issued Today, Waiting, Serving, Completed), counter selector, and queue actions (`Call`, `Complete`, `Skip`).
  - Skeleton screens (`SkeletonCard`, `SkeletonTable`, `SkeletonStats`) for smooth loading feedback.
  - Custom `EmptyState` components when queues or tickets are empty.
  - Alert banner toast notifications for API error handling and confirmation alerts.

- **Responsive & Mobile Layout Design System (`style(responsive)`)**:
  - Sleek dark theme with glassmorphism design tokens and modern typography (`Plus Jakarta Sans`).
  - Fully responsive grid layouts and mobile menu drawer for smartphone (< 640px) and tablet (< 1024px) viewports.
  - Touch-friendly target sizes and accessible table scroll containers.

- **Login & Registration Validation (`feat(forms)`)**:
  - Interactive email regex validation and minimum password length rules.
  - Real-time client-side password strength meter (Weak, Medium, Strong).
  - Password visibility toggle (Eye/EyeOff icons).
  - Quick demo login chips for instant testing.
  - In-flight submit spinners and button state locks to prevent duplicate form submissions.

- **Code Cleanup & Refactoring (`refactor(frontend)`)**:
  - Removed unused variables and imports across React components.
  - Fixed JSX syntax warnings and optimized useEffect polling cleanup handlers.
  - Zero build warnings/errors on production build.
