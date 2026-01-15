export type ConditionStatus =
  | 'New'
  | 'Need Brw Request'
  | 'Requested'
  | 'Processor to Review'
  | 'Ready for UW'
  | 'Cleared'
  | 'Not Cleared';

export type DocRequestStatus = 'New' | 'Need to Request' | 'Pending' | 'Complete';

export type DocumentStatus = 'Need to Review' | 'Reviewed' | 'Approved' | 'Inactive';

export type SourceType = 'BRW' | 'INT';

export type ConditionClass = 'UW' | 'Processor III';

export type Stage =
  | 'Suspend'
  | 'Prior to Docs'
  | 'Prior to Funding'
  | 'Prior to Purchase'
  | 'Post Funding'
  | 'Trailing Docs';

export type FulfillmentParty = 'APP1' | 'B1' | 'CB1';

export type PartyParent = 'APP1' | 'APP2' | 'EXT';

export type FlagColor = 'red' | 'blue' | 'yellow' | 'green';

export interface UserConditionFlag {
  id: string;
  user_id?: string;
  role: string;
  condition_id: string;
  flag_color: FlagColor;
  created_at: string;
}

export type CategoryCode =
  | 'APP'
  | 'DISC'
  | 'CRED'
  | 'INC'
  | 'ASSET'
  | 'PROP'
  | 'MISC'
  | 'CLSNG'
  | 'TITLE'
  | 'GOV'
  | 'BOND'
  | 'SP'
  | 'CONDO'
  | 'NEW CONST'
  | 'RENO/HOLDBACK'
  | 'CORR REGS'
  | 'CORR CREDIT'
  | 'CORR LEGAL'
  | 'CORR JUMBO'
  | 'CONST TO PERM'
  | 'TXA-6'
  | 'DHHL 184-A'
  | 'COOP'
  | 'EMP'
  | 'APPR'
  | 'INSUR';

export interface DocRequest {
  id: string;
  condition_id: string;
  fulfillment_party: FulfillmentParty;
  document_type: string;
  description_for_borrower: string | null;
  status: DocRequestStatus;
  requested_date: string | null;
  created_at: string;
}

