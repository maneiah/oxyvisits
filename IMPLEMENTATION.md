# OXYVISITS - Implementation Summary

## Overview

This implementation provides a role-based authentication and routing system for OXYVISITS with support for two user types:

- **EMPLOYEE**: Regular users with limited access
- **HELPDESKSUPERADMIN**: Admin users with full access

Both user types use the same Ant Design layout but see different menu items and dashboard content based on their role.

## File Structure

```
src/
├── Auth/
│   └── LoginandRegister.js          # Updated login component
├── layouts/
│   └── DashboardLayout.jsx          # Shared layout for both user types
├── pages/
│   ├── admin/
│   │   └── AdminDashboard.jsx       # Admin dashboard view
│   ├── user/
│   │   └── UserDashboard.jsx        # Employee dashboard view
│   └── Unauthorized.jsx             # 403 page
├── utils/
│   └── ProtectedRoute.jsx           # Route protection component
├── core/
│   └── config/
│       └── Config.js                # API configuration
├── App.jsx                          # Main routing configuration
└── main.jsx                         # App entry point
```

## Key Features

### 1. Updated Login Component (LoginandRegister.js)

- Handles authentication for both EMPLOYEE and HELPDESKSUPERADMIN
- Stores user type in localStorage
- Redirects to unified dashboard based on primaryType
- Environment toggle (Live/Test) maintained

### 2. Protected Routes

- ProtectedRoute component checks authentication and authorization
- Redirects to login if not authenticated
- Redirects to unauthorized page if wrong role

### 3. Unified Dashboard Layout

- Single DashboardLayout component for both user types
- Dynamic menu based on primaryType:
  - **HELPDESKSUPERADMIN**: Dashboard, Users Management, Reports, Settings
  - **EMPLOYEE**: Dashboard, My Profile, My Tasks
- Collapsible sidebar
- User dropdown with profile and logout

### 4. Role-Based Dashboard Content

- AdminDashboard: Shows admin statistics (users, sessions, reports)
- UserDashboard: Shows employee statistics (tasks, completed, pending)
- Same layout, different content based on role

## Installation Steps

1. Install dependencies:

```bash
cd oxyvisits
npm install
```

2. Update API URLs in `src/core/config/Config.js`:

```javascript
const BASE_URL =
  userType === "live" ? "YOUR_LIVE_API_URL" : "YOUR_TEST_API_URL";
```

3. Run the development server:

```bash
npm run dev
```

## How It Works

### Login Flow

1. User enters credentials
2. API returns response with `primaryType` field
3. System checks if primaryType is "EMPLOYEE" or "HELPDESKSUPERADMIN"
4. Stores authentication data in localStorage
5. Redirects to `/dashboard`

### Dashboard Routing

- `/dashboard` - Main dashboard (shows AdminDashboard or UserDashboard based on role)
- `/dashboard/profile` - User profile
- `/dashboard/settings` - Settings (admin only in menu)
- `/dashboard/users` - User management (admin only)
- `/dashboard/reports` - Reports (admin only)
- `/dashboard/tasks` - Tasks (employee only)

### Authorization

- ProtectedRoute checks localStorage for token and primaryType
- Only EMPLOYEE and HELPDESKSUPERADMIN can access dashboard
- Menu items filtered based on role
- Unauthorized access redirects to 403 page

## Customization

### Adding New Routes

Edit `App.jsx`:

```javascript
<Route path="new-page" element={<NewPage />} />
```

### Adding Menu Items

Edit `DashboardLayout.jsx` in the `getMenuItems()` function:

```javascript
{
  key: '/dashboard/new-page',
  icon: <IconComponent />,
  label: 'New Page',
  onClick: () => navigate('/dashboard/new-page'),
}
```

### Changing User Roles

Update `allowedRoles` in App.jsx:

```javascript
<ProtectedRoute allowedRoles={['EMPLOYEE', 'HELPDESKSUPERADMIN', 'NEWROLE']}>
```

## Dependencies Added

- react-router-dom: Routing
- antd: UI components
- @ant-design/icons: Icons
- axios: HTTP requests

## Notes

- Both user types see the same professional layout
- Menu and content dynamically change based on primaryType
- Environment toggle (Live/Test) is maintained from original code
- All authentication tokens stored in localStorage
- Logout clears all localStorage data
