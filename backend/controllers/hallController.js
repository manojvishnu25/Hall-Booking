const db = require('../config/db');

function getAllHalls(req, res) {
  try {
    const halls = db.prepare('SELECT * FROM halls ORDER BY hall_name ASC').all();
    res.json(halls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getHallById(req, res) {
  try {
    const hall = db.prepare('SELECT * FROM halls WHERE id = ?').get(req.params.id);
    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }
    res.json(hall);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createHall(req, res) {
  const { hall_code, hall_name, hall_type, capacity, location, facilities, status } = req.body;

  if (!hall_code || !hall_name || !hall_type || !capacity || !location) {
    return res.status(400).json({ error: 'Code, name, type, capacity, and location are required' });
  }

  const allowedTypes = ['Auditorium', 'Seminar Hall', 'Conference Hall'];
  if (!allowedTypes.includes(hall_type)) {
    return res.status(400).json({ error: `Hall type must be one of: ${allowedTypes.join(', ')}` });
  }

  try {
    const codeUpper = hall_code.toUpperCase().trim();
    const existing = db.prepare('SELECT id FROM halls WHERE hall_code = ?').get(codeUpper);
    if (existing) {
      return res.status(400).json({ error: `Hall code ${codeUpper} already exists` });
    }

    const stmt = db.prepare(`
      INSERT INTO halls (hall_code, hall_name, hall_type, capacity, location, facilities, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      codeUpper,
      hall_name.trim(),
      hall_type,
      parseInt(capacity, 10),
      location.trim(),
      facilities ? facilities.trim() : '',
      status || 'active'
    );

    res.status(201).json({
      message: 'Hall created successfully',
      id: info.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateHall(req, res) {
  const { id } = req.params;
  const { hall_name, hall_type, capacity, location, facilities, status } = req.body;

  try {
    const hall = db.prepare('SELECT * FROM halls WHERE id = ?').get(id);
    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }

    db.prepare(`
      UPDATE halls
      SET hall_name = ?, hall_type = ?, capacity = ?, location = ?, facilities = ?, status = ?
      WHERE id = ?
    `).run(
      hall_name ? hall_name.trim() : hall.hall_name,
      hall_type || hall.hall_type,
      capacity ? parseInt(capacity, 10) : hall.capacity,
      location ? location.trim() : hall.location,
      facilities !== undefined ? facilities.trim() : hall.facilities,
      status || hall.status,
      id
    );

    res.json({ message: 'Hall updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function deleteHall(req, res) {
  const { id } = req.params;
  try {
    const info = db.prepare('DELETE FROM halls WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Hall not found' });
    }
    res.json({ message: 'Hall deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Hall availability and current status check
function getHallAvailability(req, res) {
  const { date, time } = req.query; // date: YYYY-MM-DD, time: HH:MM

  // Default to today and now if not provided
  const targetDate = date || new Date().toISOString().split('T')[0];
  const targetTime = time || new Date().toTimeString().slice(0, 5);

  try {
    const halls = db.prepare('SELECT * FROM halls WHERE status != ? ORDER BY hall_name ASC').all('inactive');

    // Get all confirmed/pending bookings for the target date
    const bookings = db.prepare(`
      SELECT b.*, d.department_code, d.department_name, h.hall_name
      FROM bookings b
      JOIN departments d ON b.department_id = d.id
      JOIN halls h ON b.hall_id = h.id
      WHERE b.event_date = ? AND b.status IN ('confirmed', 'pending')
      ORDER BY b.start_time ASC
    `).all(targetDate);

    const result = halls.map(hall => {
      const hallBookings = bookings.filter(b => b.hall_id === hall.id);

      // Find current event running at targetTime
      const currentEvent = hallBookings.find(b => b.start_time <= targetTime && b.end_time > targetTime);

      // Find next event scheduled after targetTime
      const nextEvent = hallBookings.find(b => b.start_time > targetTime);

      let currentStatus = 'Available';
      if (hall.status === 'maintenance') {
        currentStatus = 'Maintenance';
      } else if (currentEvent) {
        currentStatus = 'Currently Occupied';
      } else if (nextEvent && nextEvent.start_time <= targetTime) {
        currentStatus = 'Upcoming Booking';
      }

      return {
        ...hall,
        currentStatus,
        currentEvent: currentEvent || null,
        nextEvent: nextEvent || null,
        allTodayBookings: hallBookings
      };
    });

    res.json({
      queryDate: targetDate,
      queryTime: targetTime,
      halls: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall,
  getHallAvailability
};
