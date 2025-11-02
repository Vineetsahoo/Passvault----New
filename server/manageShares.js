import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import SharedPass from './models/SharedPass.js';
import User from './models/User.js';
import QRCode from './models/QRCode.js';
import ShareLog from './models/ShareLog.js';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/passvault';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Display all pending shares
const listPendingShares = async () => {
  try {
    const shares = await SharedPass.find({ status: 'pending' })
      .populate('owner', 'name email')
      .populate('pass', 'title qrType')
      .sort({ createdAt: -1 });

    if (shares.length === 0) {
      console.log('\n📭 No pending share requests found.\n');
      return [];
    }

    console.log('\n📋 PENDING SHARE REQUESTS:\n');
    console.log('─'.repeat(80));

    shares.forEach((share, index) => {
      console.log(`\n${index + 1}. Share ID: ${share._id}`);
      console.log(`   Pass: ${share.pass?.title || 'Unknown'} (${share.pass?.qrType || 'N/A'})`);
      console.log(`   Owner: ${share.owner?.name || 'Unknown'} (${share.owner?.email || 'N/A'})`);
      console.log(`   Recipient: ${share.recipient.name || 'N/A'} (${share.recipient.email})`);
      console.log(`   Access Level: ${share.accessLevel.toUpperCase()}`);
      console.log(`   Created: ${new Date(share.createdAt).toLocaleString()}`);
      if (share.expiresAt) {
        console.log(`   Expires: ${new Date(share.expiresAt).toLocaleString()}`);
      }
    });

    console.log('\n' + '─'.repeat(80) + '\n');
    return shares;
  } catch (error) {
    console.error('❌ Error listing shares:', error.message);
    return [];
  }
};

// Display all active shares
const listActiveShares = async () => {
  try {
    const shares = await SharedPass.find({ status: 'active' })
      .populate('owner', 'name email')
      .populate('pass', 'title qrType')
      .sort({ createdAt: -1 });

    if (shares.length === 0) {
      console.log('\n📭 No active shares found.\n');
      return [];
    }

    console.log('\n✅ ACTIVE SHARES:\n');
    console.log('─'.repeat(80));

    shares.forEach((share, index) => {
      console.log(`\n${index + 1}. Share ID: ${share._id}`);
      console.log(`   Pass: ${share.pass?.title || 'Unknown'} (${share.pass?.qrType || 'N/A'})`);
      console.log(`   Owner: ${share.owner?.name || 'Unknown'} (${share.owner?.email || 'N/A'})`);
      console.log(`   Recipient: ${share.recipient.name || 'N/A'} (${share.recipient.email})`);
      console.log(`   Access Level: ${share.accessLevel.toUpperCase()}`);
      console.log(`   Access Count: ${share.accessCount}`);
      console.log(`   Last Accessed: ${share.lastAccessed ? new Date(share.lastAccessed).toLocaleString() : 'Never'}`);
      console.log(`   Created: ${new Date(share.createdAt).toLocaleString()}`);
    });

    console.log('\n' + '─'.repeat(80) + '\n');
    return shares;
  } catch (error) {
    console.error('❌ Error listing active shares:', error.message);
    return [];
  }
};

// Accept a share request
const acceptShare = async (shareId) => {
  try {
    const share = await SharedPass.findById(shareId)
      .populate('owner', 'name email')
      .populate('pass', 'title');

    if (!share) {
      console.log('❌ Share not found');
      return false;
    }

    if (share.status !== 'pending') {
      console.log(`⚠️  Share is already ${share.status}`);
      return false;
    }

    share.status = 'active';
    await share.save();

    // Create log entry
    await ShareLog.createLog({
      sharedPass: share._id,
      owner: share.owner._id,
      action: 'accepted',
      recipient: share.recipient,
      performedBy: {
        userId: share.owner._id,
        name: share.owner.name,
        email: share.owner.email
      },
      details: {
        reason: 'Share request accepted via CLI'
      }
    });

    console.log('\n✅ Share request ACCEPTED!');
    console.log(`   Pass: ${share.pass?.title || 'Unknown'}`);
    console.log(`   Recipient: ${share.recipient.email}`);
    console.log(`   Status: ${share.status}\n`);

    return true;
  } catch (error) {
    console.error('❌ Error accepting share:', error.message);
    return false;
  }
};

// Reject a share request
const rejectShare = async (shareId) => {
  try {
    const share = await SharedPass.findById(shareId)
      .populate('owner', 'name email')
      .populate('pass', 'title');

    if (!share) {
      console.log('❌ Share not found');
      return false;
    }

    if (share.status !== 'pending') {
      console.log(`⚠️  Share is already ${share.status}`);
      return false;
    }

    share.status = 'revoked';
    await share.save();

    // Create log entry
    await ShareLog.createLog({
      sharedPass: share._id,
      owner: share.owner._id,
      action: 'declined',
      recipient: share.recipient,
      performedBy: {
        userId: share.owner._id,
        name: share.owner.name,
        email: share.owner.email
      },
      details: {
        reason: 'Share request declined via CLI'
      }
    });

    console.log('\n❌ Share request REJECTED!');
    console.log(`   Pass: ${share.pass?.title || 'Unknown'}`);
    console.log(`   Recipient: ${share.recipient.email}`);
    console.log(`   Status: ${share.status}\n`);

    return true;
  } catch (error) {
    console.error('❌ Error rejecting share:', error.message);
    return false;
  }
};

