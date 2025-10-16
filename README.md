# Employee Petition Form

A professional web-based petition form with digital signature capture for employee submissions.

## Features

- ✅ Clean, responsive design
- ✅ Digital signature capture (mouse/touch)
- ✅ Form validation
- ✅ SQLite database storage
- ✅ Admin dashboard
- ✅ CSV export functionality
- ✅ Mobile-friendly interface

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   - Petition Form: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin-dashboard-secure-2024

## Usage

### For Employees
1. Fill in your name, department, and staff ID
2. Sign in the signature box using mouse or finger
3. Submit the form

### For Administrators
1. Visit `/admin-dashboard-secure-2024` to view all submissions
2. Click "View Signature" to see individual signatures
3. Use "Export CSV" to download submission data

**Note:** The admin dashboard is accessible via a hidden endpoint for security.

## Tech Stack

- **Frontend:** HTML5, TailwindCSS, Vanilla JavaScript
- **Backend:** Node.js, Express
- **Database:** SQLite
- **Signature:** HTML5 Canvas API

## File Structure

```
├── server.js           # Express server
├── package.json        # Dependencies
├── petitions.db        # SQLite database (auto-created)
└── public/
    ├── index.html      # Main petition form
    ├── admin.html      # Admin dashboard
    ├── app.js          # Form handling
    ├── signature.js    # Signature canvas logic
    └── admin.js        # Admin dashboard logic
```

## Development

For development with auto-restart:
```bash
npm run dev
```
