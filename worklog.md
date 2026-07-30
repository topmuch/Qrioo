---
Task ID: 6
Agent: Main
Task: Transform Qrioo from demo page into multi-role SaaS app (Superadmin, Admin Agence, Scan Page)

Work Log:
- Added User model to Prisma schema (email, password, role SUPERADMIN/ADMIN_AGENCE, agencyId)
- Created JWT auth system (jose + bcryptjs): /api/auth/login, /api/auth/me, /api/auth/seed-users
- Created Zustand auth store with localStorage token persistence
- Built LoginScreen component with split-panel design, demo account buttons
- Built AppSidebar with collapsible navigation, role-based menu items
- Built DashboardView with 5 KPI cards (superadmin) / 4 cards (admin agence), pack breakdown donut, activity bar chart, recent batches/scans, status distribution
- Built AgencesView (superadmin-only) with agency cards, create agency form
- Built LotsView for batch management with create form, expandable tag lists, PDF/CSV links
- Built ScanPageView to simulate what QR scanners see
- Updated dashboard API with role-based filtering (agencyId for ADMIN_AGENCE, global for SUPERADMIN)
- Updated agencies API (GET list + POST create, superadmin-only)
- Rewrote page.tsx as thin auth router: Login → App layout with sidebar + view switching

Stage Summary:
- Full authentication system with JWT tokens and bcrypt password hashing
- Role-based access: SUPERADMIN sees all data + agencies management, ADMIN_AGENCE sees only their agency data
- Login page with beautiful split-panel design and 3 demo accounts (1 superadmin, 2 admin agence)
- Sidebar navigation with 5 views: Dashboard, Agences, Lots QR, Mes Tags, Page Scan
- E2E verified: Login flow → Dashboard with real KPI data (116 tags, 2 agencies, 8 batches, 1 scan)
- Dashboard API returns role-filtered data with pack breakdown, daily activity, recent batches/scans