// Accept all pending shares
const acceptAllPending = async () => {
  try {
    const shares = await SharedPass.find({ status: 'pending' });

    if (shares.length === 0) {
      console.log('📭 No pending shares to accept');
      return 0;
    }

    let acceptedCount = 0;
    for (const share of shares) {
      const success = await acceptShare(share._id.toString());
      if (success) acceptedCount++;
    }

    console.log(`\n✅ Accepted ${acceptedCount} of ${shares.length} pending shares\n`);
    return acceptedCount;
  } catch (error) {
    console.error('❌ Error accepting all shares:', error.message);
    return 0;
  }
};

// Revoke an active share
const revokeShare = async (shareId) => {
  try {
    const share = await SharedPass.findById(shareId)
      .populate('owner', 'name email')
      .populate('pass', 'title');

    if (!share) {
      console.log('❌ Share not found');
      return false;
    }

    const previousStatus = share.status;
    share.status = 'revoked';
    await share.save();

    // Create log entry
    await ShareLog.createLog({
      sharedPass: share._id,
      owner: share.owner._id,
      action: 'revoked',
      recipient: share.recipient,
      performedBy: {
        userId: share.owner._id,
        name: share.owner.name,
        email: share.owner.email
      },
      details: {
        reason: 'Share revoked via CLI',
        previousValue: previousStatus
      }
    });

    console.log('\n🚫 Share REVOKED!');
    console.log(`   Pass: ${share.pass?.title || 'Unknown'}`);
    console.log(`   Recipient: ${share.recipient.email}`);
    console.log(`   Previous Status: ${previousStatus}`);
    console.log(`   New Status: ${share.status}\n`);

    return true;
  } catch (error) {
    console.error('❌ Error revoking share:', error.message);
    return false;
  }
};

// Get statistics
const getStats = async () => {
  try {
    const stats = await Promise.all([
      SharedPass.countDocuments({ status: 'pending' }),
      SharedPass.countDocuments({ status: 'active' }),
      SharedPass.countDocuments({ status: 'revoked' }),
      SharedPass.countDocuments({ status: 'expired' }),
      SharedPass.countDocuments({})
    ]);

    console.log('\n📊 SHARE STATISTICS:\n');
    console.log('─'.repeat(50));
    console.log(`   Pending:  ${stats[0]}`);
    console.log(`   Active:   ${stats[1]}`);
    console.log(`   Revoked:  ${stats[2]}`);
    console.log(`   Expired:  ${stats[3]}`);
    console.log('─'.repeat(50));
    console.log(`   Total:    ${stats[4]}\n`);
  } catch (error) {
    console.error('❌ Error getting stats:', error.message);
  }
};

// Main menu
const showMenu = () => {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║          PASS SHARING MANAGEMENT TOOL             ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  console.log('  1. List pending share requests');
  console.log('  2. List active shares');
  console.log('  3. Accept a share request');
  console.log('  4. Reject a share request');
  console.log('  5. Accept ALL pending requests');
  console.log('  6. Revoke an active share');
  console.log('  7. View statistics');
  console.log('  8. Exit\n');
};

// Main program
const main = async () => {
  await connectDB();

  let running = true;

  while (running) {
    showMenu();
    const choice = await question('Select an option (1-8): ');

    switch (choice.trim()) {
      case '1': {
        await listPendingShares();
        await question('\nPress Enter to continue...');
        break;
      }

      case '2': {
        await listActiveShares();
        await question('\nPress Enter to continue...');
        break;
      }

      case '3': {
        const shares = await listPendingShares();
        if (shares.length > 0) {
          const shareId = await question('Enter Share ID to accept: ');
          await acceptShare(shareId.trim());
        }
        await question('\nPress Enter to continue...');
        break;
      }

      case '4': {
        const shares = await listPendingShares();
        if (shares.length > 0) {
          const shareId = await question('Enter Share ID to reject: ');
          await rejectShare(shareId.trim());
        }
        await question('\nPress Enter to continue...');
        break;
      }

      case '5': {
        const confirm = await question('Accept ALL pending requests? (yes/no): ');
        if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
          await acceptAllPending();
        } else {
          console.log('\n⚠️  Cancelled');
        }
        await question('\nPress Enter to continue...');
        break;
      }

      case '6': {
        const shares = await listActiveShares();
        if (shares.length > 0) {
          const shareId = await question('Enter Share ID to revoke: ');
          await revokeShare(shareId.trim());
        }
        await question('\nPress Enter to continue...');
        break;
      }

      case '7': {
        await getStats();
        await question('\nPress Enter to continue...');
        break;
      }

      case '8': {
        console.log('\n👋 Goodbye!\n');
        running = false;
        break;
      }

      default: {
        console.log('\n⚠️  Invalid option. Please select 1-8.\n');
        await question('Press Enter to continue...');
      }
    }
  }

  rl.close();
  await mongoose.connection.close();
  process.exit(0);
};

// Run the program
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
