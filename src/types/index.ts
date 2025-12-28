// Enums
export type UserRole = 'ADMIN' | 'OWNER' | 'USER';
export type UserType = 'TECHNICIAN' | 'ADMINISTRATION' | 'SELLER';
export type ClientType = 'INDIVIDUAL' | 'COMPANY';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type AttachmentType = 'PHOTO' | 'PDF' | 'DOC' | 'OTHER';
export type AttachmentTargetType = 'WORK' | 'PLANT' | 'TICKET' | 'REPORT';
export type WorksiteReferenceRole = 'MANAGER' | 'SUPERVISOR' | 'CONTACT';

// User types
export interface User {
  id: string;
  profileImageUrl?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  userType: UserType;
}

export interface TechnicianUser extends User {
  userType: 'TECHNICIAN';
}

export interface AdministrativeUser extends User {
  userType: 'ADMINISTRATION';
}

export interface SellerUser extends User {
  userType: 'SELLER';
  soldWorks?: Work[];
}

// Client & Plant
export interface Client {
  id: string;
  name: string;
  type: ClientType;
}

export interface Plant {
  id: string;
  name: string;
  notes: string;
  nasDirectory: string;
  pswPhrase: string;
  pswPlatform: string;
  pswStation: string;
}

// Work types
export interface Work {
  id: string;
  name: string;
  bidNumber: string;
  orderNumber: string;
  orderDate: string;
  electricalSchemaProgression: number;
  programmingProgression: number;
  expectedStartDate?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  invoiced: boolean;
  invoicedAt?: string;
  nasSubDirectory: string;
  expectedOfficeHours: number;
  expectedPlantHours: number;
  seller?: SellerUser;
  plant?: Plant;
  atixClient?: Client;
  finalClient?: Client;
  ticket?: Ticket;
  workReport?: WorkReport;
  assignments?: WorkAssignment[];
}

export interface WorkAssignment {
  id: string;
  assignedAt: string;
  work?: Work;
  user?: User;
}

export interface WorkReport {
  id: string;
  totalHours: number;
  createdAt: string;
  work?: Work;
  entries?: WorkReportEntry[];
}

export interface WorkReportEntry {
  id: string;
  description: string;
  hours: number;
  report?: WorkReport;
}

// Ticket
export interface Ticket {
  id: string;
  senderEmail?: string;
  name: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  orderNumber?: Work;
}

// Worksite Reference
export interface WorksiteReference {
  id: string;
  name: string;
}

export interface WorksiteReferenceAssignment {
  id: string;
  role: WorksiteReferenceRole;
  work?: Work;
  worksiteReference?: WorksiteReference;
}

// Attachment
export interface Attachment {
  id: string;
  url: string;
  publicId: string;
  resourceType: string;
  type: AttachmentType;
  uploadedAt: string;
}

export interface AttachmentLink {
  id: string;
  targetType: AttachmentTargetType;
  targetId: string;
  attachment?: Attachment;
}

// Dashboard
export interface DashboardSummary {
  clientCount: number;
  plantCount: number;
  completedWorkCount: number;
  pendingWorkCount: number;
  ticketStatusCounts: { status: TicketStatus; count: number }[];
  recentWorks: Work[];
  recentTickets: Ticket[];
}

// API Response types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
