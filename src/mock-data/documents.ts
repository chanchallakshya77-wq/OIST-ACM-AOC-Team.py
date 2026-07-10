// Mock data for document management

export interface DocumentInfo {
  id: string;
  name: string;
  type: DocumentType;
  category: string;
  uploadedDate?: string; // ISO 8601
  expiryDate?: string; // ISO 8601
  issueDate?: string; // ISO 8601
  issuingAuthority?: string;
  documentNumber?: string;
  status: "not_uploaded" | "uploaded" | "verified" | "rejected" | "expired";
  rejectionReason?: string;
  fileUrl?: string;
  fileSize?: number; // in bytes
  verified: boolean;
}

export type DocumentType =
  | "aadhaar"
  | "income_certificate"
  | "caste_certificate"
  | "domicile_certificate"
  | "birth_certificate"
  | "marksheet"
  | "bank_passbook"
  | "ration_card"
  | "voter_id"
  | "driving_license"
  | "land_records"
  | "disability_certificate"
  | "death_certificate"
  | "bpl_card"
  | "passport"
  | "pan_card"
  | "electricity_bill"
  | "rent_agreement"
  | "photo";

export interface DocumentRequirement {
  serviceId: string;
  serviceName: string;
  requiredDocuments: {
    type: DocumentType;
    displayName: string;
    mandatory: boolean;
    description: string;
    acceptedFormats: string[];
    maxSizeKB: number;
    validityMonths?: number;
  }[];
}

export const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  {
    serviceId: "mp-scholarship-postmatric-scst",
    serviceName: "Post-Matric Scholarship for SC/ST Students",
    requiredDocuments: [
      {
        type: "caste_certificate",
        displayName: "Caste Certificate (SC/ST)",
        mandatory: true,
        description: "Valid caste certificate issued by competent authority",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 2048,
        validityMonths: 60
      },
      {
        type: "income_certificate",
        displayName: "Income Certificate",
        mandatory: true,
        description: "Family income certificate not older than 6 months",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 2048,
        validityMonths: 6
      },
      {
        type: "domicile_certificate",
        displayName: "Domicile Certificate",
        mandatory: true,
        description: "Proof of Madhya Pradesh domicile",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 2048
      },
      {
        type: "marksheet",
        displayName: "Previous Year Marksheet",
        mandatory: true,
        description: "Marksheet of previous examination passed",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 2048
      },
      {
        type: "bank_passbook",
        displayName: "Bank Account Details",
        mandatory: true,
        description: "First page of passbook or cancelled cheque",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 1024
      },
      {
        type: "aadhaar",
        displayName: "Aadhaar Card",
        mandatory: true,
        description: "Aadhaar card of applicant",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 1024
      }
    ]
  },
  {
    serviceId: "mp-pension-oldage",
    serviceName: "Indira Gandhi National Old Age Pension",
    requiredDocuments: [
      {
        type: "birth_certificate",
        displayName: "Age Proof",
        mandatory: true,
        description: "Birth certificate, school leaving certificate, or any govt ID showing DOB",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 2048
      },
      {
        type: "bpl_card",
        displayName: "BPL Card or Income Certificate",
        mandatory: true,
        description: "BPL card or income certificate showing ≤₹48,000/year",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 2048,
        validityMonths: 6
      },
      {
        type: "domicile_certificate",
        displayName: "Domicile Certificate",
        mandatory: true,
        description: "Proof of Madhya Pradesh residence",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 2048
      },
      {
        type: "bank_passbook",
        displayName: "Bank Account Details",
        mandatory: true,
        description: "Bank passbook first page",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 1024
      },
      {
        type: "aadhaar",
        displayName: "Aadhaar Card",
        mandatory: true,
        description: "Aadhaar card of applicant",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 1024
      }
    ]
  },
  {
    serviceId: "income-certificate",
    serviceName: "Income Certificate",
    requiredDocuments: [
      {
        type: "aadhaar",
        displayName: "Aadhaar Card",
        mandatory: true,
        description: "Aadhaar card of applicant",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 1024
      },
      {
        type: "ration_card",
        displayName: "Ration Card",
        mandatory: true,
        description: "Family ration card",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 1024
      },
      {
        type: "electricity_bill",
        displayName: "Address Proof",
        mandatory: true,
        description: "Electricity bill, rent agreement, or any address proof",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 1024
      }
    ]
  },
  {
    serviceId: "pmkisan",
    serviceName: "PM-KISAN",
    requiredDocuments: [
      {
        type: "land_records",
        displayName: "Land Ownership Documents",
        mandatory: true,
        description: "Khasra/Khatauni showing land ownership",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 3072
      },
      {
        type: "aadhaar",
        displayName: "Aadhaar Card",
        mandatory: true,
        description: "Aadhaar must be linked to bank account",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 1024
      },
      {
        type: "bank_passbook",
        displayName: "Bank Account Details",
        mandatory: true,
        description: "Bank passbook with Aadhaar linked",
        acceptedFormats: ["PDF", "JPG", "PNG"],
        maxSizeKB: 1024
      }
    ]
  }
];

