# interndIn Frontend Revamp Plan

_Date: 2025-11-20_

## 1. Design Language & System
- **Typography**: Global `font-mono` already set to Courier New. Pair with `uppercase tracking-[0.05em]` for labels. Apply `text-balance` utility for headlines.
- **Color Palette**: Continue Tailwind CSS variables from `src/index.css` (primary blue, sidebar dark navy). Introduce semantic tokens for status (success, warning, destructive) already defined.
- **Spacing & Layout**: Use fluid padding (`px-4 sm:px-6 lg:px-8`) and max widths (`max-w-7xl`). Grid gap standards: `gap-4`, `gap-6`, `gap-8` for small/medium/large sections.
- **Components**: Prefer shadcn primitives (Card, Tabs, Dialog, Sheet, Breadcrumb, Tooltip). Add new wrappers:
  - `AppShell` (top nav + contextual sidebar) for role experiences.
  - `DataState` helper for loading/empty/error messaging.
  - `MetricCard`, `ListPanel`, `InlineStat` for dashboards.
- **States**: Skeletons via `animate-pulse` wrappers; toasts via existing `use-toast`.

## 2. Global Structure
| Area | Description |
| --- | --- |
| `src/components/shell/AppShell.jsx` | Accepts `role` prop, renders nav items, user menu, layout slots. |
| `src/components/shell/SidebarNav.jsx` | Role-specific nav definitions pulled from `src/config/navigation.js`. |
| `src/components/common/DataState.jsx` | Render loading/empty/error states consistently. |
| `src/lib/constants.js` | Role definitions, status tags, timeline copy. |
| `src/styles/theme.css` | Extra CSS for glass panels, chart gradients (imported by `index.css`). |

## 3. Page Requirements by Role

### 3.1 Public / Auth
- **Landing (`Index.jsx`)**: Refresh hero, add stats strip, testimonial carousel, CTA section.
- **Auth**: Rebuild Login, Signup (student vs alumni), Reset password within shared `AuthLayout` using Cards and `Stepper` indicator.
- **Jobs Listing (`Jobs.jsx`)**: Add list/table toggle, sticky filters, pagination, bookmarking.
- **Job Details (`JobDetails.jsx`)**: Multi-pane layout (summary, requirements, alumni recruiter info, similar jobs).

### 3.2 Students
- **Dashboard**: Widgets for profile completion, upcoming events, bookmarked roles, application activity timeline, mentor spotlight.
- **Profile (`StudentProfile.jsx`)**: Tabbed form (Basics, Academics, Experience, Documents) with autosave indicator.
- **Applications**: Dedicated page showing statuses, interviews, offers.

### 3.3 Alumni
- **Dashboard**: Pipeline view (draft postings, live roles, applicant counts), quick actions.
- **Job Management**: Post job wizard, manage postings, review applicants, shortlist actions.
- **Company Profile**: Showcase stats, upload assets, manage team members.

### 3.4 Admin
- **Dashboard**: Metrics, verification queue, heatmap of activity.
- **Moderation**: Student/Alumni approvals, reports list, messaging broadcast.
- **Taxonomies**: Manage skills/branches, import/export CSV.

## 4. Data & API Touchpoints
- Use `apiClient` helpers; add missing methods (bookmarks, applications, admin stats) under `src/lib/api.js`.
- Standardize React Query keys in `src/lib/queryKeys.js`.
- Introduce `useRoleDashboardData` hook to fetch aggregated data.

## 5. Build Sequence
1. **Shell & Shared Components** (AppShell, Sidebar, skeletons, DataState).
2. **Student Journey**: Dashboard → Jobs → Job details → Profile → Applications.
3. **Alumni Journey**: Layout + dashboard + job creation + applicants + company profile.
4. **Admin Suite**: Dashboard, approvals, taxonomies.
5. **Polish**: Animations, accessibility, responsive tweaks, `README` updates, smoke tests.

## 6. Risks & Mitigations
- **API coverage**: Document missing backend endpoints; stub with mock data until ready.
- **Auth state**: Ensure `AuthContext` handles bookmarks/applications; add optimistic updates.
- **Performance**: Use React Query caching and pagination for large lists.

## 7. Deliverables
- Updated React components per flow.
- New shared config/hooks files.
- Revised styles (`theme.css`).
- README section for frontend run instructions + screenshots.
- Manual smoke test checklist for all roles.
