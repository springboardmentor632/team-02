require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/user');
const Policy = require('./models/policy');
const Scheme = require('./models/scheme');
const EligibilityRule = require('./models/eligibilityRule');
const Notification = require('./models/notification');
const Feedback = require('./models/feedback');
const FAQ = require('./models/faq');
const { policies: policyPayloads, schemes: schemePayloads } = require('./seed-data-payloads');

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Policy.deleteMany({}),
    Scheme.deleteMany({}),
    EligibilityRule.deleteMany({}),
    Notification.deleteMany({}),
    Feedback.deleteMany({}),
    FAQ.deleteMany({}),
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
      title: 'Pradhan Mantri Fasal Bima Yojana',
      summary: 'Crop insurance support for farmers to cover losses from natural calamities, pests, and diseases.',
      content: 'PMFBY provides risk coverage from pre-sowing to post-harvest with low premiums and direct claim payment for crop loss. It is designed to protect farmers from climate shocks and encourage cultivation of high-yield crops.',
      category: 'Agriculture',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      department: 'Department of Agriculture',
      state: 'All India',
      status: 'Active',
      tags: ['Agriculture', 'Insurance', 'Farmers'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2016-02-18'),
    },
    {
      title: 'PM Awas Yojana — Gramin',
      summary: 'Affordable pucca housing for rural BPL households with financial and technical support.',
      content: 'PMAY-G provides financial assistance for construction of permanent houses to eligible rural families, linked with MGNREGS support and geo-tagged monitoring. It aims to provide dignified housing across villages.',
      category: 'Housing',
      ministry: 'Ministry of Rural Development',
      department: 'Department of Rural Development',
      state: 'All India',
      status: 'Active',
      tags: ['Housing', 'Rural', 'BPL'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2016-11-20'),
    },
    {
      title: 'National Policy for Women Empowerment',
      summary: 'Framework to advance women’s development, rights, and participation across sectors.',
      content: 'This policy focuses on gender equality through education, health, economic empowerment, legal rights, and safety. It supports SHGs, financial inclusion, and community action against violence.',
      category: 'Women & Child Welfare',
      ministry: 'Ministry of Women and Child Development',
      department: 'Department of Women Empowerment',
      state: 'All India',
      status: 'Active',
      tags: ['Women', 'Empowerment', 'Gender'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2022-03-08'),
    },
    {
      title: 'National Employment Policy 2025',
      summary: 'A strategy to generate 10 crore jobs through skilling, MSME growth, and labour reform.',
      content: 'The policy outlines support for skill development, formalization of informal labour, employer incentives, and targeted employment in sunrise sectors such as green energy and digital services.',
      category: 'Employment',
      ministry: 'Ministry of Labour and Employment',
      department: 'Directorate General of Employment',
      state: 'All India',
      status: 'Active',
      tags: ['Employment', 'Jobs', 'MSME'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2025-01-15'),
    },
    {
      title: 'National Green Hydrogen Mission',
      summary: 'A plan to make India a global green hydrogen producer and exporter by 2030.',
      content: 'This mission targets 5 MMT of green hydrogen annual production, incentives for electrolyzer manufacturing, and industry decarbonization in steel, chemicals, and shipping.',
      category: 'Environment',
      ministry: 'Ministry of New and Renewable Energy',
      department: 'Department of New and Renewable Energy',
      state: 'All India',
      status: 'Active',
      tags: ['Environment', 'Energy', 'Hydrogen'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2023-01-04'),
    },
    {
      title: 'National Broadband Mission',
      summary: 'Connect all gram panchayats with high-speed broadband by 2025.',
      content: 'The mission expands BharatNet, supports last-mile connectivity, and lowers broadband costs so rural and urban areas can access digital services reliably.',
      category: 'Digital Governance',
      ministry: 'Ministry of Communications',
      department: 'Department of Telecommunications',
      state: 'All India',
      status: 'Active',
      tags: ['Digital', 'Broadband', 'Connectivity'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2019-12-17'),
    },
    {
      title: 'Atal Pension Yojana',
      summary: 'Guaranteed pension for informal sector workers after age 60.',
      content: 'APY offers monthly pensions from ₹1,000 to ₹5,000 based on contribution levels, with government co-contribution for eligible subscribers.',
      category: 'Finance',
      ministry: 'Ministry of Finance',
      department: 'Pension Fund Regulatory and Development Authority',
      state: 'All India',
      status: 'Active',
      tags: ['Finance', 'Pension', 'Retirement'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2015-06-01'),
    },
    {
      title: 'Bharatmala Pariyojana',
      summary: 'National highways and freight corridor development to improve transport efficiency.',
      content: 'Bharatmala focuses on bridge construction, highway expansion, logistics parks, and road network modernization to lower freight costs and connect economic corridors.',
      category: 'Infrastructure',
      ministry: 'Ministry of Road Transport and Highways',
      department: 'Department of Road Transport and Highways',
      state: 'All India',
      status: 'Active',
      tags: ['Infrastructure', 'Transport', 'Roads'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2017-05-01'),
    },
    {
      title: 'Smart Cities Mission',
      summary: 'Develop 100 smart cities with modern urban infrastructure and digital services.',
      content: 'The mission upgrades urban utilities, mobility, waste management, and citizen services through IoT and digital governance solutions.',
      category: 'Infrastructure',
      ministry: 'Ministry of Housing and Urban Affairs',
      department: 'Urban Affairs',
      state: 'All India',
      status: 'Active',
      tags: ['Smart City', 'Urban', 'Infrastructure'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2015-06-25'),
    },
    {
      title: 'National Nutrition Mission',
      summary: 'Improve child and maternal nutrition through targeted interventions and community outreach.',
      content: 'The mission promotes balanced diets, breastfeeding, supplementary nutrition, and health monitoring to reduce stunting, wasting, and anemia among children and mothers.',
      category: 'Healthcare',
      ministry: 'Ministry of Health & Family Welfare',
      department: 'Department of Health and Family Welfare',
      state: 'All India',
      status: 'Active',
      tags: ['Healthcare', 'Nutrition', 'Child Health'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2018-03-08'),
    },
    {
      title: 'Rashtriya Krishi Vikas Yojana',
      summary: 'Agricultural development through state-specific investments, infrastructure and decentralised planning.',
      content: 'RKVY empowers states to strengthen farm productivity, irrigation, market linkages, and farmer incomes by funding local crop and livestock initiatives.',
      category: 'Agriculture',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      department: 'Department of Agriculture',
      state: 'All India',
      status: 'Active',
      tags: ['Agriculture', 'Farmers', 'Infrastructure'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2018-02-01'),
    },
    {
      title: 'National Rural Livelihood Mission',
      summary: 'Enable sustainable livelihood generation for rural poor through SHGs and financial services.',
      content: 'NRLM mobilizes rural women into self-help groups, provides training, credit access, and market linkages to increase household incomes and economic resilience.',
      category: 'Employment',
      ministry: 'Ministry of Rural Development',
      department: 'Department of Rural Development',
      state: 'All India',
      status: 'Active',
      tags: ['Employment', 'Rural', 'Women'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2011-06-03'),
    },
    {
      title: 'National Clean Air Programme',
      summary: 'Reduce air pollution in key cities through source-based interventions and monitoring.',
      content: 'NCAP sets city-specific targets for particulate matter reduction, promotes clean fuels, and supports pollution monitoring networks and public awareness campaigns.',
      category: 'Environment',
      ministry: 'Ministry of Environment, Forest and Climate Change',
      department: 'Department of Environment, Forest and Climate Change',
      state: 'All India',
      status: 'Active',
      tags: ['Environment', 'Air Quality', 'Health'],
      author: official._id,
      approvedBy: admin._id,
      publishedAt: new Date('2019-01-10'),
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
      category: 'scheme_update',
      targetRoles: ['Citizen'],
      link: '/citizen/eligibility',
    },
    {
      title: 'New Healthcare Policies Added',
      message: '3 new health policies have been published on the platform.',
      type: 'success',
      category: 'policy_alert',
      targetRoles: ['Citizen', 'Researcher'],
      link: '/citizen/search',
    },
    {
      title: 'NSP Application Deadline',
      message: 'National Scholarship Portal applications close tonight at 11:59 PM.',
      type: 'danger',
      category: 'deadline_reminder',
      targetRoles: ['Citizen'],
      link: '/citizen/search',
    },
    {
      title: 'Policy Review Required',
      message: 'Solar Rooftop Scheme is pending approval.',
      type: 'info',
      category: 'policy_alert',
      targetRoles: ['Administrator', 'Government Official'],
      link: '/admin/policies',
    },
  ]);

  await FAQ.insertMany([
    {
      question: 'How do I check my scheme eligibility?',
      answer: 'Go to the Eligibility Checker page and fill in your personal, financial, and location details to see matching schemes.',
      category: 'Healthcare',
      targetRole: 'All',
      helpfulCount: 42,
      unhelpfulCount: 2,
      isPublished: true,
      askedByName: 'Rahul Sharma',
      askedByRole: 'Citizen',
      createdBy: citizen._id,
      messages: [
        { sender: citizen._id, senderName: 'Rahul Sharma', senderRole: 'Citizen', message: 'How do I check my scheme eligibility?' },
        { sender: official._id, senderName: 'Govt Official', senderRole: 'Government Official', message: 'Go to the Eligibility Checker page and fill in your personal, financial, and location details to see matching schemes.' }
      ]
    },
    {
      question: 'What documents are mandatory for PM-JAY hospital treatment?',
      answer: 'You require your Aadhaar Card, SECC Ration Card/Letter, and PM-JAY Golden Card at any empanelled hospital.',
      category: 'Healthcare',
      targetRole: 'Citizen',
      helpfulCount: 38,
      unhelpfulCount: 1,
      isPublished: true,
      askedByName: 'Priya Singh',
      askedByRole: 'Citizen',
      createdBy: citizen._id,
      messages: [
        { sender: citizen._id, senderName: 'Priya Singh', senderRole: 'Citizen', message: 'What documents are mandatory for PM-JAY hospital treatment?' },
        { sender: admin._id, senderName: 'Admin User', senderRole: 'Administrator', message: 'You require your Aadhaar Card, SECC Ration Card/Letter, and PM-JAY Golden Card at any empanelled hospital.' }
      ]
    },
    {
      question: 'How long does it take to hear back on support feedback?',
      answer: 'Our government support desk typically reviews and responds to feedback tickets within 3 to 24 hours.',
      category: 'General',
      targetRole: 'All',
      helpfulCount: 29,
      unhelpfulCount: 0,
      isPublished: true,
      askedByName: 'Anil Kumar',
      askedByRole: 'Organization',
      createdBy: citizen._id,
      messages: [
        { sender: citizen._id, senderName: 'Anil Kumar', senderRole: 'Organization', message: 'How long does it take to hear back on support feedback?' },
        { sender: admin._id, senderName: 'Admin User', senderRole: 'Administrator', message: 'Our government support desk typically reviews and responds to feedback tickets within 3 to 24 hours.' }
      ]
    },
    {
      question: 'Can I track my scheme application status online?',
      answer: 'Yes, your application status updates appear in real-time under My Applications and Notifications on your Citizen Dashboard.',
      category: 'Agriculture',
      targetRole: 'Citizen',
      helpfulCount: 56,
      unhelpfulCount: 3,
      isPublished: true,
      askedByName: 'Rahul Sharma',
      askedByRole: 'Citizen',
      createdBy: citizen._id,
      messages: [
        { sender: citizen._id, senderName: 'Rahul Sharma', senderRole: 'Citizen', message: 'Can I track my scheme application status online?' },
        { sender: official._id, senderName: 'Govt Official', senderRole: 'Government Official', message: 'Yes, your application status updates appear in real-time under My Applications and Notifications on your Citizen Dashboard.' }
      ]
    },
    {
      question: 'How can government officers publish or update a policy?',
      answer: 'Government Officers can create policy drafts in the Policy Management tab, which are submitted to Administrators for approval and publication.',
      category: 'Technical Support',
      targetRole: 'Government Official',
      helpfulCount: 19,
      unhelpfulCount: 0,
      isPublished: true,
      askedByName: 'Govt Official',
      askedByRole: 'Government Official',
      createdBy: official._id,
      messages: [
        { sender: official._id, senderName: 'Govt Official', senderRole: 'Government Official', message: 'How can government officers publish or update a policy?' },
        { sender: admin._id, senderName: 'Admin User', senderRole: 'Administrator', message: 'Government Officers can create policy drafts in the Policy Management tab, which are submitted to Administrators for approval and publication.' }
      ]
    }
  ]);

  await Feedback.insertMany([
    // (i) Citizen Feedback
    {
      ticketId: 'FB-1001',
      moduleType: 'Citizen Feedback',
      user: citizen._id,
      userRole: 'Citizen',
      name: 'Rahul Sharma',
      email: 'citizen@example.com',
      subject: 'Excellent portal experience for Ayushman Bharat',
      message: 'The scheme filtering and eligibility checker saved me hours. Very smooth experience and clear breakdown of benefits.',
      category: 'General Feedback',
      priority: 'Low',
      rating: 5,
      department: 'Ministry of Health',
      status: 'Resolved',
      assignedTo: official._id,
      response: 'Thank you for your feedback! We are constantly working to improve citizen access to healthcare benefits.',
      respondedBy: official._id,
      respondedAt: new Date(),
      resolutionTimeHours: 1.5,
      messages: [
        { sender: citizen._id, senderName: 'Rahul Sharma', senderRole: 'Citizen', message: 'The scheme filtering saved me hours. Very smooth experience.' },
        { sender: official._id, senderName: 'Govt Official', senderRole: 'Government Official', message: 'Thank you for your feedback! We are glad the tool helped you.' }
      ]
    },
    {
      ticketId: 'FB-1002',
      moduleType: 'Citizen Feedback',
      user: citizen._id,
      userRole: 'Citizen',
      name: 'Priya Singh',
      email: 'priya.research@institute.org',
      subject: 'Suggestion for adding regional language support',
      message: 'Adding Hindi and Tamil translation options on policy documents would greatly help rural applicants.',
      category: 'General Feedback',
      priority: 'Medium',
      rating: 4,
      department: 'IT Support Desk',
      status: 'In Progress',
      assignedTo: official._id,
      messages: [
        { sender: citizen._id, senderName: 'Priya Singh', senderRole: 'Researcher', message: 'Adding Hindi and Tamil translation options on policy documents would greatly help rural applicants.' }
      ]
    },

    // (ii) Issue Reporting
    {
      ticketId: 'ISS-2001',
      moduleType: 'Issue Reporting',
      user: citizen._id,
      userRole: 'Citizen',
      name: 'Rahul Sharma',
      email: 'citizen@example.com',
      subject: 'PDF download button unresponsive on Chrome Mobile',
      message: 'When clicking Download Summary PDF on mobile Chrome version 124, the loading spinner hangs.',
      category: 'System Bug',
      priority: 'High',
      rating: 3,
      department: 'IT Support Desk',
      status: 'In Progress',
      assignedTo: official._id,
      messages: [
        { sender: citizen._id, senderName: 'Rahul Sharma', senderRole: 'Citizen', message: 'When clicking Download Summary PDF on mobile Chrome, the loading spinner hangs.' },
        { sender: official._id, senderName: 'Govt Official', senderRole: 'Government Official', message: 'Our IT team is looking into the mobile PDF renderer. Fix scheduled for deployment.' }
      ]
    },
    {
      ticketId: 'ISS-2002',
      moduleType: 'Issue Reporting',
      user: citizen._id,
      userRole: 'Organization',
      name: 'Anil Kumar',
      email: 'ngo.contact@ruraldev.org',
      subject: 'Eligibility calculator mismatch for agricultural income',
      message: 'PM-Kisan rule checking shows ineligible when income is exactly ₹2.5L per annum.',
      category: 'Eligibility Calculation Issue',
      priority: 'Critical',
      rating: 2,
      department: 'Department of Agriculture',
      status: 'Resolved',
      assignedTo: official._id,
      response: 'Resolved. Eligibility threshold logic updated to inclusive boundary check (<= 2,50,000).',
      respondedBy: official._id,
      respondedAt: new Date(),
      resolutionTimeHours: 3.2,
      messages: [
        { sender: citizen._id, senderName: 'Anil Kumar', senderRole: 'Organization', message: 'PM-Kisan rule checking shows ineligible when income is exactly ₹2.5L per annum.' },
        { sender: official._id, senderName: 'Govt Official', senderRole: 'Government Official', message: 'Resolved. Eligibility threshold logic updated.' }
      ]
    },

    // (iii) Help Desk
    {
      ticketId: 'HD-3001',
      moduleType: 'Help Desk',
      user: citizen._id,
      userRole: 'Citizen',
      name: 'Rahul Sharma',
      email: 'citizen@example.com',
      subject: 'Help required with NSP Scholarship document verification',
      message: 'My mark sheet upload failed with error code ERR-DOC-404. Can support team verify my draft application?',
      category: 'Application Assistance',
      priority: 'High',
      rating: 4,
      department: 'Ministry of Education',
      status: 'In Progress',
      assignedTo: official._id,
      messages: [
        { sender: citizen._id, senderName: 'Rahul Sharma', senderRole: 'Citizen', message: 'My mark sheet upload failed with error code ERR-DOC-404.' },
        { sender: official._id, senderName: 'Govt Official', senderRole: 'Government Official', message: 'Please ensure your uploaded PDF is under 2MB. We have unlocked your draft so you can re-upload.' }
      ]
    },

    // (iv) FAQ Management item placeholder
    {
      ticketId: 'FAQ-4001',
      moduleType: 'FAQ Management',
      user: admin._id,
      userRole: 'Administrator',
      name: 'Admin User',
      email: 'admin@policygpt.gov.in',
      subject: 'FAQ Audit & Standard Guidelines 2026',
      message: 'Verified 5 core public FAQs for healthcare, agriculture, and technical eligibility.',
      category: 'General',
      priority: 'Low',
      rating: 5,
      department: 'IT Support Desk',
      status: 'Resolved',
      assignedTo: admin._id,
      response: 'All public FAQs updated and verified for 2026 compliance.',
      respondedBy: admin._id,
      respondedAt: new Date(),
      resolutionTimeHours: 0.8
    },

    // (v) Query Resolution
    {
      ticketId: 'QR-5001',
      moduleType: 'Query Resolution',
      user: citizen._id,
      userRole: 'Citizen',
      name: 'Rahul Sharma',
      email: 'citizen@example.com',
      subject: 'Is tenant farmer eligible under PM Kisan Samman Nidhi?',
      message: 'Does PM-Kisan cover tenant farmers without land ownership title in SECC database?',
      category: 'Policy Question',
      priority: 'Medium',
      rating: 5,
      department: 'Department of Agriculture',
      status: 'Resolved',
      assignedTo: official._id,
      response: 'PM-Kisan scheme requires landholding ownership title in the revenue records of the state/UT. Pure tenant farmers without title are covered under state-specific tenant welfare schemes.',
      respondedBy: official._id,
      respondedAt: new Date(),
      resolutionTimeHours: 2.1,
      messages: [
        { sender: citizen._id, senderName: 'Rahul Sharma', senderRole: 'Citizen', message: 'Does PM-Kisan cover tenant farmers without land title?' },
        { sender: official._id, senderName: 'Govt Official', senderRole: 'Government Official', message: 'PM-Kisan scheme requires landholding ownership title in revenue records.' }
      ]
    },

    // (vi) Contact Support
    {
      ticketId: 'CS-6001',
      moduleType: 'Contact Support',
      user: citizen._id,
      userRole: 'Citizen',
      name: 'Rahul Sharma',
      email: 'citizen@example.com',
      subject: 'Direct support callback request for Ayushman Bharat Card',
      message: 'Requesting phone callback regarding golden card registration at district empanelled hospital.',
      category: 'Contact Helpline',
      priority: 'High',
      rating: 5,
      department: 'Ministry of Health',
      status: 'Resolved',
      assignedTo: official._id,
      response: 'Support representative contacted citizen via phone at 9876543210 and guided to nearest CSC center.',
      respondedBy: official._id,
      respondedAt: new Date(),
      resolutionTimeHours: 1.2,
      messages: [
        { sender: citizen._id, senderName: 'Rahul Sharma', senderRole: 'Citizen', message: 'Requesting phone callback regarding golden card registration.' },
        { sender: official._id, senderName: 'Govt Official', senderRole: 'Government Official', message: 'Official callback completed successfully.' }
      ]
    }
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
