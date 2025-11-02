# Pass Sharing Features Guide

## Overview
This guide explains how to use the Pass Sharing feature in your PassVault application, including Quick Share Links and Sharing Templates.

---

## Table of Contents
1. [Quick Share Link](#quick-share-link)
2. [Sharing Templates](#sharing-templates)
3. [Share a Pass Directly](#share-a-pass-directly)
4. [Batch Sharing](#batch-sharing)
5. [Managing Shares](#managing-shares)

---

## Quick Share Link

### What is it?
Quick Share Link generates a temporary, shareable link that allows anyone with the link to view your pass. It's perfect for quick, one-time sharing without requiring recipient email addresses.

### How to Use:

1. **Navigate to Sharing Page**
   - Go to Features → Sharing from the main menu

2. **Select a Pass**
   - In the "Quick Share Link" section
   - Click the dropdown under "Select Pass to Share"
   - Choose the pass you want to share

3. **Choose Access Level**
   - **View Only**: Recipients can only view the pass (recommended for most cases)
   - **Full Access**: Recipients can view and edit the pass (use with caution)

4. **Generate Link**
   - Click "Generate Link" button
   - A unique URL will be generated

5. **Share the Link**
   - Click "Copy" to copy the link to clipboard
   - Share via email, messaging apps, or any communication method

### Link Details:
- **Expiration**: Links expire after 24 hours
- **Max Uses**: Each link can be used up to 10 times
- **Security**: Anyone with the link can access it
- **Clear Link**: Click "Clear and generate new link" to invalidate the current link

### Best Practices:
✅ Use View Only access for public sharing  
✅ Share links through secure channels  
✅ Generate new links when the old one expires  
❌ Don't share Full Access links publicly  
❌ Don't use for long-term sharing (use direct sharing instead)

---

## Sharing Templates

### What are Sharing Templates?
Templates are pre-configured sharing settings that you can reuse to quickly share passes with consistent permissions and restrictions. They're perfect for:
- Sharing with family members regularly
- Sharing work passes with colleagues
- Sharing with trusted friends

### How to Create a Template:

1. **Open Template Creation Form**
   - In the "Sharing Templates" section
   - Click "New Template" button

2. **Fill in Template Details**

   **Template Name** (required)
   - Give your template a descriptive name
   - Examples: "Family Members", "Work Colleagues", "Trusted Friends"

   **Access Level**
   - **View Only**: Recipients can only view passes
   - **Full Access**: Recipients can edit passes

   **Expiry (Days)**
   - Set how many days before shared passes expire
   - Range: 1-365 days
   - Default: 30 days

   **Permissions** (checkboxes)
   - ☑️ **Can Download**: Allow recipients to download the pass
   - ☑️ **Can Print**: Allow recipients to print the pass
   - ☑️ **Can Re-share**: Allow recipients to share the pass with others

   **Restrictions** (buttons)
   - Click to toggle restrictions on/off
   - **no-download**: Prevent recipients from downloading the pass
   - **no-print**: Prevent recipients from printing the pass
   - **no-share**: Prevent recipients from re-sharing the pass
   - **no-export**: Prevent recipients from exporting the pass
   - **view-only**: Ultimate restriction - disables all permissions (download, print, share, export)

3. **Save Template**
   - Click "Create Template" button
   - Template appears in the templates list

### How to Use a Template:

1. **Find Your Template**
   - Browse templates in the "Sharing Templates" section
   - Each template shows:
     - Name and usage count
     - Access level (View Only / Full Access)
     - Expiry duration
     - Permissions granted
     - Restrictions applied

2. **Apply Template**
   - Click "Use This Template" button on any template
   - The share form above will auto-fill with template settings
   - You can still modify individual settings if needed

3. **Share with Template**
   - Select a pass
   - Enter recipient email
   - Click "Send Invitation"

### Managing Templates:

**Delete a Template**
- Click the trash icon (🗑️) on any template
- Confirm deletion
- Note: Deleting a template doesn't affect existing shares

**Template Statistics**
- Each template shows "Used X times" counter
- Track which templates you use most

### Template Examples:

#### 1. Family Sharing Template
```
Name: Family Members
Access Level: View Only
Expiry: 365 days
Permissions: ✓ Can Download, ✓ Can Print
Restrictions: None
```
**Use case**: Share important documents that family might need long-term

#### 2. Work Colleagues Template
```
Name: Work Colleagues
Access Level: View Only
Expiry: 30 days
Permissions: None
Restrictions: ✓ no-download, ✓ no-print, ✓ no-share
```
**Use case**: Share work-related passes with security restrictions

#### 3. Quick Friends Share
```
Name: Trusted Friends
Access Level: View Only
Expiry: 7 days
Permissions: ✓ Can Download
Restrictions: ✓ no-share, ✓ no-export
```
**Use case**: Short-term sharing for events or temporary access

---

## Share a Pass Directly

### When to Use:
- Sharing with specific people via email
- Need to track who has access
- Require detailed permissions and restrictions

### Steps:

1. **Click "New Share" Button**
   - Opens the share form

2. **Fill in Share Details**
   - **Select Pass**: Choose from your available passes
   - **Recipient Email**: Enter the recipient's email address
   - **Recipient Name**: Optional but recommended
   - **Access Level**: View Only or Full Access
   - **Expiry Days**: 1-365 days
   - **Use Template**: Optionally select a template to auto-fill settings

3. **Set Restrictions** (Optional)
   - Click restriction buttons to enable them
   - Selected restrictions appear highlighted

4. **Add Message** (Optional)
   - Personal message for the recipient

5. **Send Invitation**
   - Click "Send Invitation" button
   - Recipient receives email with access link

---

## Batch Sharing

### What is it?
Share the same pass with multiple recipients at once.

### How to Use:

1. **Navigate to Batch Share Section**
   - Scroll to "Batch Share" section

2. **Select Pass and Settings**
   - Choose pass to share
   - Set access level and expiry
   - Optionally select a template

3. **Enter Recipients**
   - Add email addresses, one per line
   - Example:
     ```
     john@example.com
     jane@example.com
     bob@example.com
     ```

4. **Send to All**
   - Click "Share with All" button
   - System sends individual invitations to each recipient
   - Shows success/failed count

---

## Managing Shares

### View Active Shares
- All your active shares appear in the main list
- Each share shows:
  - Pass name
  - Recipient email
  - Access level
  - Expiration date
  - Status badge (Active/Pending/Revoked)

### Revoke Access
- Click "Revoke Access" button on any share
- Recipient immediately loses access
- Share status changes to "Revoked"

### View Statistics
- Dashboard at top shows:
  - 📊 Active shares count
  - ⏳ Pending shares count
  - 🚫 Revoked shares count
  - ⌛ Expired shares count

### Activity Logs
- Click "View Activity" button
- See complete history:
  - Who shared what
  - When access was granted/revoked
  - Recent access attempts
  - Modifications made

---

## Terminal Management (Advanced)

For backend management, you can use the CLI tool:

```bash
cd server
npm run manage-shares
```

This allows you to:
- Accept pending share requests
- View all shares in database
- Bulk operations
- View detailed statistics

See `MANAGE_SHARES_GUIDE.md` for CLI usage.

---

## Security Best Practices

### ✅ DO:
- Use View Only access by default
- Set appropriate expiry dates
- Review active shares regularly
- Revoke access when no longer needed
- Use templates for consistent security
- Use restrictions for sensitive data

### ❌ DON'T:
- Share Full Access links publicly
- Use long expiry for sensitive data
- Ignore expired shares (clean up regularly)
- Share without restrictions for confidential passes
- Give download permission for private documents

---

## Troubleshooting

### Issue: No Passes Available to Share
**Solution**: Create passes first in the QR Codes section

### Issue: Template Not Applying
**Solution**: After clicking "Use This Template", verify the form updated above

### Issue: Share Link Not Working
**Solution**: Check if link expired (24 hours) or max uses (10) reached

### Issue: Recipient Not Receiving Email
**Solution**: 
- Check spam folder
- Verify email address is correct
- Ensure backend email service is configured

### Issue: Can't Revoke Access
**Solution**: Refresh page and try again, or use CLI tool

---

## Feature Comparison

| Feature | Quick Share Link | Direct Share | Template Share |
|---------|------------------|--------------|----------------|
| Speed | ⚡ Fastest | ⚡ Fast | ⚡⚡ Very Fast (after setup) |
| Email Required | ❌ No | ✅ Yes | ✅ Yes |
| Tracking | ⚠️ Limited | ✅ Full | ✅ Full |
| Expiration | 24 hours | Custom | Custom |
| Reusable | ❌ No | ❌ No | ✅ Yes |
| Best For | Quick sharing | One-time shares | Recurring shares |

---

## FAQ

**Q: What happens when a share expires?**  
A: The recipient loses access automatically. They'll see an "Expired" message if they try to access.

**Q: Can I extend a share after creation?**  
A: Not directly. You'll need to create a new share or modify via API.

**Q: Do templates affect existing shares?**  
A: No. Templates only affect new shares created with them.

**Q: Can recipients see who else has access?**  
A: No. Each share is private between you and the recipient.

**Q: What's the maximum number of shares per pass?**  
A: No hard limit, but consider security implications of sharing widely.

**Q: Can I share with someone without an account?**  
A: Yes! Quick Share Links work without recipient accounts.

---

## API Integration

For developers wanting to integrate sharing programmatically:

### Create Share
```javascript
await sharingAPI.sharePass({
  passId: '...',
  recipientEmail: '...',
  accessLevel: 'read',
  expiryDays: 30
});
```

### Generate Link
```javascript
await sharingAPI.generateLink({
  passId: '...',
  accessLevel: 'read',
  expiryHours: 24,
  maxUses: 10
});
```

### Create Template
```javascript
await sharingAPI.createTemplate({
  name: 'Template Name',
  accessLevel: 'read',
  expiryDays: 30,
  restrictions: ['time-limited']
});
```

See `client/src/services/api.ts` for complete API reference.

---

## Support

For issues or questions:
1. Check this guide first
2. Review error messages
3. Check browser console for technical errors
4. Test with CLI tool for backend issues
5. Review `MANAGE_SHARES_GUIDE.md` for terminal operations

---

**Last Updated**: November 2, 2025  
**Version**: 1.0.0