export const MOCK_USER_DOCUMENTS: DocumentInfo[] = [
  {
    id: "doc-001",
    name: "aadhaar_card.pdf",
    type: "aadhaar",
    category: "Identity Proof",
    uploadedDate: "2026-06-01T10:00:00Z",
    issueDate: "2020-03-15T00:00:00Z",
    issuingAuthority: "UIDAI",
    documentNumber: "XXXX-XXXX-1234",
    status: "verified",
    fileUrl: "/documents/aadhaar_card.pdf",
    fileSize: 524288,
    verified: true
  },
  {
    id: "doc-002",
    name: "income_certificate_2026.pdf",
    type: "income_certificate",
    category: "Financial Documents",
    uploadedDate: "2026-06-05T14:30:00Z",
    issueDate: "2026-05-20T00:00:00Z",
    expiryDate: "2026-11-20T00:00:00Z",
    issuingAuthority: "Tehsildar, Bhopal",
    documentNumber: "INC/2026/BH/00567",
    status: "verified",
    fileUrl: "/documents/income_certificate.pdf",
    fileSize: 819200,
    verified: true
  },
  {
    id: "doc-003",
    name: "caste_certificate.pdf",
    type: "caste_certificate",
    category: "Caste Documents",
    uploadedDate: "2026-06-02T09:15:00Z",
    issueDate: "2021-08-10T00:00:00Z",
    issuingAuthority: "SDM, Bhopal",
    documentNumber: "CST/2021/BH/SC/01234",
    status: "verified",
    fileUrl: "/documents/caste_certificate.pdf",
    fileSize: 716800,
    verified: true
  },
  {
    id: "doc-004",
    name: "domicile_certificate.pdf",
    type: "domicile_certificate",
    category: "Residence Proof",
    uploadedDate: "2026-06-03T11:20:00Z",
    issueDate: "2022-01-15T00:00:00Z",
    issuingAuthority: "Tehsildar, Bhopal",
    documentNumber: "DOM/2022/BH/05678",
    status: "verified",
    fileUrl: "/documents/domicile_certificate.pdf",
    fileSize: 614400,
    verified: true
  },
  {
    id: "doc-005",
    name: "class_12_marksheet.pdf",
    type: "marksheet",
    category: "Educational Documents",
    uploadedDate: "2026-06-10T16:45:00Z",
    issueDate: "2025-05-30T00:00:00Z",
    issuingAuthority: "MP Board of Secondary Education",
    documentNumber: "MPBSE2025123456",
    status: "verified",
    fileUrl: "/documents/class_12_marksheet.pdf",
    fileSize: 1048576,
    verified: true
  },
  {
    id: "doc-006",
    name: "bank_passbook.jpg",
    type: "bank_passbook",
    category: "Banking Documents",
    uploadedDate: "2026-06-08T10:30:00Z",
    issuingAuthority: "State Bank of India",
    status: "verified",
    fileUrl: "/documents/bank_passbook.jpg",
    fileSize: 409600,
    verified: true
  },
  {
    id: "doc-007",
    name: "passport_photo.jpg",
    type: "photo",
    category: "Personal Documents",
    uploadedDate: "2026-06-01T10:05:00Z",
    status: "verified",
    fileUrl: "/documents/passport_photo.jpg",
    fileSize: 102400,
    verified: true
  },
  {
    id: "doc-008",
    name: "land_records_khasra.pdf",
    type: "land_records",
    category: "Property Documents",
    status: "not_uploaded",
    verified: false
  },
  {
    id: "doc-009",
    name: "bpl_card.pdf",
    type: "bpl_card",
    category: "Economic Status",
    status: "not_uploaded",
    verified: false
  }
];

export function getDocumentsByType(type: DocumentType): DocumentInfo[] {
  return MOCK_USER_DOCUMENTS.filter(doc => doc.type === type);
}

export function getVerifiedDocuments(): DocumentInfo[] {
  return MOCK_USER_DOCUMENTS.filter(doc => doc.verified);
}

export function getMissingDocuments(): DocumentInfo[] {
  return MOCK_USER_DOCUMENTS.filter(doc => doc.status === "not_uploaded");
}

export function getDocumentRequirementsForService(serviceId: string): DocumentRequirement | undefined {
  return DOCUMENT_REQUIREMENTS.find(req => req.serviceId === serviceId);
}
