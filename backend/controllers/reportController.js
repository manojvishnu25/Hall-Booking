const db = require('../config/db');

function getDashboardStats(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    const totalHalls = db.prepare('SELECT COUNT(*) as count FROM halls').get().count;
    const auditoriums = db.prepare("SELECT COUNT(*) as count FROM halls WHERE hall_type = 'Auditorium'").get().count;
    const seminarHalls = db.prepare("SELECT COUNT(*) as count FROM halls WHERE hall_type = 'Seminar Hall'").get().count;
    const conferenceHalls = db.prepare("SELECT COUNT(*) as count FROM halls WHERE hall_type = 'Conference Hall'").get().count;
    const totalDepartments = db.prepare("SELECT COUNT(*) as count FROM departments WHERE status = 'active'").get().count;

    // Today's bookings
    const todayBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE event_date = ? AND status IN ('confirmed', 'pending')").get(today).count;

    // Currently occupied halls count
    const occupiedNowCount = db.prepare(`
      SELECT COUNT(DISTINCT hall_id) as count
      FROM bookings
      WHERE event_date = ?
        AND status = 'confirmed'
        AND start_time <= ?
        AND end_time > ?
    `).get(today, nowTime, nowTime).count;

    const availableNowCount = totalHalls - occupiedNowCount;

    // Active events right now
    const activeEvents = db.prepare(`
      SELECT b.*, d.department_code, d.department_name, h.hall_name, h.hall_type
      FROM bookings b
      JOIN departments d ON b.department_id = d.id
      JOIN halls h ON b.hall_id = h.id
      WHERE b.event_date = ?
        AND b.status = 'confirmed'
        AND b.start_time <= ?
        AND b.end_time > ?
    `).all(today, nowTime, nowTime);

    // Upcoming events today
    const upcomingEventsToday = db.prepare(`
      SELECT b.*, d.department_code, d.department_name, h.hall_name, h.hall_type
      FROM bookings b
      JOIN departments d ON b.department_id = d.id
      JOIN halls h ON b.hall_id = h.id
      WHERE b.event_date = ?
        AND b.status = 'confirmed'
        AND b.start_time > ?
      ORDER BY b.start_time ASC
      LIMIT 10
    `).all(today, nowTime);

    // Total cancelled bookings
    const cancelledCount = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'cancelled'").get().count;

    // Total pending approval bookings
    const pendingCount = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").get().count;

    // Hall utilization percentage
    const hallsUtilization = db.prepare(`
      SELECT 
        h.id,
        h.hall_name,
        h.hall_type,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(b.participants), 0) as total_attendees
      FROM halls h
      LEFT JOIN bookings b ON h.id = b.hall_id AND b.status = 'confirmed'
      GROUP BY h.id
      ORDER BY total_bookings DESC
    `).all();

    res.json({
      totalHalls,
      auditoriums,
      seminarHalls,
      conferenceHalls,
      totalDepartments,
      availableNow: availableNowCount,
      occupiedNow: occupiedNowCount,
      todayEvents: todayBookings,
      pendingBookings: pendingCount,
      cancelledBookings: cancelledCount,
      activeEvents,
      upcomingEventsToday,
      hallsUtilization
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Dedicated Controller Method for Past / Finished Events Module
function getPastEvents(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    const { start_date, end_date, hall_id, department_id, event_type, search } = req.query;

    let sql = `
      SELECT 
        b.*,
        d.department_code,
        d.department_name,
        h.hall_name,
        h.hall_code,
        h.hall_type,
        h.capacity as hall_capacity,
        h.location as hall_location
      FROM bookings b
      JOIN departments d ON b.department_id = d.id
      JOIN halls h ON b.hall_id = h.id
      WHERE (b.event_date < ? OR (b.event_date = ? AND b.end_time <= ?) OR b.status = 'completed')
        AND b.status != 'cancelled'
    `;
    const params = [today, today, nowTime];

    if (start_date) {
      sql += ' AND b.event_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND b.event_date <= ?';
      params.push(end_date);
    }
    if (hall_id) {
      sql += ' AND b.hall_id = ?';
      params.push(hall_id);
    }
    if (department_id) {
      sql += ' AND b.department_id = ?';
      params.push(department_id);
    }
    if (event_type) {
      sql += ' AND b.event_type = ?';
      params.push(event_type);
    }
    if (search) {
      sql += ' AND (b.event_name LIKE ? OR b.organizer_name LIKE ? OR b.organizer_designation LIKE ? OR d.department_name LIKE ? OR h.hall_name LIKE ?)';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    sql += ' ORDER BY b.event_date DESC, b.end_time DESC';

    const events = db.prepare(sql).all(...params);

    // Summary Analytics
    const totalEvents = events.length;
    const totalAttendees = events.reduce((sum, e) => sum + (e.participants || 0), 0);

    let totalMinutes = 0;
    events.forEach(e => {
      if (e.start_time && e.end_time) {
        const [sH, sM] = e.start_time.split(':').map(Number);
        const [eH, eM] = e.end_time.split(':').map(Number);
        const diff = (eH * 60 + eM) - (sH * 60 + sM);
        if (diff > 0) totalMinutes += diff;
      }
    });
    const totalHours = (totalMinutes / 60).toFixed(1);

    res.json({
      events,
      stats: {
        totalEvents,
        totalAttendees,
        totalHours
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function generateReportCSV(req, res) {
  try {
    const { start_date, end_date, hall_id, department_id, past_only } = req.query;

    let sql = `
      SELECT 
        b.id,
        b.event_date,
        b.start_time,
        b.end_time,
        b.event_name,
        b.event_type,
        d.department_code,
        d.department_name,
        h.hall_name,
        h.hall_type,
        b.participants,
        b.organizer_name,
        b.organizer_designation,
        b.organizer_contact,
        b.status
      FROM bookings b
      JOIN departments d ON b.department_id = d.id
      JOIN halls h ON b.hall_id = h.id
      WHERE 1=1
    `;
    const params = [];

    if (past_only === 'true') {
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toTimeString().slice(0, 5);
      sql += ' AND (b.event_date < ? OR (b.event_date = ? AND b.end_time <= ?) OR b.status = \'completed\') AND b.status != \'cancelled\'';
      params.push(today, today, nowTime);
    }

    if (start_date) {
      sql += ' AND b.event_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND b.event_date <= ?';
      params.push(end_date);
    }
    if (hall_id) {
      sql += ' AND b.hall_id = ?';
      params.push(hall_id);
    }
    if (department_id) {
      sql += ' AND b.department_id = ?';
      params.push(department_id);
    }

    sql += ' ORDER BY b.event_date DESC, b.start_time ASC';

    const records = db.prepare(sql).all(...params);

    // CSV header
    const headers = [
      'Booking ID', 'Date', 'Start Time', 'End Time', 'Event Name', 'Event Type',
      'Dept Code', 'Department Name', 'Hall Name', 'Hall Type', 'Participants',
      'Organizer Name', 'Organizer Designation', 'Contact', 'Status'
    ];

    let csvContent = headers.join(',') + '\n';

    records.forEach(row => {
      const line = [
        row.id,
        `"${row.event_date}"`,
        `"${row.start_time}"`,
        `"${row.end_time}"`,
        `"${(row.event_name || '').replace(/"/g, '""')}"`,
        `"${row.event_type}"`,
        `"${row.department_code}"`,
        `"${(row.department_name || '').replace(/"/g, '""')}"`,
        `"${(row.hall_name || '').replace(/"/g, '""')}"`,
        `"${row.hall_type}"`,
        row.participants,
        `"${(row.organizer_name || '').replace(/"/g, '""')}"`,
        `"${(row.organizer_designation || 'Faculty In-Charge').replace(/"/g, '""')}"`,
        `"${row.organizer_contact}"`,
        `"${row.status}"`
      ];
      csvContent += line.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hall_bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDashboardStats,
  getPastEvents,
  generateReportCSV
};