export interface ConditionNote {
  id: string;
  condition_id: string;
  author_name: string;
  author_role: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ConditionDocument {
  id: string;
  loan_id: string | null;
  doc_request_id: string | null;
  document_name: string;
  document_type: string | null;
  description: string | null;
  expiration_date: string | null;
  status: DocumentStatus;
  created_at: string;
  file_url: string | null;
  thumbnail_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  original_filename: string | null;
  page_count: number | null;
  document_for_party_id: string | null;
  created_by: string | null;
  created_on: string | null;
  modified_by: string | null;
  modified_on: string | null;
}

export interface DocumentNote {
  id: string;
  document_id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

export interface ConditionDocumentWithNotes extends ConditionDocument {
  notes: DocumentNote[];
}

export interface Condition {
  id: string;
  category: CategoryCode;
  condition_id: string;
  title: string;
  description: string;
  source_type: SourceType;
  condition_class: ConditionClass;
  stage: Stage;
  status: ConditionStatus;
  status_date: string;
  status_set_by: string;
  loan_id: string | null;
  created_at: string;
  follow_up_flag: boolean;
  expiration_date: string | null;
  follow_up_date: string | null;
  exception_requested_date: string | null;
  exception_status: string | null;
  new_date: string | null;
  need_brw_request_date: string | null;
  requested_date: string | null;
  processor_to_review_date: string | null;
  ready_for_uw_date: string | null;
  cleared_date: string | null;
  not_cleared_date: string | null;
  doc_requests?: DocRequest[];
  notes?: ConditionNote[];
  documents?: ConditionDocument[];
}

export interface ConditionWithRelations extends Condition {
  doc_requests: DocRequest[];
  notes: ConditionNote[];
  documents: ConditionDocument[];
}

export type ViewFilter = 'All' | 'Active' | 'Cleared' | 'Ready for UW';

export type PageFilter =
  | 'none'
  | 'need_to_request'
  | 'requested'
  | 'send_brw_reminder'
  | 'review_docs';

export const STAGE_ORDER: Stage[] = [
  'Suspend',
  'Prior to Docs',
  'Prior to Funding',
  'Prior to Purchase',
  'Post Funding',
  'Trailing Docs',
];

export const STATUS_OPTIONS: ConditionStatus[] = [
  'New',
  'Need Brw Request',
  'Requested',
  'Processor to Review',
  'Ready for UW',
  'Cleared',
  'Not Cleared',
];

export const CATEGORY_OPTIONS: string[] = [
  'APP',
  'DISC',
  'CRED',
  'INC',
  'ASSET',
  'PROP',
  'MISC',
  'CLSNG',
  'TITLE',
  'GOV',
  'BOND',
  'SP',
  'CONDO',
  'NEW CONST',
  'RENO/HOLDBACK',
  'CORR REGS',
  'CORR CREDIT',
  'CORR LEGAL',
  'CORR JUMBO',
  'CONST TO PERM',
  'TXA-6',
  'DHHL 184-A',
  'COOP',
];

export const DOCUMENT_TYPE_OPTIONS: string[] = [
  'Appraisal',
  'Asset Statements',
  'Bank Statements',
  'Employment Verification',
  'Flood Insurance Binder',
  'Gift Letter',
  'Hazard Insurance Binder',
  'Homeowners Insurance',
  'Mortgage Insurance',
  'Pay Stubs',
  'Purchase Agreement',
  'Tax Returns',
  'Title Insurance',
  'W-2 Forms',
  'Miscellaneous',
];

export const DOCUMENT_STATUS_OPTIONS: DocumentStatus[] = [
  'Need to Review',
  'Reviewed',
  'Approved',
  'Inactive',
];

export const STAGE_DISPLAY_MAP: Record<string, string> = {
  'Suspend': 'SUSP',
  'Prior to Docs': 'PTD',
  'Prior to Funding': 'PTF',
  'Prior to Purchase': 'PTP',
  'Post Funding': 'POST',
  'Trailing Docs': 'TRAIL',
};

export const CLASS_OPTIONS: ConditionClass[] = ['UW', 'Processor III'];

export const FLAG_COLOR_OPTIONS: { value: FlagColor; label: string }[] = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
];

export const FLAG_COLORS: Record<FlagColor, { bg: string; text: string; ring: string }> = {
  red: { bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-500' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', ring: 'ring-yellow-500' },
  green: { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500' },
};

export interface AvailableCondition {
  id: string;
  category: string;
  condition_id: string;
  title: string;
  description: string;
  source_type: SourceType;
  condition_class: ConditionClass;
  default_stage: Stage;
  created_at: string;
}

export interface LoanParty {
  id: string;
  loan_id: string;
  party_type: string;
  party_name: string;
  parent: PartyParent;
  created_at: string;
}

export interface CustomList {
  id: string;
  user_id: string | null;
  name: string;
  created_at: string;
}

export interface CustomListCondition {
  id: string;
  list_id: string;
  available_condition_id: string;
}

export interface PendingCondition {
  temp_id: string;
  available_condition: AvailableCondition;
  selected_party_id: string | null;
  is_newly_added: boolean;
  edited_title?: string;
  edited_description?: string;
}

export interface CurrentConditionDisplay {
  id: string;
  condition_id: string;
  title: string;
  description: string;
  source_type: SourceType;
  party_display: string | null;
  is_committed: boolean;
}

export interface CustomConditionTemplate {
  id: string;
  user_id: string | null;
  category: string;
  condition_number: number;
  title: string;
  description: string;
  source_type: SourceType;
  condition_class: ConditionClass;
  default_stage: Stage;
  created_at: string;
}

export interface CustomConditionFormState {
  title: string;
  description: string;
  category: string;
  status: ConditionStatus;
  stage: Stage;
  condition_class: ConditionClass;
  source_type: SourceType;
  save_as_template: boolean;
}

export interface PendingCustomCondition {
  temp_id: string;
  category: string;
  condition_number: number;
  condition_id: string;
  title: string;
  description: string;
  source_type: SourceType;
  condition_class: ConditionClass;
  stage: Stage;
  status: ConditionStatus;
  flag_color: FlagColor | null;
  save_as_template: boolean;
  selected_party_id: string | null;
  is_custom: true;
  doc_requests: Array<{
    fulfillment_party: string;
    document_type: string;
    description_for_borrower: string | null;
  }>;
  notes: Array<{
    author_name: string;
    author_role: string;
    content: string;
  }>;
}

export type LoanStatus =
  | 'Disclosed'
  | 'File Received'
  | 'UW Received'
  | 'Approved'
  | 'Conditions for Review'
  | 'Changes to UW'
  | 'Clear to Close';

export interface Loan {
  id: string;
  loan_number: string;
  description: string;
  status: LoanStatus;
  created_at: string;
}

export const LOAN_STATUS_OPTIONS: LoanStatus[] = [
  'Disclosed',
  'File Received',
  'UW Received',
  'Approved',
  'Conditions for Review',
  'Changes to UW',
  'Clear to Close',
];

export const LOAN_STATUS_COLORS: Record<LoanStatus, { bg: string; text: string }> = {
  'Disclosed': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'File Received': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'UW Received': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Approved': { bg: 'bg-green-100', text: 'text-green-700' },
  'Conditions for Review': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Changes to UW': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Clear to Close': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

export const PROCESSOR_STATUS_SORT_ORDER: Record<ConditionStatus, number> = {
  'Processor to Review': 1,
  'Need Brw Request': 2,
  'New': 3,
  'Not Cleared': 4,
  'Requested': 5,
  'Ready for UW': 6,
  'Cleared': 7,
};

export const UNDERWRITER_STATUS_SORT_ORDER: Record<ConditionStatus, number> = {
  'Ready for UW': 1,
  'Requested': 2,
  'Need Brw Request': 3,
  'New': 4,
  'Not Cleared': 5,
  'Processor to Review': 6,
  'Cleared': 7,
};

export interface DocumentConditionAssociation {
  id: string;
  document_id: string;
  condition_id: string;
  created_at: string;
}

export interface PendingDocumentAssociation {
  tempId: string;
  conditionId: string;
  pendingStatus: ConditionStatus | null;
  isNew: boolean;
}
