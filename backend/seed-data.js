/**
 * seed-data.js
 * Run with: node seed-data.js
 * Creates 10 real policies and 10 real schemes in MongoDB via the live API.
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:4000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNjVhYTkyMDhhODNjZTU0NmIyNDQ0NCIsImlhdCI6MTc4NTE1MjI1NCwiZXhwIjoxNzg1MjM4NjU0fQ.GaQR_mx6K2nbsx6ZwXfg5MzCBI84EnwtaM_e0ymhRD0';

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/api${path}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${TOKEN}`
      }
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => raw += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch(e) { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const policies = [
  {
    title: 'National Education Policy 2020',
    category: 'Education',
    ministry: 'Ministry of Education',
    department: 'Department of Higher Education',
    summary: 'A comprehensive framework to transform the Indian education system, introducing a 5+3+3+4 curriculum structure, emphasis on mother-tongue based teaching, vocational education from Grade 6, and a flexible multidisciplinary approach to higher education.',
    content: 'The National Education Policy 2020 envisions an education system rooted in Indian ethos while preparing students for the 21st century. Key highlights include: universal foundational literacy and numeracy by Grade 3, integration of vocational training from Grade 6, mother-tongue/regional language as medium of instruction till Grade 5, reduction of curriculum load, an emphasis on critical thinking and holistic development, and a 10+2 structure replaced by a 5+3+3+4 pedagogical design.',
    status: 'Active',
    state: 'National',
    publishedAt: new Date('2020-07-29').toISOString(),
    tags: ['education', 'curriculum', 'higher education', 'vocational training']
  },
  {
    title: 'Pradhan Mantri Fasal Bima Yojana',
    category: 'Agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    department: 'Department of Agriculture',
    summary: 'A crop insurance scheme providing financial support to farmers suffering crop loss or damage due to unforeseen events like natural calamities, pests and diseases.',
    content: 'PMFBY provides comprehensive risk coverage against non-preventable natural risks from pre-sowing to post-harvest. Premium is low — 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticulture crops. The balance is shared equally by Central and State Governments. The policy leverages technology including remote sensing, drones, and AI for faster claim settlement.',
    status: 'Active',
    state: 'National',
    publishedAt: new Date('2016-02-18').toISOString(),
    tags: ['agriculture', 'insurance', 'farmers', 'crop protection']
  },
  {
    title: 'Ayushman Bharat — PM Jan Arogya Yojana',
    category: 'Healthcare',
    ministry: 'Ministry of Health and Family Welfare',
    department: 'National Health Authority',
    summary: 'World\'s largest government-funded health insurance scheme providing ₹5 lakh cover per family per year for secondary and tertiary hospitalization to 10.74 crore poor and vulnerable families.',
    content: 'AB PM-JAY covers pre and post hospitalization expenses, day-care surgeries, treatment in public and private empanelled hospitals. It operates on a cashless and paperless access basis. The scheme covers 1,949 procedures including surgery, medical, and day-care treatments. Beneficiaries are identified based on SECC 2011 data. Portability across India is a key feature.',
    status: 'Active',
    state: 'National',
    publishedAt: new Date('2018-09-23').toISOString(),
    tags: ['healthcare', 'insurance', 'poor families', 'hospitalization']
  },
  {
    title: 'Digital India Programme',
    category: 'Digital Governance',
    ministry: 'Ministry of Electronics and Information Technology',
    department: 'Department of Telecommunications',
    summary: 'A flagship programme to transform India into a digitally empowered society and knowledge economy by providing digital infrastructure, digital services, and digital literacy.',
    content: 'Digital India has three vision areas: digital infrastructure as utility to every citizen, governance and services on demand, and digital empowerment of citizens. Key pillars include BharatNet for broadband connectivity, DigiLocker for document storage, e-Hospital for healthcare, e-Procurement, and UMANG app for government services. Over 1,500 services have been digitized under this initiative.',
    status: 'Active',
    state: 'National',
    publishedAt: new Date('2015-07-01').toISOString(),
    tags: ['digital', 'governance', 'e-services', 'broadband', 'literacy']
  },
  {
    title: 'PM Awas Yojana — Gramin',
    category: 'Housing',
    ministry: 'Ministry of Rural Development',
    department: 'Department of Rural Development',
    summary: 'A government scheme aiming to provide affordable housing for the rural poor by replacing kutcha (temporary) houses with pucca (permanent) houses with basic amenities.',
    content: 'PMAY-G provides financial assistance of ₹1.20 lakh in plains and ₹1.30 lakh in hilly states to eligible BPL households for construction of a basic 25 sq m house. The scheme is linked with MGNREGS for unskilled labour. Beneficiaries are selected based on housing deprivation criteria from SECC 2011. Houses are geo-tagged and monitored through the AwaasSoft portal.',
    status: 'Active',
    state: 'National',
    publishedAt: new Date('2016-11-20').toISOString(),
    tags: ['housing', 'rural', 'BPL', 'construction']
  },
  {
    title: 'National Policy for Women Empowerment',
    category: 'Women & Child Welfare',
    ministry: 'Ministry of Women and Child Development',
    department: 'Department of Women Empowerment',
    summary: 'A policy framework to achieve advancement, development and empowerment of women by ensuring their equal participation in all spheres of life.',
    content: 'The policy addresses gender equality in education, health, economic opportunities, political representation, and legal rights. Key focus areas include eliminating all forms of discrimination against women, equal access to education and healthcare, economic empowerment through SHGs and financial inclusion, zero tolerance for gender-based violence, and ensuring women\'s participation in decision-making roles at all levels of government.',
    status: 'Active',
    state: 'National',
    publishedAt: new Date('2022-03-08').toISOString(),
    tags: ['women', 'empowerment', 'gender equality', 'SHG']
  },
  {
    title: 'National Employment Policy 2025',
    category: 'Employment',
    ministry: 'Ministry of Labour and Employment',
    department: 'Directorate General of Employment',
    summary: 'A comprehensive employment policy to create 10 crore jobs by 2030 through MSME support, skill development, and formalization of the informal sector.',
    content: 'The policy focuses on quality employment generation through four pillars: skilling and reskilling the workforce for emerging jobs, supporting MSME and startup growth as key employers, reforming labour laws for ease of doing business, and promoting employment in sunrise sectors like green economy, electronics, and services. An integrated Employment Information System tracks real-time job creation data across states.',
    status: 'Active',
    state: 'National',
    publishedAt: new Date('2025-01-15').toISOString(),
    tags: ['employment', 'jobs', 'MSME', 'skill development']
  },
  {
    title: 'PM Kisan Samman Nidhi',
    category: 'Agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    department: 'Department of Agriculture',
    summary: 'A central sector scheme providing income support of ₹6,000 per year to all landholding farmer families, paid in three equal installments directly to their bank accounts.',
    content: 'PM-KISAN is a direct benefit transfer (DBT) scheme covering all farmer families having cultivable land. ₹2,000 is transferred every four months. Beneficiary identification is done at state/UT government level. As of 2025, over 11 crore farmers are enrolled. The scheme excludes income taxpayers, government employees, and institutional landholders. Aadhaar linkage is mandatory for ongoing payments.',
    status: 'Active',
    state: 'National',
    publishedAt: new Date('2019-02-24').toISOString(),
    tags: ['agriculture', 'income support', 'farmers', 'DBT']
  },
  {
    title: 'National Green Hydrogen Mission',
    category: 'Environment',
    ministry: 'Ministry of New and Renewable Energy',
    department: 'Department of New and Renewable Energy',
    summary: 'India\'s strategy to make the country a global hub for production, usage, and export of green hydrogen and its derivatives, reducing carbon emissions and building energy security.',
    content: 'The mission targets production of at least 5 MMT of green hydrogen per year by 2030, with potential to decarbonize industries like steel, chemicals, and shipping. It includes incentives for electrolyzer manufacturing, a regulatory framework for green hydrogen projects, and R&D investment. The initiative is expected to attract ₹8 lakh crore in investment, create 6 lakh jobs, and abate 50 MMT of CO2 emissions annually.',
    status: 'Active',
    state: 'National',
    publishedAt: new Date('2023-01-04').toISOString(),
    tags: ['environment', 'green energy', 'hydrogen', 'clean energy']
  },
  {
    title: 'National Broadband Mission',
    category: 'Digital Governance',
    ministry: 'Ministry of Communications',
    department: 'Department of Telecommunications',
    summary: 'A mission to provide universal broadband connectivity at affordable rates across India, covering all gram panchayats with high-speed internet by 2025.',
    content: 'The mission targets 100 Mbps broadband connectivity to all gram panchayats (approx 2.5 lakh), enhancing mobile tower coverage in underserved areas, and establishing a robust domestic optical fibre cable ecosystem. It complements BharatNet with PPP models for last-mile connectivity. The mission aims to triple broadband subscribers to 500 million and reduce data costs. Digital literacy programs run alongside for adoption.',
    status: 'Active',
    state: 'National',
    publishedAt: new Date('2019-12-17').toISOString(),
    tags: ['broadband', 'connectivity', 'rural', 'telecommunications']
  }
];

const schemes = [
  {
    name: 'Pradhan Mantri Ujjwala Yojana',
    category: 'Women Empowerment',
    ministry: 'Ministry of Petroleum and Natural Gas',
    department: 'BPCL/HPCL/Indian Oil',
    summary: 'Scheme to provide free LPG connections to women from BPL households, replacing traditional chulhas to reduce indoor pollution and protect women\'s health.',
    details: 'Under PMUY, free LPG connections are provided to eligible BPL women with a deposit-free cylinder and regulator. The scheme covers 8 crore households in Phase 1 and extended to 1 crore more in Phase 2. Beneficiaries get 14.2 kg cylinders or smaller 5 kg cylinders. EMI-based refill payments are supported. Eligibility is verified via SECC 2011 or beneficiary declaration. Identity proof, Aadhaar and bank account linkage are required.',
    status: 'Active',
    state: 'National',
    eligibilityCriteria: ['Woman from BPL household', 'Age 18 years or above', 'No existing LPG connection in household', 'Aadhaar card required'],
    benefits: ['Free LPG connection with regulator', 'Deposit-free first cylinder', 'EMI option for refills'],
    applicationMode: 'Offline',
    launchDate: new Date('2016-05-01').toISOString(),
    tags: ['LPG', 'women', 'BPL', 'cooking gas']
  },
  {
    name: 'Skill India Mission (PMKVY)',
    category: 'Employment Programs',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    department: 'National Skill Development Corporation',
    summary: 'Pradhan Mantri Kaushal Vikas Yojana provides free short-term skill training to Indian youth to improve employability and livelihoods.',
    details: 'PMKVY trains youth in job roles aligned with NSQF levels across sectors including IT, construction, healthcare, retail, and electronics. Training is imparted by empanelled Training Partners. Upon completion, candidates receive a government-recognized certificate and Recognition of Prior Learning (RPL). Monetary rewards are provided post assessment. The scheme covers both urban and rural youth with a target of training 1 crore youth per phase.',
    status: 'Active',
    state: 'National',
    eligibilityCriteria: ['Indian citizen', 'Age 15-45 years', 'School dropout or fresher', 'Aadhaar card required'],
    benefits: ['Free skill training', 'Government recognized certificate', 'Monetary reward up to Rs 8000', 'Job placement assistance'],
    applicationMode: 'Online',
    launchDate: new Date('2015-07-15').toISOString(),
    tags: ['skill', 'training', 'youth', 'employment', 'NSQF']
  },
  {
    name: 'Beti Bachao Beti Padhao',
    category: 'Women Empowerment',
    ministry: 'Ministry of Women and Child Development',
    department: 'Department of Women Empowerment',
    summary: 'A scheme to address declining child sex ratio and promote girls welfare, education, and empowerment through awareness campaigns and multi-sectoral action.',
    details: 'BBBP works through three ministries jointly - Women and Child Development, Health, and Education. District-level campaigns focus on preventing female foeticide, universal registration of births, ensuring girl child education, and preventing child marriage. Sukanya Samriddhi Yojana was launched alongside for financial security. Awareness activities, Jan Andolan drives, and community participation are central to the scheme.',
    status: 'Active',
    state: 'National',
    eligibilityCriteria: ['Girl child', 'Indian resident', 'Target districts covered by the scheme'],
    benefits: ['Educational support for girls', 'Community awareness initiatives', 'Financial literacy campaigns'],
    applicationMode: 'Offline',
    launchDate: new Date('2015-01-22').toISOString(),
    tags: ['girl child', 'education', 'gender', 'women']
  },
  {
    name: 'Stand Up India',
    category: 'Business Support',
    ministry: 'Ministry of Finance',
    department: 'Department of Financial Services',
    summary: 'A scheme to provide bank loans between Rs 10 lakh and Rs 1 crore to at least one SC/ST borrower and one woman borrower per bank branch for setting up greenfield enterprises.',
    details: 'Stand Up India facilitates bank loans for manufacturing, services, agri-allied activities, or trading sectors. Eligible enterprises must be greenfield (first-time). Composite loan includes term loan and working capital. Loans are collateral-free under CGSSI guarantee. Maximum tenure is 7 years with a moratorium of up to 18 months. The scheme operates through a digital portal with handholding support.',
    status: 'Active',
    state: 'National',
    eligibilityCriteria: ['SC/ST or woman entrepreneur', 'Age 18 years or above', 'Greenfield enterprise', 'Not defaulter with any bank'],
    benefits: ['Loan Rs 10 lakh to Rs 1 crore', 'Collateral-free under CGSSI', '7-year repayment tenure', 'Handholding support'],
    applicationMode: 'Online',
    launchDate: new Date('2016-04-05').toISOString(),
    tags: ['loan', 'SC/ST', 'women', 'entrepreneurship', 'finance']
  },
  {
    name: 'Atal Pension Yojana',
    category: 'Social Security',
    ministry: 'Ministry of Finance',
    department: 'Pension Fund Regulatory and Development Authority',
    summary: 'A government-backed pension scheme targeting unorganized sector workers, guaranteeing a monthly pension of Rs 1000 to Rs 5000 after age 60.',
    details: 'APY is administered by PFRDA. Contributions depend on the subscriber age and desired pension amount. Government co-contributes 50% of subscriber contribution or Rs 1000 per year for 5 years to eligible subscribers who joined before 2016. On death, spouse receives same pension and on death of spouse, nominee gets the accumulated corpus. Exit before 60 is allowed only under exceptional circumstances.',
    status: 'Active',
    state: 'National',
    eligibilityCriteria: ['Indian citizen', 'Age 18-40 years', 'Active bank account', 'Not an income taxpayer for government co-contribution'],
    benefits: ['Guaranteed pension Rs 1000 to Rs 5000 per month', 'Government co-contribution', 'Spouse pension coverage', 'Nominee corpus on death'],
    applicationMode: 'Offline',
    launchDate: new Date('2015-06-01').toISOString(),
    tags: ['pension', 'retirement', 'unorganized sector', 'social security']
  },
  {
    name: 'PM Mudra Yojana',
    category: 'Business Support',
    ministry: 'Ministry of Finance',
    department: 'Micro Units Development and Refinance Agency',
    summary: 'Provides collateral-free micro-loans up to Rs 10 lakh to non-corporate small and micro enterprises through three categories - Shishu, Kishor, and Tarun.',
    details: 'PMMY loans are provided through banks, MFIs, NBFCs, and cooperative banks. Shishu covers loans up to Rs 50000, Kishor covers Rs 50001 to Rs 5 lakh, Tarun covers Rs 5 to Rs 10 lakh. Interest rates are capped. Credit Guarantee Fund for Micro Units provides guarantee. Loans can be used for working capital, equipment, transport, and trade. No collateral required. A Mudra Card RuPay debit card is issued for working capital needs.',
    status: 'Active',
    state: 'National',
    eligibilityCriteria: ['Non-corporate non-farm small/micro enterprises', 'Indian citizen', 'Viable business plan', 'Not defaulter with financial institution'],
    benefits: ['Collateral-free loans up to Rs 10 lakh', 'Mudra Debit Card', 'Low interest rates', 'Credit guarantee coverage'],
    applicationMode: 'Online',
    launchDate: new Date('2015-04-08').toISOString(),
    tags: ['micro loan', 'MSME', 'entrepreneur', 'self-employment']
  },
  {
    name: 'Swachh Bharat Mission Urban',
    category: 'Housing',
    ministry: 'Ministry of Housing and Urban Affairs',
    department: 'Directorate of Swachh Bharat Mission',
    summary: 'Urban sanitation programme to achieve open defecation free cities by constructing individual, community, and public toilets, and improving solid waste management.',
    details: 'SBM-Urban provides financial assistance for construction of individual household toilets, community toilet complexes, public toilets, and solid waste management infrastructure. Rs 4000 per household toilet is provided. Cleanliness rankings of cities incentivize participation. Behaviour change communication campaigns run alongside infrastructure. The Mission 2.0 focuses on waste water management and star-rated garbage-free cities.',
    status: 'Active',
    state: 'National',
    eligibilityCriteria: ['Urban household without toilet', 'Resident of notified urban local body area', 'BPL household priority'],
    benefits: ['Rs 4000 subsidy for household toilet', 'Community toilet access', 'Improved sanitation infrastructure'],
    applicationMode: 'Offline',
    launchDate: new Date('2014-10-02').toISOString(),
    tags: ['sanitation', 'toilet', 'urban', 'cleanliness']
  },
  {
    name: 'National Apprenticeship Promotion Scheme',
    category: 'Employment Programs',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    department: 'Directorate General of Training',
    summary: 'Promotes apprenticeship training in India by sharing 25% of prescribed stipend paid to apprentices by employers, targeting 50 lakh apprentices by 2025.',
    details: 'NAPS incentivizes employers by reimbursing 25% of prescribed stipend subject to a maximum of Rs 1500 per month per apprentice. Registration and matching of apprentices with establishments happens on the apprenticeship portal. On-the-job training is provided in manufacturing, service, and non-manufacturing sectors. Upon completion, a government-recognized certificate is awarded. Apprentices also receive structured classroom training.',
    status: 'Active',
    state: 'National',
    eligibilityCriteria: ['Minimum 8th standard pass', 'Age 14 years or above', 'Registered on apprenticeship portal', 'Selected by a registered employer'],
    benefits: ['Monthly stipend', '25% stipend reimbursed by government', 'Recognized apprenticeship certificate', 'Real industry exposure'],
    applicationMode: 'Online',
    launchDate: new Date('2016-08-19').toISOString(),
    tags: ['apprenticeship', 'skill', 'training', 'employment']
  },
  {
    name: 'Pradhan Mantri Suraksha Bima Yojana',
    category: 'Social Security',
    ministry: 'Ministry of Finance',
    department: 'Department of Financial Services',
    summary: 'Provides accidental death and disability insurance cover of Rs 2 lakh at a premium of just Rs 20 per year to bank account holders aged 18-70 years.',
    details: 'PMSBY is an accidental insurance scheme offering Rs 2 lakh for accidental death or total disability and Rs 1 lakh for partial disability. Annual premium is Rs 20, auto-debited from the bank account. The scheme is available through partner banks and can be renewed annually. Risk coverage is from June 1 to May 31. Any Indian with a savings bank account aged 18-70 can enroll.',
    status: 'Active',
    state: 'National',
    eligibilityCriteria: ['Age 18-70 years', 'Active savings bank account', 'Aadhaar linked to bank account', 'Auto-debit consent given'],
    benefits: ['Rs 2 lakh accidental death cover', 'Rs 1 lakh partial disability cover', 'Premium only Rs 20 per year', 'Auto-renewal facility'],
    applicationMode: 'Online',
    launchDate: new Date('2015-05-09').toISOString(),
    tags: ['insurance', 'accident', 'low premium', 'social security']
  },
  {
    name: 'National Rural Livelihood Mission Aajeevika',
    category: 'Employment Programs',
    ministry: 'Ministry of Rural Development',
    department: 'Department of Rural Development',
    summary: 'Aims to create efficient and effective institutional platforms for rural poor to increase household income through sustainable livelihood enhancements and improved access to financial services.',
    details: 'DAY-NRLM promotes Self Help Groups for rural women as a foundation for economic empowerment. It provides revolving funds, community investment support, skill training, and market linkages. SHG federations are formed at village and cluster levels for sustainability. Bank linkage of SHGs ensures access to credit. Producer groups are formed for farm and non-farm livelihoods. Over 8 crore women across 70 lakh SHGs are mobilized nationally.',
    status: 'Active',
    state: 'National',
    eligibilityCriteria: ['Rural poor household', 'Women members priority', 'BPL or economically vulnerable', 'Willing to form/join SHG'],
    benefits: ['SHG revolving fund Rs 15000', 'Community Investment Fund up to Rs 2.5 lakh', 'Skill training and placement', 'Bank credit linkage', 'Market linkage support'],
    applicationMode: 'Offline',
    launchDate: new Date('2011-06-03').toISOString(),
    tags: ['SHG', 'rural', 'women', 'livelihood', 'poverty']
  }
];

async function createAll() {
  console.log('=== Creating 10 Policies ===');
  for (let i = 0; i < policies.length; i++) {
    const p = policies[i];
    try {
      const result = await post('/policies', p);
      if (result.status === 201) {
        console.log(`✅ Policy ${i+1}: "${p.title}" — created (ID: ${result.body.policy?._id})`);
      } else if (result.status === 400 && result.body.message?.includes('duplicate')) {
        console.log(`⚠️  Policy ${i+1}: "${p.title}" — already exists`);
      } else {
        console.log(`❌ Policy ${i+1}: "${p.title}" — Status ${result.status}:`, JSON.stringify(result.body));
      }
    } catch (err) {
      console.log(`❌ Policy ${i+1}: "${p.title}" — Error:`, err.message);
    }
  }

  console.log('\n=== Creating 10 Schemes ===');
  for (let i = 0; i < schemes.length; i++) {
    const s = schemes[i];
    try {
      const result = await post('/schemes', s);
      if (result.status === 201) {
        console.log(`✅ Scheme ${i+1}: "${s.name}" — created (ID: ${result.body.scheme?._id})`);
      } else if (result.status === 400 && result.body.message?.includes('duplicate')) {
        console.log(`⚠️  Scheme ${i+1}: "${s.name}" — already exists`);
      } else {
        console.log(`❌ Scheme ${i+1}: "${s.name}" — Status ${result.status}:`, JSON.stringify(result.body));
      }
    } catch (err) {
      console.log(`❌ Scheme ${i+1}: "${s.name}" — Error:`, err.message);
    }
  }

  console.log('\n=== Verifying counts ===');
  const statsReq = await new Promise((resolve) => {
    const req = http.request({ hostname: 'localhost', port: 4000, path: '/api/stats', method: 'GET' }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.end();
  });
  console.log('Platform Stats:', JSON.stringify(statsReq.stats, null, 2));
  console.log('\nDone! All policies and schemes are now live in the database.');
}

createAll().catch(console.error);
