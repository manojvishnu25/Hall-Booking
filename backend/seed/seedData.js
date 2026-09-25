const db = require('../config/db');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Seed Admin
  const adminSalt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync('admin123', adminSalt);

  db.prepare('DELETE FROM admins').run();
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', adminPass);
  console.log('✅ Super Admin seeded: username "admin", password "admin123"');

  // 2. Seed Departments
  const deptSalt = bcrypt.genSaltSync(10);
  const deptPass = bcrypt.hashSync('dept123', deptSalt);

  const departmentsData = [
    { code: 'AIDS001', name: 'Department of Artificial Intelligence & Data Science' },
    { code: 'CSE001', name: 'Department of Computer Science & Engineering' },
    { code: 'ECE001', name: 'Department of Electronics & Communication Engineering' },
    { code: 'EEE001', name: 'Department of Electrical & Electronics Engineering' },
    { code: 'MECH001', name: 'Department of Mechanical Engineering' },
    { code: 'CIVIL001', name: 'Department of Civil Engineering' },
    { code: 'MBA001', name: 'Master of Business Administration' }
  ];

  db.prepare('DELETE FROM departments').run();
  const insertDept = db.prepare('INSERT INTO departments (department_code, department_name, password_hash, status) VALUES (?, ?, ?, ?)');

  departmentsData.forEach(d => {
    insertDept.run(d.code, d.name, deptPass, 'active');
  });
  console.log('✅ 7 Departments seeded (Password: "dept123")');

  // 3. Seed Halls
  const hallsData = [
    {
      code: 'AUDI01',
      name: 'Main Auditorium',
      type: 'Auditorium',
      capacity: 1000,
      location: 'Central Academic Complex - Ground Floor',
      facilities: 'Stage Lighting, 4K Projection System, Dolby Surround Sound, Central AC, VIP Lounge',
      status: 'active'
    },
    {
      code: 'SEM01',
      name: 'Seminar Hall 1',
      type: 'Seminar Hall',
      capacity: 200,
      location: 'Science & Technology Block - 1st Floor',
      facilities: 'Interactive Smart Board, Podium Mic, AC, Dual HD Displays',
      status: 'active'
    },
    {
      code: 'SEM02',
      name: 'Seminar Hall 2',
      type: 'Seminar Hall',
      capacity: 150,
      location: 'Science & Technology Block - 2nd Floor',
      facilities: 'High Def Projector, Wireless Audio, Air Conditioning',
      status: 'active'
    },
    {
      code: 'CONF01',
      name: 'Conference Hall 1',
      type: 'Conference Hall',
      capacity: 100,
      location: 'Administrative Block - 1st Floor',
      facilities: 'Executive Conference Table, Video Conferencing Rig, AC, Catering Counter',
      status: 'active'
    },
    {
      code: 'CONF02',
      name: 'Conference Hall 2',
      type: 'Conference Hall',
      capacity: 80,
      location: 'Administrative Block - 2nd Floor',
      facilities: 'Round Table Seating, Smart Display Panel, High-speed Wi-Fi, AC',
      status: 'active'
    }
  ];

  db.prepare('DELETE FROM halls').run();
  const insertHall = db.prepare('INSERT INTO halls (hall_code, hall_name, hall_type, capacity, location, facilities, status) VALUES (?, ?, ?, ?, ?, ?, ?)');

  hallsData.forEach(h => {
    insertHall.run(h.code, h.name, h.type, h.capacity, h.location, h.facilities, h.status);
  });
  console.log('✅ 5 College Halls seeded');

  // Fetch created IDs for seeding sample bookings
  const depts = db.prepare('SELECT id, department_code FROM departments').all();
  const deptMap = {};
  depts.forEach(d => { deptMap[d.department_code] = d.id; });

  const halls = db.prepare('SELECT id, hall_code FROM halls').all();
  const hallMap = {};
  halls.forEach(h => { hallMap[h.hall_code] = h.id; });

  // 4. Seed Realistic Sample Bookings with Designation
  db.prepare('DELETE FROM bookings').run();
  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      department_id, hall_id, event_name, description, event_type,
      event_date, start_time, end_time, participants,
      organizer_name, organizer_designation, organizer_contact, special_requirements, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const lastMonth = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const sampleBookings = [
    // Today's Events
    {
      dept: 'CSE001',
      hall: 'AUDI01',
      event: 'Annual International Technical Symposium 2026',
      desc: 'Flagship annual tech symposium featuring guest lectures from IEEE fellows and project exhibits.',
      type: 'Technical Event',
      date: today,
      start: '10:00',
      end: '17:00',
      participants: 650,
      organizer: 'Dr. R. Sharma',
      designation: 'Professor & Head (HOD)',
      contact: '+91 98765 43210',
      reqs: 'Stage podium, 4 wireless mics, refresh counters at lobby',
      status: 'confirmed'
    },
    {
      dept: 'AIDS001',
      hall: 'SEM01',
      event: 'Deep Learning & Generative AI Workshop',
      desc: 'Hands-on practical training on PyTorch, Large Language Models, and Vision Transformers.',
      type: 'Workshop',
      date: today,
      start: '09:30',
      end: '12:30',
      participants: 180,
      organizer: 'Prof. K. Anand',
      designation: 'Associate Professor',
      contact: '+91 98123 45678',
      reqs: 'High speed LAN ports for all student tables, projector test',
      status: 'confirmed'
    },
    {
      dept: 'MBA001',
      hall: 'SEM01',
      event: 'Corporate Leadership & Strategy Guest Lecture',
      desc: 'Interactive session with industry CEOs on modern agile management.',
      type: 'Guest Lecture',
      date: today,
      start: '14:00',
      end: '16:30',
      participants: 140,
      organizer: 'Mrs. V. Lakshmi',
      designation: 'Assistant Professor',
      contact: '+91 94444 12345',
      reqs: 'Bouquet, memento table, audio recording',
      status: 'confirmed'
    },
    {
      dept: 'ECE001',
      hall: 'CONF01',
      event: 'Departmental Academic Council & Curriculum Review',
      desc: 'Quarterly review meeting to finalize syllabus updates.',
      type: 'Meeting',
      date: today,
      start: '11:00',
      end: '13:00',
      participants: 35,
      organizer: 'Dr. S. Sundaram',
      designation: 'Professor',
      contact: '+91 99887 76655',
      reqs: 'Video conferencing TV on, tea & snacks at 11:30 AM',
      status: 'confirmed'
    },

    // Tomorrow & Upcoming Bookings
    {
      dept: 'MECH001',
      hall: 'AUDI01',
      event: 'Robotics & Automation Industry Expo',
      desc: 'Demonstration of industrial articulated robots and autonomous drones.',
      type: 'Workshop',
      date: tomorrow,
      start: '09:00',
      end: '16:00',
      participants: 500,
      organizer: 'Dr. P. Venkatesh',
      designation: 'Professor & Head (HOD)',
      contact: '+91 97766 55443',
      reqs: 'High power supply sockets, ramp access on stage',
      status: 'confirmed'
    },
    {
      dept: 'CIVIL001',
      hall: 'SEM02',
      event: 'Sustainable Infrastructure & Smart Cities Seminar',
      desc: 'Expert panel presentation on eco-friendly concrete and green building standards.',
      type: 'Seminar',
      date: tomorrow,
      start: '10:00',
      end: '13:00',
      participants: 110,
      organizer: 'Er. N. Ramesh',
      designation: 'Department Event Coordinator',
      contact: '+91 96655 44332',
      reqs: 'Projector and presenter pointer',
      status: 'confirmed'
    },
    {
      dept: 'EEE001',
      hall: 'CONF02',
      event: 'Faculty Development Programme on Smart Grids',
      desc: 'Weeklong FDP session focusing on renewable energy integration.',
      type: 'FDP',
      date: dayAfter,
      start: '10:00',
      end: '16:00',
      participants: 60,
      organizer: 'Dr. M. Karthik',
      designation: 'Associate Professor',
      contact: '+91 95544 33221',
      reqs: 'Whiteboard markers, lapel microphone',
      status: 'confirmed'
    },

    // Past / Finished Events
    {
      dept: 'CSE001',
      hall: 'CONF01',
      event: 'ACM Student Chapter Orientation & Hackathon Prep',
      desc: 'Welcoming first-year students to ACM chapter and briefing on upcoming national hackathon.',
      type: 'Meeting',
      date: yesterday,
      start: '14:00',
      end: '17:00',
      participants: 75,
      organizer: 'Prof. S. Meena',
      designation: 'Assistant Professor',
      contact: '+91 94433 22110',
      reqs: 'Sound system check and projector setup',
      status: 'confirmed'
    },
    {
      dept: 'AIDS001',
      hall: 'AUDI01',
      event: 'National Conference on Big Data Analytics & Cloud Systems',
      desc: 'Keynote lectures, research paper presentations, and industry panel discussions.',
      type: 'Conference',
      date: lastWeek,
      start: '09:00',
      end: '17:30',
      participants: 850,
      organizer: 'Dr. A. Ramanathan',
      designation: 'Professor & Head (HOD)',
      contact: '+91 98450 11223',
      reqs: 'Dual projection screens, catering for 900 guests',
      status: 'confirmed'
    },
    {
      dept: 'ECE001',
      hall: 'SEM01',
      event: 'VLSI Design & Embedded IoT Systems Seminar',
      desc: 'Special lecture on Cadence tools and System-on-Chip (SoC) architectures.',
      type: 'Seminar',
      date: lastWeek,
      start: '10:00',
      end: '13:00',
      participants: 160,
      organizer: 'Dr. T. Preetha',
      designation: 'Associate Professor',
      contact: '+91 97112 33445',
      reqs: 'Audio recording and wireless mic',
      status: 'confirmed'
    },
    {
      dept: 'MBA001',
      hall: 'CONF02',
      event: 'Annual Placement Training & Resume Building Session',
      desc: 'Special mock interview session with HR representatives from leading MNCs.',
      type: 'Workshop',
      date: lastMonth,
      start: '09:30',
      end: '16:30',
      participants: 75,
      organizer: 'Mr. G. Rajesh',
      designation: 'Placement In-Charge & Asst. Prof',
      contact: '+91 95000 66778',
      reqs: 'Round tables, presentation display panel',
      status: 'confirmed'
    }
  ];

  sampleBookings.forEach(b => {
    insertBooking.run(
      deptMap[b.dept],
      hallMap[b.hall],
      b.event,
      b.desc,
      b.type,
      b.date,
      b.start,
      b.end,
      b.participants,
      b.organizer,
      b.designation,
      b.contact,
      b.reqs,
      b.status
    );
  });

  console.log(`✅ ${sampleBookings.length} Sample bookings seeded with Organizer Designations!`);
  console.log('🎉 Database Seeding Complete successfully!\n');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
