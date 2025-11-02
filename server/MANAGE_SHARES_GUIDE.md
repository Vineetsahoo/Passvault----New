# Pass Sharing Management CLI Tool

## Overview
A command-line interface tool to manage pass sharing requests in PassVault.

## Features
- ✅ List all pending share requests
- ✅ List all active shares
- ✅ Accept individual share requests
- ✅ Reject individual share requests
- ✅ Accept ALL pending requests at once
- ✅ Revoke active shares
- ✅ View sharing statistics

## Usage

### Start the Tool
```bash
cd server
npm run manage-shares
```

Or directly:
```bash
node manageShares.js
```

### Menu Options

**1. List pending share requests**
- Shows all pending shares waiting for acceptance
- Displays pass details, owner, recipient, access level, and creation date

**2. List active shares**
- Shows all currently active shares
- Displays access count and last accessed time

**3. Accept a share request**
- Accepts a specific pending share by ID
- Changes status from 'pending' to 'active'
- Creates activity log entry

**4. Reject a share request**
- Rejects a specific pending share by ID
- Changes status from 'pending' to 'revoked'
- Creates activity log entry

**5. Accept ALL pending requests**
- Quick bulk action to accept all pending shares
- Useful when you trust all requests

**6. Revoke an active share**
- Revokes access to an active share
- Immediately blocks recipient access

**7. View statistics**
- Shows counts of pending, active, revoked, and expired shares
- Quick overview of sharing activity

**8. Exit**
- Closes the tool and disconnects from database

## Examples

### Accept a Share Request
```
1. Run: npm run manage-shares
2. Select option: 1 (List pending)
3. Copy the Share ID you want to accept
4. Select option: 3 (Accept a share)
5. Paste the Share ID
6. Share status changes to 'active' ✅
```

### Quick Accept All
```
1. Run: npm run manage-shares
2. Select option: 5 (Accept ALL)
3. Confirm with 'yes'
4. All pending shares become active ✅
```

### Revoke a Share
```
1. Run: npm run manage-shares
2. Select option: 2 (List active)
3. Copy the Share ID to revoke
4. Select option: 6 (Revoke)
5. Paste the Share ID
6. Share access is revoked 🚫
```

## Share Status Flow

```
PENDING → (Accept) → ACTIVE
   ↓
(Reject) → REVOKED

ACTIVE → (Revoke) → REVOKED
   ↓
(Expire) → EXPIRED
```

## Activity Logging

All actions performed through this tool are logged in the database:
- Timestamp of action
- Who performed it
- What changed
- Reason for change

## Requirements

- Node.js 16+
- MongoDB connection
- Proper `.env` configuration with MONGODB_URI

## Security

- All operations require database access
- Changes are logged for audit purposes
- No authentication bypass - maintains data integrity
- Safe to use in production

## Tips

💡 **Best Practices:**
- Review pending shares before bulk accepting
- Check recipient email before accepting
- Use revoke instead of delete for audit trail
- Monitor statistics regularly

⚠️ **Important:**
- Accepting a share gives recipient immediate access
- Revoking is instant - recipient loses access immediately
- Expired shares are automatically handled by the system
- All actions are permanent and logged

## Troubleshooting

**Issue: Can't connect to database**
- Check your `.env` file has correct MONGODB_URI
- Ensure MongoDB is running
- Verify network connectivity

**Issue: No pending shares shown**
- All shares might already be accepted
- Check the frontend for new share requests
- Verify shares were created successfully

**Issue: Error accepting share**
- Verify the Share ID is correct (copy-paste to avoid typos)
- Check share isn't already accepted or revoked
- Ensure database permissions are correct

## Development

To modify the tool:
```javascript
// Edit: server/manageShares.js

// Add new menu option:
case '9': {
  // Your custom logic
  break;
}
```

## Support

For issues or questions:
1. Check the server logs
2. Verify database connection
3. Review MongoDB collection: `sharedpasses`
4. Check activity logs in: `sharelogs`
