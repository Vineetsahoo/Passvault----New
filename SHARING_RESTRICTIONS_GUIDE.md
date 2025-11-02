# Pass Sharing Restrictions Guide

## Overview
This guide explains the different restriction types you can apply when sharing passes to control what recipients can do with shared content.

---

## Available Restrictions

### 1. **No Download** (`no-download`)
- **What it does**: Prevents recipients from downloading the pass to their device
- **Use case**: When you want to ensure the pass stays in the app only
- **Effect**: Disables download buttons and save functionality
- **Best for**: Sensitive documents that shouldn't be saved locally

**Example:**
```
Scenario: Share company ID badge
Restriction: no-download
Reason: Prevent unauthorized copies on personal devices
```

---

### 2. **No Print** (`no-print`)
- **What it does**: Prevents recipients from printing the pass
- **Use case**: Digital-only passes that lose value when printed
- **Effect**: Disables print functionality and removes print button
- **Best for**: QR codes, digital tickets, online-only passes

**Example:**
```
Scenario: Share event QR ticket
Restriction: no-print
Reason: Ticket must be scanned from device, printed copies won't work
```

---

### 3. **No Re-share** (`no-share`)
- **What it does**: Prevents recipients from sharing the pass with others
- **Use case**: Control distribution and maintain privacy
- **Effect**: Removes share button and sharing functionality
- **Best for**: Personal documents, limited access content

**Example:**
```
Scenario: Share medical records with doctor
Restriction: no-share
Reason: Medical privacy - only intended recipient should see it
```

---

### 4. **No Export** (`no-export`)
- **What it does**: Prevents recipients from exporting the pass to other formats
- **Use case**: Maintain format integrity and prevent modification
- **Effect**: Disables export to PDF, image, or other formats
- **Best for**: Official documents that must remain in original format

**Example:**
```
Scenario: Share official certificate
Restriction: no-export
Reason: Prevent format changes that could alter authenticity
```

---

### 5. **View Only** (`view-only`)
- **What it does**: **ULTIMATE RESTRICTION** - Disables ALL actions except viewing
- **Effect**: Automatically applies:
  - ✓ no-download
  - ✓ no-print
  - ✓ no-share
  - ✓ no-export
  - ✓ no-edit (forces read-only access)
- **Use case**: Maximum security - recipient can only look, nothing else
- **Best for**: Highly sensitive information, confidential documents

**Example:**
```
Scenario: Share confidential business proposal
Restriction: view-only
Reason: Maximum security - recipient can review but not save, print, or share
```

---

## How Restrictions Work

### Restriction vs Permission
- **Permissions** = What they CAN do (positive grants)
- **Restrictions** = What they CANNOT do (negative blocks)

**Example:**
```
Permissions:
  ✓ Can Download
  ✓ Can Print
  ✓ Can Re-share

Restrictions:
  ✓ no-share

Result: User CAN download and print, but CANNOT re-share
(Restrictions override conflicting permissions)
```

### Restriction Priority
Restrictions **override** permissions when there's a conflict:

```
Permission: Can Download = ✓ (enabled)
Restriction: no-download = ✓ (enabled)
→ Result: CANNOT download (restriction wins)
```

### View Only Special Behavior
When `view-only` restriction is enabled, it automatically:
1. Overrides access level to "Read Only"
2. Disables ALL permissions
3. Removes all action buttons
4. Shows "View Only" badge prominently

---

## Restriction Combinations

### Common Combinations

#### 🔒 Maximum Security
```
Access Level: View Only
Permissions: None
Restrictions: view-only
Use: Top-secret documents
```

#### 📱 Digital Only
```
Access Level: View Only
Permissions: Can Download
Restrictions: no-print, no-share
Use: Digital passes that must stay digital
```

#### 👥 Limited Sharing
```
Access Level: View Only
Permissions: Can Download, Can Print
Restrictions: no-share, no-export
Use: Personal use allowed, but no redistribution
```

#### 📄 Reference Only
```
Access Level: View Only
Permissions: Can Print
Restrictions: no-download, no-share, no-export
Use: Can make physical copy for own use, no digital copies
```

#### 🔓 Open Sharing
```
Access Level: View Only
Permissions: Can Download, Can Print, Can Re-share
Restrictions: None
Use: Public information, free distribution
```

---

## Template Examples by Use Case

### 1. Family Sharing - Open Access
```yaml
Name: Family Members
Access Level: View Only
Expiry: 365 days
Permissions:
  - Can Download
  - Can Print
Restrictions: None
```
**Why**: Trust family members with full access

---

### 2. Work - Secure Sharing
```yaml
Name: Work Colleagues
Access Level: View Only
Expiry: 30 days
Permissions: None
Restrictions:
  - no-download
  - no-print
  - no-share
```
**Why**: Corporate security requires strict control

---

