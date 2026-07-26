require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/user');
const Policy = require('./models/policy');
const Scheme = require('./models/scheme');
const EligibilityRule = require('./models/eligibilityRule');
const Notification = require('./models/notification');

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Policy.deleteMany({}),
    Scheme.deleteMany({}),
    EligibilityRule.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const password = await bcrypt.hash('Password123', 10);

  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@policygpt.gov.in',
    password,
    role: 'Administrator',
  });

  const official = await User.create({
    firstName: 'Govt',
    lastName: 'Official',
    email: 'official@policygpt.gov.in',
    password,
    role: 'Government Official',
    organization: 'Ministry of Health',
  });

  const citizen = await User.create({
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'citizen@example.com',
    password,
    role: 'Citizen',
    phone: '9876543210',
  });

  const policies = await Policy.insertMany([
    {
      title: 'Ayushman Bharat PM-JAY',
      summary: 'Health cover of ₹5 lakh per family per year for secondary and tertiary hospitalisation.',
      content: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana provides cashless treatment at empanelled hospitals across India for eligible families identified under SECC 2011.',
      category: 'Healthcare',
      ministry: 'Ministry of Health & Family Welfare',
      department: 'National Health Authority',
      state: 'All India',
      status: 'Active',
      tags: ['Healthcare', 'Insurance', 'BPL Families'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2018-09-23'),
    },
    {
      title: 'Digital India Initiative',
      summary: 'Transform India into a digitally empowered society and knowledge economy.',
      content: 'Digital India aims to ensure government services are made available to citizens electronically by improving online infrastructure and increasing Internet connectivity.',
      category: 'Digital Governance',
      ministry: 'Ministry of Electronics & IT',
      department: 'MeitY',
      state: 'All India',
      status: 'Active',
      tags: ['Digital', 'Governance', 'Technology'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2015-07-01'),
    },
    {
      title: 'National Education Policy 2020',
      summary: 'Comprehensive framework for education transformation from school to higher education.',
      content: 'NEP 2020 replaces the previous National Policy on Education, 1986. It aims to universalize education from pre-school to secondary level with 100% GER by 2030.',
      category: 'Education',
      ministry: 'Ministry of Education',
      department: 'Department of School Education',
      state: 'All India',
      status: 'Active',
      tags: ['Education', 'Reform', 'Students'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2020-07-29'),
    },
    {
      title: 'Solar Rooftop Scheme',
      summary: 'Promote grid-connected solar rooftop systems on residential and commercial buildings.',
      content: 'The scheme provides central financial assistance for installation of rooftop solar plants to reduce carbon footprint and electricity bills.',
      category: 'Environment',
      ministry: 'Ministry of New and Renewable Energy',
      department: 'MNRE',
      state: 'All India',
      status: 'Pending',
      tags: ['Solar', 'Renewable', 'Environment'],
      author: official._id,
      publishedAt: new Date('2024-01-15'),
    },
    {
      title: 'Skill India Mission',
      summary: 'Train over 40 crore people in India in different skills by 2022.',
      content: 'Skill India focuses on skill development and entrepreneurship to create a skilled workforce aligned with industry needs.',
      category: 'Employment',
      ministry: 'Ministry of Skill Development',
      department: 'MSDE',
      state: 'All India',
      status: 'Draft',
      tags: ['Employment', 'Skills', 'Training'],
      author: official._id,
      publishedAt: new Date('2025-06-01'),
    },
  ]);

  const schemes = await Scheme.insertMany([
    {
      name: 'PM Kisan Samman Nidhi',
      summary: 'Income support of ₹6,000 per year to all landholding farmer families.',
      details: 'PM-KISAN provides financial assistance in three equal installments of ₹2,000 every four months directly into beneficiaries bank accounts.',
      category: 'Farmer Welfare',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      department: 'Department of Agriculture',
      state: 'All India',
      eligibilityCriteria: ['All landholding farmer families', 'Cultivable land in their name', 'Not institutional landholders or income tax payers'],
      benefits: ['₹6,000 per year in 3 installments', 'Direct Benefit Transfer', 'No middlemen'],
      applicationMode: 'Online / PM Kisan Portal',
      launchDate: new Date('2019-02-24'),
      status: 'Active',
      tags: ['Farmer', 'Agriculture', 'Income Support'],
      author: official._id,
      approvedBy: admin._id,
    },
    {
      name: 'Ayushman Bharat PM-JAY',
      summary: 'Health insurance cover up to ₹5 lakh per family per year.',
      details: 'Covers secondary and tertiary care hospitalisation for over 10 crore poor and vulnerable families at empanelled hospitals.',
      category: 'Healthcare',
      ministry: 'Ministry of Health & Family Welfare',
      department: 'National Health Authority',
      state: 'All India',
      eligibilityCriteria: ['Families in SECC 2011 database', 'Deprived and occupational criteria families', 'No premium payment required'],
      benefits: ['₹5 lakh annual cover', 'Cashless treatment', '1,929 treatment packages'],
      applicationMode: 'Online / Hospital / CSC',
      launchDate: new Date('2018-09-23'),
      status: 'Active',
      tags: ['Healthcare', 'Insurance'],
      author: official._id,
      approvedBy: admin._id,
    },
    {
      name: 'PM Awas Yojana — Urban',
      summary: 'Housing for All in urban areas with credit-linked subsidy.',
      details: 'Provides affordable housing to urban poor including EWS, LIG and MIG categories with interest subsidy on home loans.',
      category: 'Housing',
      ministry: 'Ministry of Housing & Urban Affairs',
      department: 'HUA',
      state: 'All India',
      eligibilityCriteria: ['EWS/LIG/MIG categories', 'No pucca house in name', 'Annual income below ₹18 lakh'],
      benefits: ['Up to ₹2.67 lakh subsidy', 'Affordable housing', 'Credit-linked subsidy'],
      applicationMode: 'Online / CSC',
      launchDate: new Date('2015-06-25'),
      status: 'Active',
      tags: ['Housing', 'Urban', 'Subsidy'],
      author: official._id,
      approvedBy: admin._id,
    },
    {
      name: 'National Scholarship Portal',
      summary: 'One-stop platform for various government scholarship schemes for students.',
      details: 'Centralized portal for pre-matric, post-matric and merit-cum-means scholarships for SC, ST, OBC and minority students.',
      category: 'Scholarships',
      ministry: 'Ministry of Education',
      department: 'Department of Higher Education',
      state: 'All India',
      eligibilityCriteria: ['Indian students', 'Enrolled in recognized institutions', 'Category and income criteria vary by scheme'],
      benefits: ['Up to ₹12,000/year scholarship', 'Direct bank transfer', 'Multiple scheme options'],
      applicationMode: 'Online / scholarships.gov.in',
      launchDate: new Date('2015-08-01'),
      status: 'Active',
      tags: ['Education', 'Scholarship', 'Students'],
      author: official._id,
      approvedBy: admin._id,
    },
    {
      name: 'Stand Up India',
      summary: 'Bank loans between ₹10 lakh and ₹1 crore for SC/ST and women entrepreneurs.',
      details: 'Facilitates bank loans for greenfield enterprises in manufacturing, services or trading sectors by SC/ST and women borrowers.',
      category: 'Business Support',
      ministry: 'Ministry of Finance',
      department: 'Department of Financial Services',
      state: 'All India',
      eligibilityCriteria: ['SC/ST or Women entrepreneur', 'Above 18 years', 'Greenfield enterprise only'],
      benefits: ['₹10L - ₹1Cr loan', 'Composite loan', 'Handholding support'],
      applicationMode: 'Online / Bank Branch',
      launchDate: new Date('2016-04-05'),
      status: 'Draft',
      tags: ['Business', 'Entrepreneurship', 'Women'],
      author: official._id,
    },
    {
      name: 'MGNREGA',
      summary: '100 days of guaranteed wage employment in a financial year for rural households.',
      details: 'Mahatma Gandhi National Rural Employment Guarantee Act provides legal guarantee for at least 100 days of wage employment.',
      category: 'Employment Programs',
      ministry: 'Ministry of Rural Development',
      department: 'Department of Rural Development',
      state: 'All India',
      eligibilityCriteria: ['Adult members of rural households', 'Willing to do unskilled manual work', 'Job card registration required'],
      benefits: ['100 days guaranteed work', 'Minimum wage payment', 'Asset creation in villages'],
      applicationMode: 'Gram Panchayat / Online',
      launchDate: new Date('2006-02-02'),
      status: 'Active',
      tags: ['Employment', 'Rural', 'Wages'],
      author: official._id,
      approvedBy: admin._id,
    },
  ]);

  await EligibilityRule.insertMany([
    {
      scheme: schemes[0]._id,
      ageRange: { min: 18, max: 100 },
      gender: 'Any',
      incomeLimit: 'Any',
      occupation: 'Farmer',
      education: 'Any',
      location: 'Any',
      socialCategory: 'Any',
      disabilityStatus: 'Any',
    },
    {
      scheme: schemes[1]._id,
      ageRange: { min: 0, max: 100 },
      gender: 'Any',
      incomeLimit: '250000',
      occupation: 'Any',
      education: 'Any',
      location: 'Any',
      socialCategory: 'Any',
      disabilityStatus: 'Any',
    },
    {
      scheme: schemes[2]._id,
      ageRange: { min: 18, max: 70 },
      gender: 'Any',
      incomeLimit: '300000',
      occupation: 'Any',
      education: 'Any',
      location: 'Any',
      socialCategory: 'Any',
      disabilityStatus: 'Any',
    },
    {
      scheme: schemes[3]._id,
      ageRange: { min: 5, max: 30 },
      gender: 'Any',
      incomeLimit: '250000',
      occupation: 'Student',
      education: '10th Pass',
      location: 'Any',
      socialCategory: 'Any',
      disabilityStatus: 'Any',
    },
    {
      scheme: schemes[5]._id,
      ageRange: { min: 18, max: 65 },
      gender: 'Any',
      incomeLimit: 'Any',
      occupation: 'Any',
      education: 'Any',
      location: 'Rural',
      socialCategory: 'Any',
      disabilityStatus: 'Any',
    },
  ]);

  await Notification.insertMany([
    {
      title: 'PM Kisan Installment Due',
      message: 'Next PM Kisan installment will be credited in 5 days. Ensure your bank details are updated.',
      type: 'warning',
      category: 'Scheme Update',
      targetRoles: ['Citizen'],
    },
    {
      title: 'New Healthcare Policies Added',
      message: '3 new health policies have been published on the platform.',
      type: 'success',
      category: 'New Policy',
      targetRoles: ['Citizen', 'Researcher'],
    },
    {
      title: 'NSP Application Deadline',
      message: 'National Scholarship Portal applications close tonight at 11:59 PM.',
      type: 'danger',
      category: 'Deadline',
      targetRoles: ['Citizen'],
    },
    {
      title: 'Policy Review Required',
      message: 'Solar Rooftop Scheme is pending approval.',
      type: 'info',
      category: 'Policy Update',
      targetRoles: ['Administrator', 'Government Official'],
    },
  ]);

  console.log('Seed completed successfully!');
  console.log('Test accounts (password: Password123):');
  console.log('  Admin:    admin@policygpt.gov.in');
  console.log('  Official: official@policygpt.gov.in');
  console.log('  Citizen:  citizen@example.com');
  console.log(`  Policies: ${policies.length}, Schemes: ${schemes.length}`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
