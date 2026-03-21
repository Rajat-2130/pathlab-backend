const bookingConfirmationEmail = (userName, booking) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb, #0d9488); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
    .info-card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-size: 14px; }
    .info-value { color: #1e293b; font-weight: 600; font-size: 14px; }
    .badge { background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; display: inline-block; margin: 12px 0; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 PathLab Diagnostics</h1>
      <p>Booking Confirmation</p>
    </div>
    <div class="body">
      <p class="greeting">Hello, ${userName}!</p>
      <p style="color:#475569;">Your test has been booked successfully. Here are your booking details:</p>
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Booking ID</span>
          <span class="info-value">#${booking.bookingId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Test Name</span>
          <span class="info-value">${booking.testName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date</span>
          <span class="info-value">${booking.date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time Slot</span>
          <span class="info-value">${booking.timeSlot}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount</span>
          <span class="info-value">₹${booking.price}</span>
        </div>
      </div>
      <span class="badge">⏳ Status: Pending</span>
      <p style="color:#475569; font-size:14px;">Our team will collect your sample at the scheduled time. You will receive updates as your test progresses.</p>
    </div>
    <div class="footer">
      <p>PathLab Diagnostics · support@pathlab.com · +91 98765 43210</p>
      <p style="margin-top:4px;">© ${new Date().getFullYear()} PathLab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

const welcomeEmail = (userName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb, #0d9488); padding: 40px 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 26px; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
    .feature { display: flex; align-items: flex-start; gap: 14px; margin: 16px 0; }
    .feature-icon { font-size: 22px; }
    .feature-text h4 { margin: 0 0 4px; color: #1e293b; font-size: 15px; }
    .feature-text p { margin: 0; color: #64748b; font-size: 13px; }
    .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Welcome to PathLab!</h1>
      <p>Your trusted diagnostic partner</p>
    </div>
    <div class="body">
      <p class="greeting">Hello, ${userName}! 👋</p>
      <p style="color:#475569;">Thank you for registering with PathLab. Your account is ready. Here's what you can do:</p>
      <div class="feature">
        <span class="feature-icon">🔬</span>
        <div class="feature-text">
          <h4>Book Lab Tests</h4>
          <p>Choose from 200+ pathology tests at affordable prices.</p>
        </div>
      </div>
      <div class="feature">
        <span class="feature-icon">📅</span>
        <div class="feature-text">
          <h4>Track Your Bookings</h4>
          <p>Real-time status updates from booking to report delivery.</p>
        </div>
      </div>
      <div class="feature">
        <span class="feature-icon">📄</span>
        <div class="feature-text">
          <h4>Download Reports</h4>
          <p>Access your test reports anytime from your dashboard.</p>
        </div>
      </div>
      <div style="text-align:center; margin-top:28px;">
        <a href="${process.env.CLIENT_URL}/dashboard" class="btn">
          Go to My Dashboard →
        </a>
      </div>
    </div>
    <div class="footer">
      <p>PathLab Diagnostics · rajat.tarun2003@gmail.com· +91 7905755634</p>
      <p style="margin-top:4px;">© ${new Date().getFullYear()} PathLab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

module.exports = { bookingConfirmationEmail, welcomeEmail }