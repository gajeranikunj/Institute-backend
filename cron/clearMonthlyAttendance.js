const cron = require('node-cron');
const Attendance = require('../models/Attendance');

// This will run at 23:59 on the last day of every month
const clearMonthlyAttendanceJob = cron.schedule('59 23 28-31 * *', async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Check if tomorrow is next month
  if (tomorrow.getMonth() !== today.getMonth()) {
    try {
      await Attendance.deleteMany({});
      console.log(`[CRON] Monthly attendance cleared on ${today.toISOString().split("T")[0]}`);
    } catch (err) {
      console.error('[CRON ERROR] Monthly cleanup failed:', err.message);
    }
  }
});

module.exports = clearMonthlyAttendanceJob;
