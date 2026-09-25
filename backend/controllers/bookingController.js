const db = require('../config/db');

// Helper to check for overlapping bookings
function checkBookingConflict(hallId, eventDate, startTime, endTime, excludeBookingId = null) {
  let query = `
    SELECT b.*, d.department_name, d.department_code
    FROM bookings b
    JOIN departments d ON b.department_id = d.id
    WHERE b.hall_id = ?
      AND b.event_date = ?
      AND b.status IN ('confirmed', 'pending')
      AND (b.start_time < ? AND b.end_time > ?)
  `;
  const params = [hallId, eventDate, endTime, startTime];

  if (excludeBookingId) {
    query += ' AND b.id != ?';
    params.push(excludeBookingId);
  }

  return db.prepare(query).get(...params);
}

// Get all bookings with filtering
function getBookings(req, res) {
  try {
    const { date, hall_id, department_id, status, event_type, search } = req.query;

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
      WHERE 1=1
    `;
    const params = [];

    // Filter by department if logged in as department user and requesting self
    if (req.user && req.user.role === 'department') {
      sql += ' AND b.department_id = ?';
      params.push(req.user.id);
    } else if (department_id) {
      sql += ' AND b.department_id = ?';
      params.push(department_id);
    }

    if (date) {
      sql += ' AND b.event_date = ?';
      params.push(date);
    }

    if (hall_id) {
      sql += ' AND b.hall_id = ?';
      params.push(hall_id);
    }

    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    if (event_type) {
      sql += ' AND b.event_type = ?';
      params.push(event_type);
    }

    if (search) {
      sql += ' AND (b.event_name LIKE ? OR b.organizer_name LIKE ? OR d.department_name LIKE ? OR h.hall_name LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    sql += ' ORDER BY b.event_date DESC, b.start_time ASC';

    const bookings = db.prepare(sql).all(...params);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get single booking by ID
function getBookingById(req, res) {
  try {
    const booking = db.prepare(`
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
      WHERE b.id = ?
    `).get(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Role check: Department user can only view their own booking
    if (req.user.role === 'department' && booking.department_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create new booking
function createBooking(req, res) {
  const {
    hall_id,
    event_name,
    description,
    event_type,
    event_date,
    start_time,
    end_time,
    participants,
    organizer_name,
    organizer_designation,
    organizer_contact,
    special_requirements
  } = req.body;

  // Department ID comes from authenticated user or req body if Admin
  const department_id = req.user.role === 'department' ? req.user.id : req.body.department_id;

  if (!department_id || !hall_id || !event_name || !event_type || !event_date || !start_time || !end_time || !participants || !organizer_name || !organizer_contact) {
    return res.status(400).json({ error: 'All required booking fields must be completed' });
  }

  // Time logic validation
  if (start_time >= end_time) {
    return res.status(400).json({ error: 'Start time must be strictly before end time' });
  }

  const participantCount = parseInt(participants, 10);
  if (isNaN(participantCount) || participantCount <= 0) {
    return res.status(400).json({ error: 'Participant count must be a positive number' });
  }

  try {
    // Verify hall existence and capacity
    const hall = db.prepare('SELECT * FROM halls WHERE id = ?').get(hall_id);
    if (!hall) {
      return res.status(404).json({ error: 'Selected hall does not exist' });
    }

    if (hall.status !== 'active') {
      return res.status(400).json({ error: `Hall is currently unavailable due to ${hall.status} status` });
    }

    if (participantCount > hall.capacity) {
      return res.status(400).json({
        error: `Expected participants (${participantCount}) exceeds hall capacity (${hall.capacity} seats)`
      });
    }

    // Strict Double Booking Conflict Check (DB level lock check)
    const conflict = checkBookingConflict(hall_id, event_date, start_time, end_time);
    if (conflict) {
      return res.status(409).json({
        error: 'This hall is already booked during the selected time. Please select another hall or time.',
        conflictingBooking: {
          event_name: conflict.event_name,
          department: conflict.department_name,
          start_time: conflict.start_time,
          end_time: conflict.end_time
        }
      });
    }

    // Department bookings require Admin confirmation (status: pending)
    const bookingStatus = req.user && req.user.role === 'department' ? 'pending' : (req.body.status || 'confirmed');
    const designation = organizer_designation ? organizer_designation.trim() : 'Faculty In-Charge';

    const stmt = db.prepare(`
      INSERT INTO bookings (
        department_id, hall_id, event_name, description, event_type,
        event_date, start_time, end_time, participants,
        organizer_name, organizer_designation, organizer_contact, special_requirements, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      department_id,
      hall_id,
      event_name.trim(),
      description ? description.trim() : '',
      event_type,
      event_date,
      start_time,
      end_time,
      participantCount,
      organizer_name.trim(),
      designation,
      organizer_contact.trim(),
      special_requirements ? special_requirements.trim() : '',
      bookingStatus
    );

    const newBooking = db.prepare(`
      SELECT b.*, d.department_name, d.department_code, h.hall_name
      FROM bookings b
      JOIN departments d ON b.department_id = d.id
      JOIN halls h ON b.hall_id = h.id
      WHERE b.id = ?
    `).get(info.lastInsertRowid);

    // Notify connected Socket clients about new booking
    if (req.io) {
      req.io.emit('booking_updated', {
        action: 'created',
        booking: newBooking
      });
    }

    const message = bookingStatus === 'pending'
      ? 'Booking request submitted successfully! Pending Admin approval.'
      : 'Booking confirmed successfully!';

    res.status(201).json({
      message,
      booking: newBooking
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update existing booking
function updateBooking(req, res) {
  const { id } = req.params;
  const {
    hall_id,
    event_name,
    description,
    event_type,
    event_date,
    start_time,
    end_time,
    participants,
    organizer_name,
    organizer_contact,
    special_requirements,
    status
  } = req.body;

  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Role check: Department user can only modify their own booking
    if (req.user.role === 'department' && booking.department_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only modify your department bookings' });
    }

    const targetHallId = hall_id || booking.hall_id;
    const targetDate = event_date || booking.event_date;
    const targetStart = start_time || booking.start_time;
    const targetEnd = end_time || booking.end_time;
    const targetStatus = status || booking.status;

    if (targetStart >= targetEnd) {
      return res.status(400).json({ error: 'Start time must be strictly before end time' });
    }

    const targetParticipants = participants ? parseInt(participants, 10) : booking.participants;
    const hall = db.prepare('SELECT * FROM halls WHERE id = ?').get(targetHallId);

    if (targetParticipants > hall.capacity) {
      return res.status(400).json({
        error: `Expected participants (${targetParticipants}) exceeds hall capacity (${hall.capacity} seats)`
      });
    }

    // Check conflict excluding current booking ID
    if (targetStatus === 'confirmed' || targetStatus === 'pending') {
      const conflict = checkBookingConflict(targetHallId, targetDate, targetStart, targetEnd, id);
      if (conflict) {
        return res.status(409).json({
          error: 'This hall is already booked during the selected time. Please select another hall or time.',
          conflictingBooking: {
            event_name: conflict.event_name,
            department: conflict.department_name,
            start_time: conflict.start_time,
            end_time: conflict.end_time
          }
        });
      }
    }

      db.prepare(`
        UPDATE bookings
        SET hall_id = ?, event_name = ?, description = ?, event_type = ?,
            event_date = ?, start_time = ?, end_time = ?, participants = ?,
            organizer_name = ?, organizer_designation = ?, organizer_contact = ?, special_requirements = ?,
            status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        targetHallId,
        event_name ? event_name.trim() : booking.event_name,
        description !== undefined ? description.trim() : booking.description,
        event_type || booking.event_type,
        targetDate,
        targetStart,
        targetEnd,
        targetParticipants,
        organizer_name ? organizer_name.trim() : booking.organizer_name,
        organizer_designation ? organizer_designation.trim() : (booking.organizer_designation || 'Faculty In-Charge'),
        organizer_contact ? organizer_contact.trim() : booking.organizer_contact,
        special_requirements !== undefined ? special_requirements.trim() : booking.special_requirements,
        targetStatus,
        id
      );

    const updatedBooking = db.prepare(`
      SELECT b.*, d.department_name, d.department_code, h.hall_name
      FROM bookings b
      JOIN departments d ON b.department_id = d.id
      JOIN halls h ON b.hall_id = h.id
      WHERE b.id = ?
    `).get(id);

    if (req.io) {
      req.io.emit('booking_updated', {
        action: 'updated',
        booking: updatedBooking
      });
    }

    res.json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Cancel booking
function cancelBooking(req, res) {
  const { id } = req.params;

  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (req.user.role === 'department' && booking.department_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only cancel your department bookings' });
    }

    db.prepare("UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);

    if (req.io) {
      req.io.emit('booking_updated', {
        action: 'cancelled',
        bookingId: id
      });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Real-time conflict check endpoint for frontend live validation
function checkConflictEndpoint(req, res) {
  const { hall_id, event_date, start_time, end_time, exclude_id } = req.query;

  if (!hall_id || !event_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'hall_id, event_date, start_time, and end_time are required' });
  }

  try {
    const conflict = checkBookingConflict(hall_id, event_date, start_time, end_time, exclude_id);
    if (conflict) {
      return res.json({
        available: false,
        message: 'This hall is already booked during the selected time.',
        conflictingBooking: conflict
      });
    }

    res.json({
      available: true,
      message: 'Hall is available for the selected date and time.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  checkConflictEndpoint
};
