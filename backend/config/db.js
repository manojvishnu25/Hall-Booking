const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'college_halls_data.json');

// Default initial state
const defaultData = {
  admins: [],
  departments: [],
  halls: [],
  bookings: [],
  autoInc: {
    admins: 1,
    departments: 1,
    halls: 1,
    bookings: 1
  }
};

let store = defaultData;

function loadStore() {
  if (fs.existsSync(dbPath)) {
    try {
      const content = fs.readFileSync(dbPath, 'utf8');
      store = JSON.parse(content);
    } catch (e) {
      store = defaultData;
    }
  } else {
    saveStore();
  }
}

function saveStore() {
  fs.writeFileSync(dbPath, JSON.stringify(store, null, 2), 'utf8');
}

loadStore();

// Helper to format ISO date string
function nowISO() {
  return new Date().toISOString();
}

class PreparedStatement {
  constructor(sql) {
    this.sql = sql.trim();
  }

  exec(params = []) {
    loadStore();
    const sql = this.sql.replace(/\s+/g, ' ');

    // 1. DELETE FROM table
    if (sql.toUpperCase().startsWith('DELETE FROM')) {
      const match = sql.match(/DELETE FROM (\w+)(?:\s+WHERE\s+(.+))?/i);
      if (match) {
        const table = match[1].toLowerCase();
        const whereClause = match[2];

        if (!whereClause) {
          const count = store[table] ? store[table].length : 0;
          store[table] = [];
          store.autoInc[table] = 1;
          saveStore();
          return { changes: count };
        }

        if (whereClause.toLowerCase() === 'id = ?') {
          const id = parseInt(params[0], 10);
          const initialLen = store[table].length;
          store[table] = store[table].filter(item => item.id !== id);
          saveStore();
          return { changes: initialLen - store[table].length };
        }
      }
    }

    // 2. INSERT INTO table
    if (sql.toUpperCase().startsWith('INSERT INTO')) {
      const match = sql.match(/INSERT INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (match) {
        const table = match[1].toLowerCase();
        const cols = match[2].split(',').map(c => c.trim());
        const newId = store.autoInc[table]++;

        const record = { id: newId, created_at: nowISO(), updated_at: nowISO() };
        cols.forEach((col, idx) => {
          record[col] = params[idx];
        });

        store[table].push(record);
        saveStore();
        return { lastInsertRowid: newId, changes: 1 };
      }
    }

    // 3. UPDATE table SET
    if (sql.toUpperCase().startsWith('UPDATE')) {
      const match = sql.match(/UPDATE (\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
      if (match) {
        const table = match[1].toLowerCase();
        const setClause = match[2];
        const whereClause = match[3];

        const setAssignments = setClause.split(',').map(s => s.trim());

        let targetId = null;
        if (whereClause.toLowerCase() === 'id = ?') {
          targetId = parseInt(params[params.length - 1], 10);
        }

        let changes = 0;
        store[table].forEach(item => {
          if (targetId !== null && item.id !== targetId) return;

          let paramIdx = 0;
          setAssignments.forEach(assign => {
            const [col, valExpr] = assign.split('=').map(s => s.trim());
            if (valExpr === '?') {
              item[col] = params[paramIdx++];
            } else if (valExpr.toUpperCase() === 'CURRENT_TIMESTAMP') {
              item[col] = nowISO();
            } else {
              item[col] = valExpr.replace(/'/g, '');
            }
          });
          item.updated_at = nowISO();
          changes++;
        });

        saveStore();
        return { changes };
      }
    }

    // 4. SELECT queries
    if (sql.toUpperCase().startsWith('SELECT')) {
      return this.querySelect(sql, params);
    }

    return [];
  }

  querySelect(sql, params) {
    // 4.1 COUNT queries
    if (sql.toUpperCase().includes('COUNT(')) {
      if (sql.includes('FROM halls') && sql.includes("hall_type = 'Auditorium'")) {
        return [{ count: store.halls.filter(h => h.hall_type === 'Auditorium').length }];
      }
      if (sql.includes('FROM halls') && sql.includes("hall_type = 'Seminar Hall'")) {
        return [{ count: store.halls.filter(h => h.hall_type === 'Seminar Hall').length }];
      }
      if (sql.includes('FROM halls') && sql.includes("hall_type = 'Conference Hall'")) {
        return [{ count: store.halls.filter(h => h.hall_type === 'Conference Hall').length }];
      }
      if (sql.includes('FROM halls')) {
        return [{ count: store.halls.length }];
      }
      if (sql.includes('FROM departments') && sql.includes("status = 'active'")) {
        return [{ count: store.departments.filter(d => d.status === 'active').length }];
      }
      if (sql.includes('FROM departments')) {
        return [{ count: store.departments.length }];
      }
      if (sql.includes("status = 'cancelled'")) {
        return [{ count: store.bookings.filter(b => b.status === 'cancelled').length }];
      }
      if (sql.includes('FROM bookings') && sql.includes("status IN ('confirmed', 'pending')")) {
        const targetDate = params[0];
        const count = store.bookings.filter(b => b.event_date === targetDate && ['confirmed', 'pending'].includes(b.status)).length;
        return [{ count }];
      }
      if (sql.includes('COUNT(DISTINCT hall_id)')) {
        const [targetDate, nowTime1, nowTime2] = params;
        const occupiedHalls = new Set(
          store.bookings
            .filter(b => b.event_date === targetDate && b.status === 'confirmed' && b.start_time <= nowTime1 && b.end_time > nowTime2)
            .map(b => b.hall_id)
        );
        return [{ count: occupiedHalls.size }];
      }
    }

    // 4.2 Hall Utilization query
    if (sql.includes('total_bookings') && sql.includes('FROM halls h')) {
      return store.halls.map(h => {
        const hBookings = store.bookings.filter(b => b.hall_id === h.id && b.status === 'confirmed');
        const total_attendees = hBookings.reduce((sum, b) => sum + (b.participants || 0), 0);
        return {
          id: h.id,
          hall_name: h.hall_name,
          hall_type: h.hall_type,
          total_bookings: hBookings.length,
          total_attendees
        };
      });
    }

    // 4.3 Admins lookup
    if (sql.includes('FROM admins WHERE username = ?')) {
      const username = params[0];
      const admin = store.admins.find(a => a.username === username);
      return admin ? [admin] : [];
    }
    if (sql.includes('FROM admins WHERE id = ?')) {
      const id = parseInt(params[0], 10);
      const admin = store.admins.find(a => a.id === id);
      return admin ? [admin] : [];
    }

    // 4.4 Departments lookup
    if (sql.includes('FROM departments WHERE department_code = ?')) {
      const code = params[0];
      const dept = store.departments.find(d => d.department_code === code);
      return dept ? [dept] : [];
    }
    if (sql.includes('FROM departments WHERE id = ?')) {
      const id = parseInt(params[0], 10);
      const dept = store.departments.find(d => d.id === id);
      return dept ? [dept] : [];
    }
    if (sql.includes('FROM departments')) {
      let list = [...store.departments];
      list.sort((a, b) => (a.department_code || '').localeCompare(b.department_code || ''));
      return list;
    }

    // 4.5 Halls lookup
    if (sql.includes('FROM halls WHERE hall_code = ?')) {
      const code = params[0];
      const hall = store.halls.find(h => h.hall_code === code);
      return hall ? [hall] : [];
    }
    if (sql.includes('FROM halls WHERE id = ?')) {
      const id = parseInt(params[0], 10);
      const hall = store.halls.find(h => h.id === id);
      return hall ? [hall] : [];
    }
    if (sql.includes('FROM halls WHERE status != ?')) {
      const statusEx = params[0];
      let list = store.halls.filter(h => h.status !== statusEx);
      list.sort((a, b) => (a.hall_name || '').localeCompare(b.hall_name || ''));
      return list;
    }
    if (sql.includes('FROM halls')) {
      let list = [...store.halls];
      list.sort((a, b) => (a.hall_name || '').localeCompare(b.hall_name || ''));
      return list;
    }

    // 4.6 Bookings queries with joins
    let bookingList = store.bookings.map(b => {
      const d = store.departments.find(dept => dept.id === b.department_id) || {};
      const h = store.halls.find(hall => hall.id === b.hall_id) || {};
      return {
        ...b,
        department_code: d.department_code || '',
        department_name: d.department_name || '',
        hall_name: h.hall_name || '',
        hall_code: h.hall_code || '',
        hall_type: h.hall_type || '',
        hall_capacity: h.capacity || 0,
        hall_location: h.location || ''
      };
    });

    // Check specific booking by ID query
    if (sql.includes('FROM bookings b') && sql.includes('WHERE b.id = ?')) {
      const id = parseInt(params[0], 10);
      const booking = bookingList.find(b => b.id === id);
      return booking ? [booking] : [];
    }

    // Overlap conflict check query
    if (sql.includes('b.start_time < ? AND b.end_time > ?')) {
      // params: [hallId, eventDate, endTime, startTime, excludeBookingId?]
      const [hallId, eventDate, endTime, startTime, excludeBookingId] = params;
      const hId = parseInt(hallId, 10);
      const exId = excludeBookingId ? parseInt(excludeBookingId, 10) : null;

      const conflict = bookingList.find(b => {
        if (b.hall_id !== hId) return false;
        if (b.event_date !== eventDate) return false;
        if (!['confirmed', 'pending'].includes(b.status)) return false;
        if (exId && b.id === exId) return false;

        // Overlap condition: start < targetEnd AND end > targetStart
        return b.start_time < endTime && b.end_time > startTime;
      });

      return conflict ? [conflict] : [];
    }

    // Active events right now
    if (sql.includes('b.start_time <= ?') && sql.includes('b.end_time > ?')) {
      const [todayDate, nowTime1, nowTime2] = params;
      return bookingList.filter(b => b.event_date === todayDate && b.status === 'confirmed' && b.start_time <= nowTime1 && b.end_time > nowTime2);
    }

    // Upcoming events today
    if (sql.includes('b.start_time > ?')) {
      const [todayDate, nowTime] = params;
      let list = bookingList.filter(b => b.event_date === todayDate && b.status === 'confirmed' && b.start_time > nowTime);
      list.sort((a, b) => a.start_time.localeCompare(b.start_time));
      return list;
    }

    // Dynamic Filter query for getBookings & Reports
    let filtered = bookingList;
    let paramIndex = 0;

    if (sql.includes('b.department_id = ?')) {
      const deptId = parseInt(params[paramIndex++], 10);
      filtered = filtered.filter(b => b.department_id === deptId);
    }
    if (sql.includes('b.event_date = ?')) {
      const eDate = params[paramIndex++];
      filtered = filtered.filter(b => b.event_date === eDate);
    }
    if (sql.includes('b.event_date >= ?')) {
      const sDate = params[paramIndex++];
      filtered = filtered.filter(b => b.event_date >= sDate);
    }
    if (sql.includes('b.event_date <= ?')) {
      const eDate = params[paramIndex++];
      filtered = filtered.filter(b => b.event_date <= eDate);
    }
    if (sql.includes('b.hall_id = ?')) {
      const hId = parseInt(params[paramIndex++], 10);
      filtered = filtered.filter(b => b.hall_id === hId);
    }
    if (sql.includes('b.status = ?')) {
      const stat = params[paramIndex++];
      filtered = filtered.filter(b => b.status === stat);
    }
    if (sql.includes('b.event_type = ?')) {
      const eType = params[paramIndex++];
      filtered = filtered.filter(b => b.event_type === eType);
    }
    if (sql.includes('b.event_name LIKE ?')) {
      const searchRaw = params[paramIndex] ? params[paramIndex].replace(/%/g, '').toLowerCase() : '';
      paramIndex += 4; // skip 4 params
      filtered = filtered.filter(b =>
        (b.event_name || '').toLowerCase().includes(searchRaw) ||
        (b.organizer_name || '').toLowerCase().includes(searchRaw) ||
        (b.department_name || '').toLowerCase().includes(searchRaw) ||
        (b.hall_name || '').toLowerCase().includes(searchRaw)
      );
    }

    // Sort order
    filtered.sort((a, b) => {
      if (a.event_date !== b.event_date) {
        return b.event_date.localeCompare(a.event_date);
      }
      return a.start_time.localeCompare(b.start_time);
    });

    return filtered;
  }

  get(...params) {
    const res = this.exec(params);
    return Array.isArray(res) ? (res.length > 0 ? res[0] : undefined) : res;
  }

  all(...params) {
    const res = this.exec(params);
    return Array.isArray(res) ? res : [];
  }

  run(...params) {
    return this.exec(params);
  }
}

const db = {
  prepare: (sql) => new PreparedStatement(sql),
  exec: (sql) => {
    // Basic table schema initialization dummy call
    return true;
  }
};

module.exports = db;
