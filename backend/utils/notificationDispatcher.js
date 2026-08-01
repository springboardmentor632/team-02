const Notification = require('../models/notification');
const User = require('../models/user');

/**
 * Dispatch a multi-channel notification (In-App, Email, SMS).
 */
async function dispatchNotification({
  title,
  message,
  type = 'info',
  category = 'system',
  user = null,
  targetRoles = ['Citizen'],
  link = '',
  channels = ['in_app', 'email', 'sms'],
}) {
  try {
    const deliveryStatus = {
      inApp: 'Delivered',
      email: channels.includes('email') ? 'Sent' : 'Not Sent',
      sms: channels.includes('sms') ? 'Sent' : 'Not Sent',
    };

    // If sent to a specific user, check preferences
    if (user) {
      const recipient = await User.findById(user);
      if (recipient && recipient.notificationPreferences) {
        const prefs = recipient.notificationPreferences;
        if (channels.includes('email') && !prefs.emailAlerts) {
          deliveryStatus.email = 'Not Sent';
        }
        if (channels.includes('sms') && !prefs.smsAlerts) {
          deliveryStatus.sms = 'Not Sent';
        }
      }
    }

    const notification = await Notification.create({
      title,
      message,
      type,
      category,
      channels,
      deliveryStatus,
      targetRoles,
      user,
      link,
      sentAt: new Date(),
    });

    // Simulate Email & SMS dispatch logs
    if (deliveryStatus.email === 'Sent') {
      console.log(`[EMAIL DISPATCH] 📧 To: ${user ? 'User #' + user : 'Roles: ' + targetRoles.join(', ')} | Subject: "${title}" | Body: "${message}"`);
    }
    if (deliveryStatus.sms === 'Sent') {
      console.log(`[SMS DISPATCH] 📱 To: ${user ? 'User #' + user : 'Roles: ' + targetRoles.join(', ')} | Text: "${title}: ${message}"`);
    }

    return notification;
  } catch (error) {
    console.error('Failed to dispatch notification:', error);
    return null;
  }
}

module.exports = { dispatchNotification };
