// Mock data for all government services across Madhya Pradesh

export interface GovernmentService {
  id: string;
  category: string;
  name: string;
  description: string;
  eligibility: string[];
  documents: string[];
  portal: string;
  estimatedDays: number;
  fee: number;
  authority: string;
}

export const GOVERNMENT_SERVICES: GovernmentService[] = [
  // Education & Scholarships
  {
    id: "mp-scholarship-postmatric-scst",
    category: "Education & Scholarships",
    name: "Post-Matric Scholarship for SC/ST Students",
    description: "Financial assistance for SC/ST students pursuing education from Class 11 onwards",
    eligibility: [
      "Domicile of Madhya Pradesh",
      "Belonging to SC/ST category",
      "Family annual income ≤ ₹2,50,000",
      "Studying in Class 11 or above"
    ],
    documents: [
      "Caste Certificate",
      "Income Certificate",
      "Domicile Certificate",
      "Previous year marksheet",
      "Bank account details",
      "Aadhaar card"
    ],
    portal: "https://scholarshipportal.mp.nic.in",
    estimatedDays: 60,
    fee: 0,
    authority: "Social Justice Department, MP"
  },
  {
    id: "mp-scholarship-merit",
    category: "Education & Scholarships",
    name: "Chief Minister Meritorious Student Scholarship",
    description: "Merit-based scholarship for high-performing students",
    eligibility: [
      "Domicile of Madhya Pradesh",
      "Scored 75%+ in previous examination",
      "Family annual income ≤ ₹6,00,000"
    ],
    documents: [
      "Marksheet (75%+ marks)",
      "Income Certificate",
      "Domicile Certificate",
      "Bank account details"
    ],
    portal: "https://scholarshipportal.mp.nic.in",
    estimatedDays: 45,
    fee: 0,
    authority: "Education Department, MP"
  },

  // Social Welfare & Pensions
  {
    id: "mp-pension-oldage",
    category: "Social Welfare & Pensions",
    name: "Indira Gandhi National Old Age Pension",
    description: "Monthly pension for senior citizens (60+ years)",
    eligibility: [
      "Age 60 years or above",
      "BPL card holder or income ≤ ₹48,000/year",
      "Resident of Madhya Pradesh"
    ],
    documents: [
      "Age proof (Birth certificate / Aadhaar / Voter ID)",
      "BPL card or Income Certificate",
      "Domicile Certificate",
      "Bank account details",
      "Aadhaar card"
    ],
    portal: "https://socialsecurity.mp.gov.in",
    estimatedDays: 30,
    fee: 0,
    authority: "Social Justice Department, MP"
  },
  {
    id: "mp-pension-widow",
    category: "Social Welfare & Pensions",
    name: "Widow Pension Scheme",
    description: "Monthly financial assistance for widows",
    eligibility: [
      "Widowed women aged 18-60 years",
      "Annual income ≤ ₹48,000",
      "Resident of Madhya Pradesh"
    ],
    documents: [
      "Death certificate of husband",
      "Age proof",
      "Income Certificate",
      "Domicile Certificate",
      "Bank account details"
    ],
    portal: "https://socialsecurity.mp.gov.in",
    estimatedDays: 30,
    fee: 0,
    authority: "Women & Child Development, MP"
  },
  {
    id: "mp-pension-disability",
    category: "Social Welfare & Pensions",
    name: "Disability Pension Scheme",
    description: "Monthly pension for persons with disabilities (40%+ disability)",
    eligibility: [
      "Disability certificate showing 40%+ disability",
      "Age 18-59 years",
      "Resident of Madhya Pradesh"
    ],
    documents: [
      "Disability Certificate (40%+)",
      "Age proof",
      "Domicile Certificate",
      "Bank account details",
      "Aadhaar card"
    ],
    portal: "https://socialsecurity.mp.gov.in",
    estimatedDays: 30,
    fee: 0,
    authority: "Social Justice Department, MP"
  },

  // Healthcare Services
  {
    id: "ayushman-bharat",
    category: "Healthcare Services",
    name: "Ayushman Bharat - PM-JAY Health Card",
    description: "Health insurance coverage up to ₹5 lakh per family per year",
    eligibility: [
      "Family listed in SECC 2011 database",
      "BPL card holder or meeting deprivation criteria"
    ],
    documents: [
      "Aadhaar card",
      "Ration card",
      "Any government ID proof",
      "Family identification document"
    ],
    portal: "https://pmjay.gov.in",
    estimatedDays: 15,
    fee: 0,
    authority: "National Health Authority"
  },

  // Agriculture & Farmer Welfare
  {
    id: "pmkisan",
    category: "Agriculture & Farmer Welfare",
    name: "PM-KISAN (Kisan Samman Nidhi)",
    description: "Direct income support of ₹6,000/year to farmer families",
    eligibility: [
      "Landholding farmer families",
      "Valid land records",
      "Aadhaar linked to bank account"
    ],
    documents: [
      "Land ownership documents (Khasra/Khatauni)",
      "Aadhaar card",
      "Bank account details linked to Aadhaar"
    ],
    portal: "https://pmkisan.gov.in",
    estimatedDays: 30,
    fee: 0,
    authority: "Ministry of Agriculture"
  },
  {
    id: "crop-insurance",
    category: "Agriculture & Farmer Welfare",
    name: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance against natural calamities",
    eligibility: [
      "Farmers owning cultivable land",
      "Tenant farmers with valid agreements"
    ],
    documents: [
      "Land records",
      "Sowing certificate",
      "Aadhaar card",
      "Bank account details"
    ],
    portal: "https://pmfby.gov.in",
    estimatedDays: 15,
    fee: 200,
    authority: "Ministry of Agriculture"
  },

  // Certificates
  {
    id: "income-certificate",
    category: "Certificates",
    name: "Income Certificate",
    description: "Official certificate stating family annual income",
    eligibility: [
      "Resident of Madhya Pradesh",
      "Required income verification documents"
    ],
    documents: [
      "Salary slips / Agricultural income proof",
      "Aadhaar card",
      "Self-declaration affidavit",
      "Ration card"
    ],
    portal: "https://mpedistrict.gov.in",
    estimatedDays: 7,
    fee: 30,
    authority: "Tehsildar / Sub-Divisional Magistrate"
  },
  {
    id: "caste-certificate",
    category: "Certificates",
    name: "Caste Certificate (SC/ST/OBC)",
    description: "Official certificate for caste verification",
    eligibility: [
      "Resident of Madhya Pradesh",
      "Belonging to SC/ST/OBC category"
    ],
    documents: [
      "Aadhaar card",
      "Domicile Certificate",
      "Parent's caste certificate (if available)",
      "Self-declaration affidavit"
    ],
    portal: "https://mpedistrict.gov.in",
    estimatedDays: 30,
    fee: 30,
    authority: "Tehsildar / Sub-Divisional Magistrate"
  },
  {
    id: "domicile-certificate",
    category: "Certificates",
    name: "Domicile Certificate",
    description: "Certificate proving residence in Madhya Pradesh",
    eligibility: [
      "Residing in MP for 10+ years or born in MP"
    ],
    documents: [
      "Aadhaar card",
      "Ration card",
      "Voter ID",
      "School leaving certificate",
      "Electricity bill / Rent agreement"
    ],
    portal: "https://mpedistrict.gov.in",
    estimatedDays: 15,
    fee: 30,
    authority: "Tehsildar / Sub-Divisional Magistrate"
  },

  // Licenses
  {
    id: "driving-license",
    category: "Licenses",
    name: "Driving License (New / Renewal)",
    description: "Official license to drive motor vehicles",
    eligibility: [
      "Age 18+ for car/motorcycle",
      "Age 20+ for commercial vehicles",
      "Passed driving test"
    ],
    documents: [
      "Learner's License",
      "Age proof",
      "Address proof",
      "Passport size photos",
      "Medical certificate (for commercial)",
      "Driving test certificate"
    ],
    portal: "https://parivahan.gov.in/parivahan",
    estimatedDays: 30,
    fee: 200,
    authority: "Regional Transport Office (RTO)"
  },

  // Housing & Utilities
  {
    id: "pmay-gramin",
    category: "Housing & Utilities",
    name: "Pradhan Mantri Awas Yojana (Gramin)",
    description: "Financial assistance for rural housing",
    eligibility: [
      "Houseless or living in kutcha house",
      "BPL or EWS category",
      "No pucca house in family name",
      "Rural area resident"
    ],
    documents: [
      "Aadhaar card",
      "BPL card",
      "Land ownership documents",
      "Bank account details",
      "Income Certificate"
    ],
    portal: "https://pmayg.nic.in",
    estimatedDays: 90,
    fee: 0,
    authority: "Ministry of Rural Development"
  },
  {
    id: "ration-card",
    category: "Housing & Utilities",
    name: "Ration Card (APL/BPL/AAY)",
    description: "Card for subsidized food grains from PDS",
    eligibility: [
      "Resident of Madhya Pradesh",
      "No existing ration card in family"
    ],
    documents: [
      "Aadhaar card (all family members)",
      "Address proof",
      "Income Certificate",
      "Passport size photos"
    ],
    portal: "https://mpedistrict.gov.in",
    estimatedDays: 30,
    fee: 0,
    authority: "Food & Civil Supplies Department"
  },

  // Employment
  {
    id: "mgnrega",
    category: "Employment & Skill Development",
    name: "MGNREGA Job Card",
    description: "100 days guaranteed wage employment in rural areas",
    eligibility: [
      "Rural area resident",
      "Adult willing to do unskilled manual work"
    ],
    documents: [
      "Aadhaar card",
      "Address proof",
      "Bank account details",
      "Passport size photo"
    ],
    portal: "https://nrega.nic.in",
    estimatedDays: 15,
    fee: 0,
    authority: "Ministry of Rural Development"
  }
];

export function getServicesByCategory(category: string): GovernmentService[] {
  return GOVERNMENT_SERVICES.filter(s => s.category === category);
}

export function getServiceById(id: string): GovernmentService | undefined {
  return GOVERNMENT_SERVICES.find(s => s.id === id);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(GOVERNMENT_SERVICES.map(s => s.category)));
}