### 3. Events - Digital Only
```yaml
Name: Event Attendees
Access Level: View Only
Expiry: 3 days
Permissions:
  - Can Download
Restrictions:
  - no-print
  - no-share
```
**Why**: QR tickets must be scanned from device

---

### 4. Clients - Review Only
```yaml
Name: Client Review
Access Level: View Only
Expiry: 7 days
Permissions: None
Restrictions:
  - view-only
```
**Why**: Client can review proposal but not save or distribute

---

### 5. Students - Study Access
```yaml
Name: Students
Access Level: View Only
Expiry: 90 days
Permissions:
  - Can Download
  - Can Print
Restrictions:
  - no-share
```
**Why**: Students can study but not distribute to others

---

## Backend Model Reference

### ShareTemplate Schema
```javascript
restrictions: [{
  type: String,
  enum: ['no-download', 'no-print', 'no-share', 'no-export', 'view-only']
}]
```

### SharedPass Schema
```javascript
restrictions: [{
  type: String,
  enum: ['no-download', 'no-print', 'no-share', 'no-export', 'view-only']
}]
```

**Important**: Frontend must send **exact** enum values. Case-sensitive!

---

## Restriction Behavior Matrix

| Restriction | Download | Print | Share | Export | Edit |
|-------------|----------|-------|-------|--------|------|
| (None) | ✅ | ✅ | ✅ | ✅ | Depends on access |
| no-download | ❌ | ✅ | ✅ | ✅ | Depends on access |
| no-print | ✅ | ❌ | ✅ | ✅ | Depends on access |
| no-share | ✅ | ✅ | ❌ | ✅ | Depends on access |
| no-export | ✅ | ✅ | ✅ | ❌ | Depends on access |
| **view-only** | ❌ | ❌ | ❌ | ❌ | ❌ |

✅ = Allowed (if permission also granted)  
❌ = Blocked (regardless of permission)

---

## Best Practices

### ✅ DO:
1. **Use view-only for sensitive data** - Maximum security with one setting
2. **Combine no-share with download** - User can save but not redistribute
3. **Set appropriate expiry** - Don't give permanent access with restrictions
4. **Explain to recipients** - Let them know why restrictions are in place
5. **Use templates** - Create restriction sets for common scenarios

### ❌ DON'T:
1. **Over-restrict family** - Trust family with more access
2. **Under-restrict sensitive data** - Use view-only when in doubt
3. **Forget to test** - Verify restrictions work as expected
4. **Mix conflicting settings** - Keep permission/restriction combinations logical
5. **Leave restrictions unclear** - Document why certain restrictions are applied

---

## Troubleshooting

### Issue: Recipient can still download despite no-download restriction
**Cause**: Permission override
**Solution**: Remove "Can Download" permission OR use "view-only" restriction

### Issue: View-only still allows editing
**Cause**: Access level set to "Edit"
**Solution**: view-only automatically forces "Read Only" - check backend logs

### Issue: Restrictions not applied after template usage
**Cause**: Template applied but form not updated
**Solution**: Refresh page or re-apply template

### Issue: Backend validation error on restriction
**Cause**: Frontend sending wrong enum value
**Solution**: Use exact values: 'no-download', 'no-print', 'no-share', 'no-export', 'view-only'

---

## API Examples

### Create Template with Restrictions
```javascript
await sharingAPI.createTemplate({
  name: 'Secure Sharing',
  accessLevel: 'read',
  expiryDays: 30,
  restrictions: ['no-download', 'no-print', 'no-share'],
  permissions: {
    canDownload: false,
    canPrint: false,
    canShare: false
  }
});
```

### Share with View-Only
```javascript
await sharingAPI.sharePass({
  passId: 'pass123',
  recipientEmail: 'user@example.com',
  accessLevel: 'read',
  restrictions: ['view-only'], // This alone blocks everything
  expiryDays: 7
});
```

---

## Security Considerations

### High Security Needs
```
Use: view-only restriction
Add: Short expiry (1-7 days)
Set: Access level to "View Only"
Result: Maximum protection
```

### Medium Security Needs
```
Use: no-share + no-export
Add: Moderate expiry (30 days)
Allow: Download and/or Print if needed
Result: Balanced security and usability
```

### Low Security Needs
```
Use: Minimal or no restrictions
Add: Longer expiry (90-365 days)
Allow: All permissions
Result: Maximum convenience
```

---

## Summary

**5 Restriction Types:**
1. `no-download` - Blocks saving to device
2. `no-print` - Blocks printing
3. `no-share` - Blocks redistribution
4. `no-export` - Blocks format conversion
5. `view-only` - Blocks EVERYTHING (most secure)

**Key Points:**
- Restrictions override permissions
- view-only is the nuclear option (blocks all actions)
- Combine restrictions for custom security levels
- Use templates to standardize restriction patterns
- Always consider user experience vs security needs

---

**Last Updated**: November 2, 2025  
**Version**: 1.0.0
