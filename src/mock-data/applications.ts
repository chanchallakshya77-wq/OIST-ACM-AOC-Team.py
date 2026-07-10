// Mock data for application tracking

export interface ApplicationStatus {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  applicationNumber: string;
  submittedDate: string; // ISO 8601
  currentStage: string;
  currentStatus: "pending" | "under_review" | "approved" | "rejected" | "document_required" | "in_transit";
  lastUpdated: string; // ISO 8601
  statusHistory: StatusHistoryEntry[];
  estimatedCompletionDate?: string;
  daysElapsed: number;
  maxAllowedDays: number;
  isOverdue: boolean;
  nextAction?: string;
  trackingUrl?: string;
}

export interface StatusHistoryEntry {
  stage: string;
  status: string;
  timestamp: string; // ISO 8601
  remarks?: string;
  updatedBy?: string;
  daysSpent: number;
}

export const MOCK_APPLICATIONS: ApplicationStatus[] = [
  {
    id: "app-001",
    serviceId: "mp-scholarship-postmatric-scst",
    serviceName: "Post-Matric Scholarship for SC/ST Students",
    category: "Education & Scholarships",
    applicationNumber: "MPSCST2026000123",
    submittedDate: "2026-06-15T10:30:00Z",
    currentStage: "Institute Verification",
    currentStatus: "under_review",
    lastUpdated: "2026-06-20T14:22:00Z",
    daysElapsed: 21,
    maxAllowedDays: 60,
    isOverdue: false,
    nextAction: "Awaiting institute principal's signature on verification form",
    trackingUrl: "https://scholarshipportal.mp.nic.in/track/MPSCST2026000123",
    statusHistory: [
      {
        stage: "Application Submitted",
        status: "completed",
        timestamp: "2026-06-15T10:30:00Z",
        remarks: "Application submitted successfully",
        daysSpent: 0
      },
      {
        stage: "Document Verification",
        status: "completed",
        timestamp: "2026-06-17T09:15:00Z",
        remarks: "All documents verified by district office",
        updatedBy: "District Welfare Officer",
        daysSpent: 2
      },
      {
        stage: "Institute Verification",
        status: "under_review",
        timestamp: "2026-06-20T14:22:00Z",
        remarks: "Sent to institute for enrollment verification",
        updatedBy: "System",
        daysSpent: 5
      }
    ]
  },
  {
    id: "app-002",
    serviceId: "mp-pension-oldage",
    serviceName: "Indira Gandhi National Old Age Pension",
    category: "Social Welfare & Pensions",
    applicationNumber: "MPPENS2026004567",
    submittedDate: "2026-05-10T11:00:00Z",
    currentStage: "Payment Processing",
    currentStatus: "approved",
    lastUpdated: "2026-07-01T16:45:00Z",
    daysElapsed: 57,
    maxAllowedDays: 30,
    isOverdue: true,
    nextAction: "First pension installment being processed",
    trackingUrl: "https://socialsecurity.mp.gov.in/track/MPPENS2026004567",
    estimatedCompletionDate: "2026-07-10T00:00:00Z",
    statusHistory: [
      {
        stage: "Application Submitted",
        status: "completed",
        timestamp: "2026-05-10T11:00:00Z",
        remarks: "Application submitted at Tehsil office",
        daysSpent: 0
      },
      {
        stage: "Document Verification",
        status: "completed",
        timestamp: "2026-05-20T10:30:00Z",
        remarks: "Age proof and income certificate verified",
        updatedBy: "Tehsildar",
        daysSpent: 10
      },
      {
        stage: "BPL Verification",
        status: "completed",
        timestamp: "2026-06-05T15:20:00Z",
        remarks: "BPL status confirmed from Food Department database",
        updatedBy: "District Officer",
        daysSpent: 16
      },
      {
        stage: "Final Approval",
        status: "completed",
        timestamp: "2026-06-25T12:00:00Z",
        remarks: "Application approved by District Social Welfare Officer",
        updatedBy: "DSWO",
        daysSpent: 20
      },
      {
        stage: "Payment Processing",
        status: "approved",
        timestamp: "2026-07-01T16:45:00Z",
        remarks: "Pension sanctioned, payment order issued",
        updatedBy: "Treasury",
        daysSpent: 6
      }
    ]
  },
  {
    id: "app-003",
    serviceId: "income-certificate",
    serviceName: "Income Certificate",
    category: "Certificates",
    applicationNumber: "MPINC2026012345",
    submittedDate: "2026-07-01T09:00:00Z",
    currentStage: "Tehsildar Approval",
    currentStatus: "pending",
    lastUpdated: "2026-07-05T11:30:00Z",
    daysElapsed: 10,
    maxAllowedDays: 7,
    isOverdue: true,
    nextAction: "Pending signature from Tehsildar",
    trackingUrl: "https://mpedistrict.gov.in/track/MPINC2026012345",
    statusHistory: [
      {
        stage: "Application Submitted",
        status: "completed",
        timestamp: "2026-07-01T09:00:00Z",
        remarks: "Online application submitted",
        daysSpent: 0
      },
      {
        stage: "Field Verification",
        status: "completed",
        timestamp: "2026-07-03T14:15:00Z",
        remarks: "Income documents verified by Patwari",
        updatedBy: "Patwari, Bhopal",
        daysSpent: 2
      },
      {
        stage: "Tehsildar Approval",
        status: "pending",
        timestamp: "2026-07-05T11:30:00Z",
        remarks: "Forwarded to Tehsildar for final approval",
        updatedBy: "System",
        daysSpent: 2
      }
    ]
  },
  {
    id: "app-004",
    serviceId: "pmkisan",
    serviceName: "PM-KISAN (Kisan Samman Nidhi)",
    category: "Agriculture & Farmer Welfare",
    applicationNumber: "PMKISAN2026789456",
    submittedDate: "2026-06-01T08:00:00Z",
    currentStage: "Aadhaar Linking Pending",
    currentStatus: "document_required",
    lastUpdated: "2026-06-10T10:00:00Z",
    daysElapsed: 40,
    maxAllowedDays: 30,
    isOverdue: true,
    nextAction: "Link Aadhaar to bank account and update on portal",
    trackingUrl: "https://pmkisan.gov.in/BeneficiaryStatus.aspx",
    statusHistory: [
      {
        stage: "Application Submitted",
        status: "completed",
        timestamp: "2026-06-01T08:00:00Z",
        remarks: "Application submitted through Common Service Center",
        daysSpent: 0
      },
      {
        stage: "Land Records Verification",
        status: "completed",
        timestamp: "2026-06-05T16:30:00Z",
        remarks: "Land records verified with revenue department",
        updatedBy: "Patwari",
        daysSpent: 4
      },
      {
        stage: "Aadhaar Linking Pending",
        status: "document_required",
        timestamp: "2026-06-10T10:00:00Z",
        remarks: "Aadhaar not linked to bank account - applicant action required",
        updatedBy: "System",
        daysSpent: 5
      }
    ]
  },
  {
    id: "app-005",
    serviceId: "driving-license",
    serviceName: "Driving License (New)",
    category: "Licenses",
    applicationNumber: "MPDL26BH123456",
    submittedDate: "2026-06-20T11:00:00Z",
    currentStage: "Driving Test Scheduled",
    currentStatus: "pending",
    lastUpdated: "2026-07-02T09:00:00Z",
    daysElapsed: 21,
    maxAllowedDays: 30,
    isOverdue: false,
    nextAction: "Driving test scheduled on 2026-07-15",
    trackingUrl: "https://parivahan.gov.in/parivahan",
    statusHistory: [
      {
        stage: "Application Submitted",
        status: "completed",
        timestamp: "2026-06-20T11:00:00Z",
        remarks: "Learning license verified, DL application submitted",
        daysSpent: 0
      },
      {
        stage: "Document Verification",
        status: "completed",
        timestamp: "2026-06-25T14:00:00Z",
        remarks: "All documents verified by RTO",
        updatedBy: "RTO Bhopal",
        daysSpent: 5
      },
      {
        stage: "Driving Test Scheduled",
        status: "pending",
        timestamp: "2026-07-02T09:00:00Z",
        remarks: "Driving test scheduled for 2026-07-15 at 10:00 AM",
        updatedBy: "RTO System",
        daysSpent: 7
      }
    ]
  },
  {
    id: "app-006",
    serviceId: "ration-card",
    serviceName: "Ration Card (BPL)",
    category: "Housing & Utilities",
    applicationNumber: "MPRC2026567890",
    submittedDate: "2026-05-15T10:00:00Z",
    currentStage: "Card Printing",
    currentStatus: "approved",
    lastUpdated: "2026-07-08T12:00:00Z",
    daysElapsed: 54,
    maxAllowedDays: 30,
    isOverdue: true,
    nextAction: "Card printed, ready for collection at Fair Price Shop",
    trackingUrl: "https://mpedistrict.gov.in/track/MPRC2026567890",
    statusHistory: [
      {
        stage: "Application Submitted",
        status: "completed",
        timestamp: "2026-05-15T10:00:00Z",
        remarks: "Online application submitted",
        daysSpent: 0
      },
      {
        stage: "Income Verification",
        status: "completed",
        timestamp: "2026-05-25T15:00:00Z",
        remarks: "Income documents verified for BPL eligibility",
        updatedBy: "Tehsildar",
        daysSpent: 10
      },
      {
        stage: "Address Verification",
        status: "completed",
        timestamp: "2026-06-10T11:00:00Z",
        remarks: "Physical address verification completed",
        updatedBy: "Field Inspector",
        daysSpent: 16
      },
      {
        stage: "Final Approval",
        status: "completed",
        timestamp: "2026-06-28T14:30:00Z",
        remarks: "BPL ration card approved by District Supply Officer",
        updatedBy: "DSO",
        daysSpent: 18
      },
      {
        stage: "Card Printing",
        status: "approved",
        timestamp: "2026-07-08T12:00:00Z",
        remarks: "Ration card printed and dispatched to Fair Price Shop",
        updatedBy: "Printing Division",
        daysSpent: 10
      }
    ]
  }
];

export function getApplicationById(id: string): ApplicationStatus | undefined {
  return MOCK_APPLICATIONS.find(app => app.id === id);
}

export function getApplicationsByCategory(category: string): ApplicationStatus[] {
  return MOCK_APPLICATIONS.filter(app => app.category === category);
}

export function getOverdueApplications(): ApplicationStatus[] {
  return MOCK_APPLICATIONS.filter(app => app.isOverdue);
}

export function getApplicationsByStatus(status: ApplicationStatus["currentStatus"]): ApplicationStatus[] {
  return MOCK_APPLICATIONS.filter(app => app.currentStatus === status);
}
