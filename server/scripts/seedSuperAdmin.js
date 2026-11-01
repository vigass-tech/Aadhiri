const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Complaint = require('../src/models/Complaint');
const Budget = require('../src/models/Budget');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aadhirai';
    const safeUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`Connecting to MongoDB at ${safeUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding.');

    // 1. Seed Departments
    const initialDepartments = [
      {
        name: 'Public Works & Roads',
        code: 'PWD',
        description: 'Maintenance of city roads, bridges, storm water drains, and civic infrastructure.',
        head: 'Er. R. Sundaram, Chief Engineer',
        email: 'pwd@aadhirai.gov.in',
        phone: '+91 44 2859 1001',
        isActive: true
      },
      {
        name: 'Water Supply & Sewage',
        code: 'WSS',
        description: 'Drinking water distribution, pipeline maintenance, and underground sewage disposal.',
        head: 'Dr. M. Sangeetha, Director',
        email: 'water@aadhirai.gov.in',
        phone: '+91 44 2859 1002',
        isActive: true
      },
      {
        name: 'Electricity & Street Lighting',
        code: 'ELEC',
        description: 'Street light repair, electrical transformer maintenance, and public illumination.',
        head: 'Er. K. Natarajan, Executive Engineer',
        email: 'electricity@aadhirai.gov.in',
        phone: '+91 44 2859 1003',
        isActive: true
      },
      {
        name: 'Sanitation & Solid Waste',
        code: 'SAN',
        description: 'Daily municipal garbage collection, street sweeping, and dump yard maintenance.',
        head: 'Mrs. P. Revathi, Health Officer',
        email: 'sanitation@aadhirai.gov.in',
        phone: '+91 44 2859 1004',
        isActive: true
      },
      {
        name: 'Public Health & Welfare',
        code: 'HLTH',
        description: 'Vector control, epidemic prevention, public dispensaries, and hygiene inspection.',
        head: 'Dr. A. Murugan, Chief Medical Officer',
        email: 'health@aadhirai.gov.in',
        phone: '+91 44 2859 1005',
        isActive: true
      },
      {
        name: 'Revenue & Property Tax',
        code: 'REV',
        description: 'Property assessment, trade licenses, municipal tax disputes, and registry records.',
        head: 'Mr. V. Balasubramanian, Revenue Officer',
        email: 'revenue@aadhirai.gov.in',
        phone: '+91 44 2859 1006',
        isActive: true
      }
    ];

    const departmentDocs = {};
    for (const dept of initialDepartments) {
      let doc = await Department.findOne({ code: dept.code });
      if (!doc) {
        doc = await Department.create(dept);
        console.log(`+ Created Department: ${dept.name} (${dept.code})`);
      } else {
        console.log(`= Department exists: ${dept.code}`);
      }
      departmentDocs[dept.code] = doc;
    }

    // 2. Seed Users for each of the 4 roles
    // A. Super Admin
    let superAdmin = await User.findOne({ email: 'superadmin@aadhirai.gov.in' });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'Chief Commissioner (Super Admin)',
        email: 'superadmin@aadhirai.gov.in',
        phone: '9840112233',
        password: 'SuperAdmin@123',
        role: 'SUPER_ADMIN',
        address: 'Administrative Secretariat, Ezhilagam, Chennai',
        isActive: true
      });
      console.log('+ Created Super Admin: superadmin@aadhirai.gov.in / SuperAdmin@123');
    } else {
      console.log('= Super Admin account exists.');
    }

    // B. Admin
    let admin = await User.findOne({ email: 'admin@aadhirai.gov.in' });
    if (!admin) {
      admin = await User.create({
        name: 'Zonal Administrator Kumar',
        email: 'admin@aadhirai.gov.in',
        phone: '9840223344',
        password: 'Admin@123',
        role: 'ADMIN',
        department: departmentDocs['PWD']._id,
        assignedDepartments: [
          departmentDocs['PWD']._id,
          departmentDocs['WSS']._id,
          departmentDocs['SAN']._id
        ],
        designation: 'Zonal Municipal Officer',
        address: 'Zone 5 Zonal Office, Anna Nagar, Chennai',
        isActive: true
      });
      console.log('+ Created Admin: admin@aadhirai.gov.in / Admin@123');
    } else {
      console.log('= Admin account exists.');
    }

    // C. Reviewer
    let reviewer = await User.findOne({ email: 'reviewer@aadhirai.gov.in' });
    if (!reviewer) {
      reviewer = await User.create({
        name: 'Inspector Anandhi Devi',
        email: 'reviewer@aadhirai.gov.in',
        phone: '9840334455',
        password: 'Reviewer@123',
        role: 'REVIEWER',
        department: departmentDocs['PWD']._id,
        designation: 'Senior Field Investigation Inspector',
        address: 'Divisional Inspection Office, Guindy',
        isActive: true
      });
      console.log('+ Created Reviewer: reviewer@aadhirai.gov.in / Reviewer@123');
    } else {
      console.log('= Reviewer account exists.');
    }

    // D. Citizen
    let citizen = await User.findOne({ email: 'citizen@aadhirai.gov.in' });
    if (!citizen) {
      citizen = await User.create({
        name: 'Selvakumar Raman',
        email: 'citizen@aadhirai.gov.in',
        phone: '9840445566',
        password: 'Citizen@123',
        role: 'CITIZEN',
        address: '14/2, 3rd Cross Street, T. Nagar, Chennai - 600017',
        isActive: true
      });
      console.log('+ Created Citizen: citizen@aadhirai.gov.in / Citizen@123');
    } else {
      console.log('= Citizen account exists.');
    }

    // 3. Seed Sample Complaints if none exist
    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      console.log('Seeding initial complaints...');
      const sampleComplaints = [
        {
          ticketId: 'ADH-2026-101001',
          citizen: citizen._id,
          title: 'Deep Pothole and Broken Bitumen on Main Road',
          description:
            'A very hazardous 3-foot wide pothole has formed near the junction after recent rains. It poses extreme risk to two-wheelers especially during nighttime.',
          category: 'Roads & Infrastructure',
          department: departmentDocs['PWD']._id,
          assignedReviewer: reviewer._id,
          priority: 'HIGH',
          status: 'UNDER_REVIEW',
          location: 'Ward 112, Usman Road Junction, T. Nagar',
          address: 'Opposite GRT Jewellers, Usman Road',
          statusHistory: [
            {
              previousStatus: '',
              newStatus: 'SUBMITTED',
              updatedBy: citizen._id,
              userRole: 'CITIZEN',
              remarks: 'Complaint filed by citizen with location coordinates.',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
              previousStatus: 'SUBMITTED',
              newStatus: 'UNDER_REVIEW',
              updatedBy: admin._id,
              userRole: 'ADMIN',
              remarks: 'Assigned to Inspector Anandhi Devi for on-site inspection.',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
          ]
        },
        {
          ticketId: 'ADH-2026-101002',
          citizen: citizen._id,
          title: 'Severe Drinking Water Pipeline Leakage',
          description:
            'Drinking water pipe burst underground causing high water wastage on the pavement for the past 48 hours.',
          category: 'Water Supply',
          department: departmentDocs['WSS']._id,
          priority: 'URGENT',
          status: 'IN_PROGRESS',
          location: 'Ward 98, 2nd Avenue, Anna Nagar West',
          address: 'Near roundtana park gate',
          statusHistory: [
            {
              previousStatus: '',
              newStatus: 'SUBMITTED',
              updatedBy: citizen._id,
              userRole: 'CITIZEN',
              remarks: 'Emergency water leakage reported.',
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
            },
            {
              previousStatus: 'SUBMITTED',
              newStatus: 'IN_PROGRESS',
              updatedBy: admin._id,
              userRole: 'ADMIN',
              remarks: 'Repair squad deployed with emergency excavator crew.',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
          ]
        },
        {
          ticketId: 'ADH-2026-101003',
          citizen: citizen._id,
          title: 'Damaged Street Lamp with Exposed Wires',
          description:
            'Streetlight pole #42 is flickering constantly and electrical wire insulation is peeled, creating an electrocution hazard.',
          category: 'Electricity & Lighting',
          department: departmentDocs['ELEC']._id,
          priority: 'HIGH',
          status: 'RESOLVED',
          location: 'Ward 84, Kasturba Nagar, Adyar',
          address: 'Opposite Nilgiris Supermarket',
          resolutionRemarks: 'Pole repaired, wiring replaced with PVC conduit, tested OK.',
          statusHistory: [
            {
              previousStatus: '',
              newStatus: 'SUBMITTED',
              updatedBy: citizen._id,
              userRole: 'CITIZEN',
              remarks: 'Complaint registered.',
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            {
              previousStatus: 'SUBMITTED',
              newStatus: 'RESOLVED',
              updatedBy: admin._id,
              userRole: 'ADMIN',
              remarks: 'Repaired by electrical team. Tested and confirmed functioning.',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
          ]
        },
        {
          ticketId: 'ADH-2026-101004',
          citizen: citizen._id,
          title: 'Uncollected Municipal Garbage Dump on Pavement',
          description:
            'Solid municipal waste has accumulated for 3 days near community bin causing foul odor and stray cattle issue.',
          category: 'Sanitation & Waste',
          department: departmentDocs['SAN']._id,
          priority: 'MEDIUM',
          status: 'SUBMITTED',
          location: 'Ward 135, Alwarpet Street, Mylapore',
          address: 'Near Old Water Tank',
          statusHistory: [
            {
              previousStatus: '',
              newStatus: 'SUBMITTED',
              updatedBy: citizen._id,
              userRole: 'CITIZEN',
              remarks: 'Complaint registered by citizen.',
              timestamp: new Date()
            }
          ]
        }
      ];

      for (const comp of sampleComplaints) {
        await Complaint.create(comp);
      }
      console.log(`+ Seeded ${sampleComplaints.length} sample complaints.`);
    }

    // 4. Seed Sample Budgets if none exist
    const budgetCount = await Budget.countDocuments();
    if (budgetCount === 0) {
      console.log('Seeding initial departmental budgets...');
      const sampleBudgets = [
        {
          department: departmentDocs['PWD']._id,
          title: 'Monsoon Road Restoration & Patching Fund',
          financialYear: '2025-2026',
          allocatedAmount: 5000000,
          utilizedAmount: 1850000,
          description: 'Special budgetary allocation for resurfacing storm-damaged arterial roads.'
        },
        {
          department: departmentDocs['WSS']._id,
          title: 'Underground Pipeline Replacement Phase II',
          financialYear: '2025-2026',
          allocatedAmount: 4200000,
          utilizedAmount: 1200000,
          description: 'Replacement of corroded cast-iron drinking water pipes with high-density poly.'
        },
        {
          department: departmentDocs['ELEC']._id,
          title: 'Smart LED Street Light Transition Project',
          financialYear: '2025-2026',
          allocatedAmount: 3000000,
          utilizedAmount: 2400000,
          description: 'Conversion of high-pressure sodium street lamps to energy efficient smart LED.'
        },
        {
          department: departmentDocs['SAN']._id,
          title: 'Mechanized Sweeper Fleet & Waste Compactors',
          financialYear: '2025-2026',
          allocatedAmount: 3500000,
          utilizedAmount: 900000,
          description: 'Acquisition and fuel maintenance for hydraulic compactor trucks.'
        }
      ];

      for (const b of sampleBudgets) {
        await Budget.create(b);
      }
      console.log(`+ Seeded ${sampleBudgets.length} departmental budgets.`);
    }

    console.log('\n====================================================');
    console.log('  AADHIRAI SYSTEM SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('  Unified Login Credentials for Testing:');
    console.log('  1. Super Admin: superadmin@aadhirai.gov.in / SuperAdmin@123');
    console.log('  2. Admin:       admin@aadhirai.gov.in       / Admin@123');
    console.log('  3. Reviewer:    reviewer@aadhirai.gov.in    / Reviewer@123');
    console.log('  4. Citizen:     citizen@aadhirai.gov.in     / Citizen@123');
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();

