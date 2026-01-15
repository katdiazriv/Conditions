import { supabase } from './supabaseAdmin';

const RESET_FLAG = process.argv.includes('--reset');

function generateUUID(): string {
  return crypto.randomUUID();
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

const LOAN_IDS = {
  loan1: generateUUID(),
  loan2: generateUUID(),
  loan3: generateUUID(),
  loan4: generateUUID(),
};

const PARTY_IDS = {
  loan1_borrower: generateUUID(),
  loan1_coborrower: generateUUID(),
  loan1_app1: generateUUID(),
  loan2_borrower: generateUUID(),
  loan2_coborrower: generateUUID(),
  loan2_app1: generateUUID(),
  loan3_borrower: generateUUID(),
  loan3_coborrower: generateUUID(),
  loan3_app1: generateUUID(),
  loan4_borrower: generateUUID(),
  loan4_coborrower: generateUUID(),
  loan4_app1: generateUUID(),
};

const CONDITION_IDS = {
  cond1: generateUUID(),
  cond2: generateUUID(),
  cond3: generateUUID(),
  cond4: generateUUID(),
  cond5: generateUUID(),
  cond6: generateUUID(),
  cond7: generateUUID(),
  cond8: generateUUID(),
  cond9: generateUUID(),
  cond10: generateUUID(),
  cond11: generateUUID(),
  cond12: generateUUID(),
  cond13: generateUUID(),
  cond14: generateUUID(),
  cond15: generateUUID(),
  cond16: generateUUID(),
  cond17: generateUUID(),
  cond18: generateUUID(),
  cond19: generateUUID(),
  cond20: generateUUID(),
  cond21: generateUUID(),
  cond22: generateUUID(),
  cond23: generateUUID(),
  cond24: generateUUID(),
  cond25: generateUUID(),
  cond26: generateUUID(),
  cond27: generateUUID(),
  cond28: generateUUID(),
  cond29: generateUUID(),
  cond30: generateUUID(),
  cond31: generateUUID(),
  cond32: generateUUID(),
  cond33: generateUUID(),
  cond34: generateUUID(),
  cond35: generateUUID(),
  cond36: generateUUID(),
  cond37: generateUUID(),
  cond38: generateUUID(),
  cond39: generateUUID(),
  cond40: generateUUID(),
  cond41: generateUUID(),
  cond42: generateUUID(),
  cond43: generateUUID(),
  cond44: generateUUID(),
  cond45: generateUUID(),
  cond46: generateUUID(),
  cond47: generateUUID(),
  cond48: generateUUID(),
  cond49: generateUUID(),
  cond50: generateUUID(),
  cond51: generateUUID(),
  cond52: generateUUID(),
  cond53: generateUUID(),
  cond54: generateUUID(),
  cond55: generateUUID(),
  cond56: generateUUID(),
  cond57: generateUUID(),
  cond58: generateUUID(),
  cond59: generateUUID(),
  cond60: generateUUID(),
};

const DOC_REQUEST_IDS = {
  dr1: generateUUID(),
  dr2: generateUUID(),
  dr3: generateUUID(),
  dr4: generateUUID(),
  dr5: generateUUID(),
  dr6: generateUUID(),
  dr7: generateUUID(),
  dr8: generateUUID(),
  dr9: generateUUID(),
  dr10: generateUUID(),
  dr11: generateUUID(),
  dr12: generateUUID(),
  dr13: generateUUID(),
  dr14: generateUUID(),
  dr15: generateUUID(),
  dr16: generateUUID(),
  dr17: generateUUID(),
  dr18: generateUUID(),
  dr19: generateUUID(),
  dr20: generateUUID(),
  dr21: generateUUID(),
  dr22: generateUUID(),
  dr23: generateUUID(),
  dr24: generateUUID(),
  dr25: generateUUID(),
  dr26: generateUUID(),
  dr27: generateUUID(),
  dr28: generateUUID(),
  dr29: generateUUID(),
  dr30: generateUUID(),
};

const DOCUMENT_IDS = {
  doc1: generateUUID(),
  doc2: generateUUID(),
  doc3: generateUUID(),
  doc4: generateUUID(),
  doc5: generateUUID(),
  doc6: generateUUID(),
  doc7: generateUUID(),
  doc8: generateUUID(),
};

const NOTE_IDS = {
  note1: generateUUID(),
  note2: generateUUID(),
  note3: generateUUID(),
  note4: generateUUID(),
  note5: generateUUID(),
  note6: generateUUID(),
  note7: generateUUID(),
  note8: generateUUID(),
  note9: generateUUID(),
  note10: generateUUID(),
};

const CUSTOM_LIST_IDS = {
  list1: generateUUID(),
  list2: generateUUID(),
};

const AVAILABLE_CONDITION_IDS: Record<string, string> = {};
for (let i = 1; i <= 80; i++) {
  AVAILABLE_CONDITION_IDS[`ac${i}`] = generateUUID();
}

const loansData = [
  {
    id: LOAN_IDS.loan1,
    loan_number: '2024-001234',
    description: 'Johnson Residence - Purchase',
    status: 'Conditions for Review',
  },
  {
    id: LOAN_IDS.loan2,
    loan_number: '2024-001567',
    description: 'Martinez Family - Refinance',
    status: 'UW Received',
  },
  {
    id: LOAN_IDS.loan3,
    loan_number: '2024-001890',
    description: 'Thompson Estate - Purchase',
    status: 'Approved',
  },
  {
    id: LOAN_IDS.loan4,
    loan_number: '2024-002123',
    description: 'Williams Investment Property',
    status: 'File Received',
  },
];

const loanPartiesData = [
  {
    id: PARTY_IDS.loan1_borrower,
    loan_id: LOAN_IDS.loan1,
    party_type: 'Borrower',
    party_name: 'Michael Johnson',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan1_coborrower,
    loan_id: LOAN_IDS.loan1,
    party_type: 'Co-Borrower',
    party_name: 'Sarah Johnson',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan1_app1,
    loan_id: LOAN_IDS.loan1,
    party_type: 'APP1',
    party_name: 'Michael & Sarah Johnson',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan2_borrower,
    loan_id: LOAN_IDS.loan2,
    party_type: 'Borrower',
    party_name: 'Carlos Martinez',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan2_coborrower,
    loan_id: LOAN_IDS.loan2,
    party_type: 'Co-Borrower',
    party_name: 'Maria Martinez',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan2_app1,
    loan_id: LOAN_IDS.loan2,
    party_type: 'APP1',
    party_name: 'Carlos & Maria Martinez',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan3_borrower,
    loan_id: LOAN_IDS.loan3,
    party_type: 'Borrower',
    party_name: 'David Thompson',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan3_coborrower,
    loan_id: LOAN_IDS.loan3,
    party_type: 'Co-Borrower',
    party_name: 'Emily Thompson',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan3_app1,
    loan_id: LOAN_IDS.loan3,
    party_type: 'APP1',
    party_name: 'David & Emily Thompson',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan4_borrower,
    loan_id: LOAN_IDS.loan4,
    party_type: 'Borrower',
    party_name: 'James Williams',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan4_coborrower,
    loan_id: LOAN_IDS.loan4,
    party_type: 'Co-Borrower',
    party_name: 'Patricia Williams',
    parent: 'APP1',
  },
  {
    id: PARTY_IDS.loan4_app1,
    loan_id: LOAN_IDS.loan4,
    party_type: 'APP1',
    party_name: 'James & Patricia Williams',
    parent: 'APP1',
  },
];

const availableConditionsData = [
  { id: AVAILABLE_CONDITION_IDS.ac1, category: 'INC', condition_id: 'INC-001', title: 'Verify Employment', description: 'Verbal VOE from current employer verifying employment status, title, and income', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac2, category: 'INC', condition_id: 'INC-002', title: 'Pay Stubs Required', description: 'Most recent 30 days of consecutive pay stubs showing YTD earnings', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac3, category: 'INC', condition_id: 'INC-003', title: 'W-2 Forms', description: 'W-2 forms for the most recent 2 years', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac4, category: 'INC', condition_id: 'INC-004', title: 'Tax Returns', description: 'Complete signed federal tax returns for the most recent 2 years including all schedules', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac5, category: 'ASSET', condition_id: 'ASSET-001', title: 'Bank Statements', description: 'Most recent 2 months bank statements for all accounts showing sufficient funds for closing', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac6, category: 'ASSET', condition_id: 'ASSET-002', title: 'Gift Letter', description: 'Gift letter from donor confirming funds are a gift with no expectation of repayment', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac7, category: 'ASSET', condition_id: 'ASSET-003', title: 'Retirement Account Statement', description: 'Most recent retirement account statement(s) showing vested balance', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac8, category: 'CRED', condition_id: 'CRED-001', title: 'Letter of Explanation', description: 'Written explanation for credit inquiries in the last 120 days', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac9, category: 'CRED', condition_id: 'CRED-002', title: 'Collection Account Resolution', description: 'Documentation showing collection accounts have been paid or are in payment plan', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac10, category: 'PROP', condition_id: 'PROP-001', title: 'Appraisal Report', description: 'Full appraisal report with interior/exterior photos and comparable sales analysis', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac11, category: 'PROP', condition_id: 'PROP-002', title: 'Purchase Agreement', description: 'Fully executed purchase agreement with all addendums and amendments', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac12, category: 'PROP', condition_id: 'PROP-003', title: 'HOA Documents', description: 'HOA certification, budget, and insurance documentation if applicable', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac13, category: 'TITLE', condition_id: 'TITLE-001', title: 'Title Commitment', description: 'Preliminary title report/commitment with all exceptions listed', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac14, category: 'TITLE', condition_id: 'TITLE-002', title: 'Title Insurance', description: 'Title insurance policy meeting investor requirements', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac15, category: 'INSUR', condition_id: 'INSUR-001', title: 'Hazard Insurance', description: 'Evidence of hazard insurance with proper coverage amounts and mortgagee clause', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac16, category: 'INSUR', condition_id: 'INSUR-002', title: 'Flood Insurance', description: 'Flood insurance policy if property is in a flood zone', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac17, category: 'CLSNG', condition_id: 'CLSNG-001', title: 'Final Closing Disclosure', description: 'Final Closing Disclosure reviewed and approved by all parties', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac18, category: 'CLSNG', condition_id: 'CLSNG-002', title: 'Wire Instructions', description: 'Verified wire instructions for funds disbursement', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac19, category: 'APP', condition_id: 'APP-001', title: 'Updated 1003 Application', description: 'Signed and dated final loan application reflecting current loan terms', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac20, category: 'APP', condition_id: 'APP-002', title: 'Government ID', description: 'Copy of valid government-issued photo ID for all borrowers', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac21, category: 'GOV', condition_id: 'GOV-001', title: 'VA Certificate of Eligibility', description: 'Current Certificate of Eligibility from VA', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac22, category: 'GOV', condition_id: 'GOV-002', title: 'FHA Case Number Assignment', description: 'FHA case number assignment confirmation', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac23, category: 'DISC', condition_id: 'DISC-001', title: 'Initial Disclosures', description: 'Signed initial disclosure package including LE, GFE as applicable', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac24, category: 'MISC', condition_id: 'MISC-001', title: 'Divorce Decree', description: 'Final divorce decree with property settlement agreement if applicable', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac25, category: 'MISC', condition_id: 'MISC-002', title: 'Power of Attorney', description: 'Recorded Power of Attorney if borrower will not be present at closing', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac26, category: 'INC', condition_id: 'INC-005', title: 'Self-Employment Documentation', description: 'Business license, profit/loss statement, and business bank statements for self-employed borrowers', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac27, category: 'INC', condition_id: 'INC-006', title: 'Rental Income Documentation', description: 'Lease agreements and proof of rental income for investment properties', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac28, category: 'ASSET', condition_id: 'ASSET-004', title: 'Source of Down Payment', description: 'Documentation of source and seasoning of down payment funds', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac29, category: 'PROP', condition_id: 'PROP-004', title: 'Termite Inspection', description: 'Wood destroying insect inspection report if required by jurisdiction or investor', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac30, category: 'CONDO', condition_id: 'CONDO-001', title: 'Condo Questionnaire', description: 'Completed condo/PUD questionnaire with required attachments', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac31, category: 'INC', condition_id: 'INC-007', title: 'Social Security Award Letter', description: 'Current Social Security award letter showing benefit amount and effective date', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac32, category: 'INC', condition_id: 'INC-008', title: 'Pension Income Verification', description: 'Pension award letter or 1099-R showing pension income amount', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac33, category: 'INC', condition_id: 'INC-009', title: 'Child Support Documentation', description: 'Court order and proof of receipt for child support income', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac34, category: 'INC', condition_id: 'INC-010', title: 'Alimony Documentation', description: 'Divorce decree and proof of receipt for alimony income', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac35, category: 'INC', condition_id: 'INC-011', title: 'Bonus/Commission Letter', description: 'Employer letter confirming bonus/commission structure and history', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac36, category: 'INC', condition_id: 'INC-012', title: 'Overtime Verification', description: 'Documentation of consistent overtime history for income qualification', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac37, category: 'ASSET', condition_id: 'ASSET-005', title: 'Stock/Bond Statement', description: 'Recent brokerage statement showing stock and bond holdings', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac38, category: 'ASSET', condition_id: 'ASSET-006', title: 'Gift Funds Wire Transfer', description: 'Wire transfer confirmation showing gift funds deposited to borrower account', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac39, category: 'ASSET', condition_id: 'ASSET-007', title: 'Earnest Money Verification', description: 'Proof of earnest money deposit including check copy and deposit receipt', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac40, category: 'ASSET', condition_id: 'ASSET-008', title: 'Sale of Assets Documentation', description: 'Bill of sale and proof of deposit for proceeds from asset sale', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac41, category: 'CRED', condition_id: 'CRED-003', title: 'Bankruptcy Discharge', description: 'Bankruptcy discharge papers and schedule of debts', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac42, category: 'CRED', condition_id: 'CRED-004', title: 'Foreclosure Documentation', description: 'Documentation of prior foreclosure with deed-in-lieu or short sale paperwork', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac43, category: 'CRED', condition_id: 'CRED-005', title: 'Mortgage Rating Verification', description: 'VOM or credit supplement verifying mortgage payment history', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac44, category: 'CRED', condition_id: 'CRED-006', title: 'Student Loan Payment Status', description: 'Documentation of student loan IBR or deferment status', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac45, category: 'PROP', condition_id: 'PROP-005', title: 'Survey', description: 'Property survey showing boundaries and any encroachments', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac46, category: 'PROP', condition_id: 'PROP-006', title: 'Well/Septic Inspection', description: 'Well water test and septic inspection report for rural properties', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac47, category: 'PROP', condition_id: 'PROP-007', title: 'Lead Paint Disclosure', description: 'Lead-based paint disclosure for properties built before 1978', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac48, category: 'PROP', condition_id: 'PROP-008', title: 'Appraisal Recertification', description: 'Appraisal recertification of value if original appraisal is aging', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac49, category: 'TITLE', condition_id: 'TITLE-003', title: 'Payoff Statement', description: 'Payoff statement from existing lienholder for refinance transactions', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac50, category: 'TITLE', condition_id: 'TITLE-004', title: 'Subordination Agreement', description: 'Subordination agreement for existing liens remaining in place', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac51, category: 'TITLE', condition_id: 'TITLE-005', title: 'Deed Copy', description: 'Copy of recorded deed showing current vesting', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac52, category: 'INSUR', condition_id: 'INSUR-003', title: 'Wind/Hail Insurance', description: 'Separate wind/hail insurance policy if required by location', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac53, category: 'INSUR', condition_id: 'INSUR-004', title: 'Earthquake Insurance', description: 'Earthquake insurance policy if required by investor or location', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac54, category: 'INSUR', condition_id: 'INSUR-005', title: 'Condo Master Policy', description: 'HOA master insurance policy with adequate coverage', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac55, category: 'CLSNG', condition_id: 'CLSNG-003', title: 'Signed Note and Deed', description: 'Executed promissory note and deed of trust/mortgage', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac56, category: 'CLSNG', condition_id: 'CLSNG-004', title: 'Closing Protection Letter', description: 'Closing protection letter from title company', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac57, category: 'CLSNG', condition_id: 'CLSNG-005', title: 'Final Inspection', description: 'Final inspection confirming completion of required repairs', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  { id: AVAILABLE_CONDITION_IDS.ac58, category: 'APP', condition_id: 'APP-003', title: 'Social Security Card', description: 'Copy of Social Security card for all borrowers', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac59, category: 'APP', condition_id: 'APP-004', title: 'Residency Documentation', description: 'Green card or visa documentation for non-citizen borrowers', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac60, category: 'APP', condition_id: 'APP-005', title: 'Name Change Documentation', description: 'Marriage certificate or court order for name discrepancies', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac61, category: 'GOV', condition_id: 'GOV-003', title: 'VA Appraisal', description: 'VA appraisal with Notice of Value and required conditions', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac62, category: 'GOV', condition_id: 'GOV-004', title: 'FHA Appraisal', description: 'FHA appraisal meeting HUD minimum property requirements', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac63, category: 'GOV', condition_id: 'GOV-005', title: 'USDA Eligibility', description: 'USDA property and income eligibility determination', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac64, category: 'GOV', condition_id: 'GOV-006', title: 'MI Certificate', description: 'Mortgage insurance certificate or commitment letter', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac65, category: 'DISC', condition_id: 'DISC-002', title: 'Revised Loan Estimate', description: 'Signed revised loan estimate reflecting changed circumstances', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac66, category: 'DISC', condition_id: 'DISC-003', title: 'Intent to Proceed', description: 'Signed borrower intent to proceed with loan application', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac67, category: 'DISC', condition_id: 'DISC-004', title: 'TRID Compliance Package', description: 'Complete TRID disclosure package with all required forms', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac68, category: 'MISC', condition_id: 'MISC-003', title: 'Trust Documentation', description: 'Complete trust agreement and certification for trust-held property', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac69, category: 'MISC', condition_id: 'MISC-004', title: 'LLC Documentation', description: 'LLC operating agreement and articles of organization', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac70, category: 'MISC', condition_id: 'MISC-005', title: 'Housing Counseling Certificate', description: 'HUD-approved housing counseling completion certificate', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac71, category: 'CONDO', condition_id: 'CONDO-002', title: 'Condo Project Approval', description: 'Condo project approval documentation from investor', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac72, category: 'CONDO', condition_id: 'CONDO-003', title: 'HOA Budget Review', description: 'Current HOA budget and reserve study analysis', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac73, category: 'CONDO', condition_id: 'CONDO-004', title: 'Litigation Search', description: 'HOA litigation search showing no adverse pending litigation', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac74, category: 'INC', condition_id: 'INC-013', title: '4506-C Tax Transcript', description: 'IRS Form 4506-C request for tax return transcripts', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac75, category: 'INC', condition_id: 'INC-014', title: 'CPA Letter', description: 'CPA letter confirming self-employment income and business viability', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac76, category: 'ASSET', condition_id: 'ASSET-009', title: 'Large Deposit Explanation', description: 'Explanation and documentation for large deposits on bank statements', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac77, category: 'ASSET', condition_id: 'ASSET-010', title: 'Business Asset Statement', description: 'Business bank statement for self-employed borrowers using business funds', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac78, category: 'PROP', condition_id: 'PROP-009', title: 'Rent Schedule', description: 'Appraisal rent schedule for investment property income calculation', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac79, category: 'PROP', condition_id: 'PROP-010', title: 'Property Tax Statement', description: 'Current property tax statement showing annual taxes due', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
  { id: AVAILABLE_CONDITION_IDS.ac80, category: 'CLSNG', condition_id: 'CLSNG-006', title: 'Compliance Certificate', description: 'Final compliance review certificate confirming loan meets guidelines', source_type: 'INT', condition_class: 'UW', default_stage: 'Prior to Funding' },
];

const customListsData = [
  {
    id: CUSTOM_LIST_IDS.list1,
    user_id: null,
    name: 'Frequently Used',
  },
  {
    id: CUSTOM_LIST_IDS.list2,
    user_id: null,
    name: 'FHA Loans',
  },
];

const customListConditionsData = [
  { id: generateUUID(), list_id: CUSTOM_LIST_IDS.list1, available_condition_id: AVAILABLE_CONDITION_IDS.ac2 },
  { id: generateUUID(), list_id: CUSTOM_LIST_IDS.list1, available_condition_id: AVAILABLE_CONDITION_IDS.ac3 },
  { id: generateUUID(), list_id: CUSTOM_LIST_IDS.list1, available_condition_id: AVAILABLE_CONDITION_IDS.ac5 },
  { id: generateUUID(), list_id: CUSTOM_LIST_IDS.list1, available_condition_id: AVAILABLE_CONDITION_IDS.ac15 },
  { id: generateUUID(), list_id: CUSTOM_LIST_IDS.list1, available_condition_id: AVAILABLE_CONDITION_IDS.ac11 },
  { id: generateUUID(), list_id: CUSTOM_LIST_IDS.list2, available_condition_id: AVAILABLE_CONDITION_IDS.ac22 },
  { id: generateUUID(), list_id: CUSTOM_LIST_IDS.list2, available_condition_id: AVAILABLE_CONDITION_IDS.ac4 },
  { id: generateUUID(), list_id: CUSTOM_LIST_IDS.list2, available_condition_id: AVAILABLE_CONDITION_IDS.ac10 },
];

const customConditionTemplatesData = [
  {
    id: generateUUID(),
    user_id: null,
    category: 'MISC',
    condition_number: 1,
    title: 'Social Security Award Letter',
    description: 'Current Social Security award letter showing benefit amount',
    source_type: 'BRW',
    condition_class: 'Processor III',
    default_stage: 'Prior to Docs',
  },
  {
    id: generateUUID(),
    user_id: null,
    category: 'INC',
    condition_number: 2,
    title: 'Bonus/Commission History',
    description: 'Documentation of bonus/commission history for the past 2 years',
    source_type: 'BRW',
    condition_class: 'UW',
    default_stage: 'Prior to Docs',
  },
  {
    id: generateUUID(),
    user_id: null,
    category: 'PROP',
    condition_number: 3,
    title: 'Well/Septic Inspection',
    description: 'Well water test and septic inspection report for rural properties',
    source_type: 'INT',
    condition_class: 'Processor III',
    default_stage: 'Prior to Funding',
  },
];

const conditionsData = [
  { id: CONDITION_IDS.cond1, loan_id: LOAN_IDS.loan1, category: 'INC', condition_id: 'INC-002', title: 'Pay Stubs Required', description: 'Most recent 30 days of consecutive pay stubs showing YTD earnings', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Requested', status_date: daysAgo(3), status_set_by: 'Sarah Processor', new_date: daysAgo(7), need_brw_request_date: daysAgo(5), requested_date: daysAgo(3), follow_up_flag: false },
  { id: CONDITION_IDS.cond2, loan_id: LOAN_IDS.loan1, category: 'ASSET', condition_id: 'ASSET-001', title: 'Bank Statements', description: 'Most recent 2 months bank statements for all accounts showing sufficient funds for closing', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Processor to Review', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(10), need_brw_request_date: daysAgo(8), requested_date: daysAgo(5), processor_to_review_date: daysAgo(1), follow_up_flag: true, follow_up_date: daysFromNow(2) },
  { id: CONDITION_IDS.cond3, loan_id: LOAN_IDS.loan1, category: 'PROP', condition_id: 'PROP-001', title: 'Appraisal Report', description: 'Full appraisal report with interior/exterior photos and comparable sales analysis', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'Ready for UW', status_date: daysAgo(2), status_set_by: 'Sarah Processor', new_date: daysAgo(14), ready_for_uw_date: daysAgo(2), follow_up_flag: false },
  { id: CONDITION_IDS.cond4, loan_id: LOAN_IDS.loan1, category: 'CRED', condition_id: 'CRED-001', title: 'Letter of Explanation', description: 'Written explanation for credit inquiries in the last 120 days', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(2), status_set_by: 'Urma Underwriter', new_date: daysAgo(5), need_brw_request_date: daysAgo(2), follow_up_flag: false },
  { id: CONDITION_IDS.cond5, loan_id: LOAN_IDS.loan1, category: 'INSUR', condition_id: 'INSUR-001', title: 'Hazard Insurance', description: 'Evidence of hazard insurance with proper coverage amounts and mortgagee clause', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(12), need_brw_request_date: daysAgo(10), requested_date: daysAgo(8), processor_to_review_date: daysAgo(3), cleared_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond6, loan_id: LOAN_IDS.loan1, category: 'TITLE', condition_id: 'TITLE-001', title: 'Title Commitment', description: 'Preliminary title report/commitment with all exceptions listed', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond7, loan_id: LOAN_IDS.loan1, category: 'INC', condition_id: 'INC-001', title: 'Verify Employment', description: 'Verbal VOE from current employer verifying employment status, title, and income', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond8, loan_id: LOAN_IDS.loan1, category: 'INC', condition_id: 'INC-003', title: 'W-2 Forms', description: 'W-2 forms for the most recent 2 years', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Not Cleared', status_date: daysAgo(1), status_set_by: 'Urma Underwriter', new_date: daysAgo(10), need_brw_request_date: daysAgo(8), requested_date: daysAgo(5), processor_to_review_date: daysAgo(3), ready_for_uw_date: daysAgo(2), not_cleared_date: daysAgo(1), follow_up_flag: true, follow_up_date: daysFromNow(1) },
  { id: CONDITION_IDS.cond9, loan_id: LOAN_IDS.loan1, category: 'APP', condition_id: 'APP-001', title: 'Updated 1003 Application', description: 'Signed and dated final loan application reflecting current loan terms', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Requested', status_date: daysAgo(2), status_set_by: 'Sarah Processor', new_date: daysAgo(6), need_brw_request_date: daysAgo(4), requested_date: daysAgo(2), follow_up_flag: false },
  { id: CONDITION_IDS.cond10, loan_id: LOAN_IDS.loan1, category: 'APP', condition_id: 'APP-002', title: 'Government ID', description: 'Copy of valid government-issued photo ID for all borrowers', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(5), status_set_by: 'Sarah Processor', new_date: daysAgo(12), cleared_date: daysAgo(5), follow_up_flag: false },
  { id: CONDITION_IDS.cond11, loan_id: LOAN_IDS.loan1, category: 'DISC', condition_id: 'DISC-001', title: 'Initial Disclosures', description: 'Signed initial disclosure package including LE, GFE as applicable', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(10), status_set_by: 'Sarah Processor', new_date: daysAgo(14), cleared_date: daysAgo(10), follow_up_flag: false },
  { id: CONDITION_IDS.cond12, loan_id: LOAN_IDS.loan1, category: 'CLSNG', condition_id: 'CLSNG-001', title: 'Final Closing Disclosure', description: 'Final Closing Disclosure reviewed and approved by all parties', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond13, loan_id: LOAN_IDS.loan1, category: 'ASSET', condition_id: 'ASSET-009', title: 'Large Deposit Explanation', description: 'Explanation and documentation for large deposits on bank statements', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Urma Underwriter', new_date: daysAgo(2), need_brw_request_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond14, loan_id: LOAN_IDS.loan1, category: 'INC', condition_id: 'INC-013', title: '4506-C Tax Transcript', description: 'IRS Form 4506-C request for tax return transcripts', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Requested', status_date: daysAgo(4), status_set_by: 'Sarah Processor', new_date: daysAgo(7), requested_date: daysAgo(4), follow_up_flag: false },
  { id: CONDITION_IDS.cond15, loan_id: LOAN_IDS.loan1, category: 'PROP', condition_id: 'PROP-002', title: 'Purchase Agreement', description: 'Fully executed purchase agreement with all addendums and amendments', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(8), status_set_by: 'Sarah Processor', new_date: daysAgo(14), cleared_date: daysAgo(8), follow_up_flag: false },

  { id: CONDITION_IDS.cond16, loan_id: LOAN_IDS.loan2, category: 'INC', condition_id: 'INC-004', title: 'Tax Returns', description: 'Complete signed federal tax returns for the most recent 2 years including all schedules', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Requested', status_date: daysAgo(4), status_set_by: 'Sarah Processor', new_date: daysAgo(8), need_brw_request_date: daysAgo(6), requested_date: daysAgo(4), follow_up_flag: true, follow_up_date: daysFromNow(1), expiration_date: daysFromNow(30) },
  { id: CONDITION_IDS.cond17, loan_id: LOAN_IDS.loan2, category: 'ASSET', condition_id: 'ASSET-001', title: 'Bank Statements - Checking', description: 'Most recent 2 months bank statements for primary checking account', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Processor to Review', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(6), need_brw_request_date: daysAgo(5), requested_date: daysAgo(3), processor_to_review_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond18, loan_id: LOAN_IDS.loan2, category: 'TITLE', condition_id: 'TITLE-003', title: 'Payoff Statement', description: 'Payoff statement from existing lienholder for refinance transactions', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Ready for UW', status_date: daysAgo(2), status_set_by: 'Sarah Processor', new_date: daysAgo(10), ready_for_uw_date: daysAgo(2), follow_up_flag: false },
  { id: CONDITION_IDS.cond19, loan_id: LOAN_IDS.loan2, category: 'INC', condition_id: 'INC-005', title: 'Self-Employment Documentation', description: 'Business license, profit/loss statement, and business bank statements for self-employed borrowers', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Urma Underwriter', new_date: daysAgo(3), need_brw_request_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond20, loan_id: LOAN_IDS.loan2, category: 'ASSET', condition_id: 'ASSET-005', title: 'Bank Statements - Savings', description: 'Most recent 2 months bank statements for savings account', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Requested', status_date: daysAgo(2), status_set_by: 'Sarah Processor', new_date: daysAgo(5), need_brw_request_date: daysAgo(4), requested_date: daysAgo(2), follow_up_flag: false },
  { id: CONDITION_IDS.cond21, loan_id: LOAN_IDS.loan2, category: 'INC', condition_id: 'INC-002', title: 'Pay Stubs Required', description: 'Most recent 30 days of consecutive pay stubs showing YTD earnings', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(3), status_set_by: 'Sarah Processor', new_date: daysAgo(10), cleared_date: daysAgo(3), follow_up_flag: false },
  { id: CONDITION_IDS.cond22, loan_id: LOAN_IDS.loan2, category: 'INSUR', condition_id: 'INSUR-001', title: 'Hazard Insurance', description: 'Evidence of hazard insurance with proper coverage amounts and mortgagee clause', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(2), status_set_by: 'System', new_date: daysAgo(2), follow_up_flag: false },
  { id: CONDITION_IDS.cond23, loan_id: LOAN_IDS.loan2, category: 'APP', condition_id: 'APP-002', title: 'Government ID', description: 'Copy of valid government-issued photo ID for all borrowers', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(6), status_set_by: 'Sarah Processor', new_date: daysAgo(10), cleared_date: daysAgo(6), follow_up_flag: false },
  { id: CONDITION_IDS.cond24, loan_id: LOAN_IDS.loan2, category: 'INC', condition_id: 'INC-014', title: 'CPA Letter', description: 'CPA letter confirming self-employment income and business viability', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'Urma Underwriter', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond25, loan_id: LOAN_IDS.loan2, category: 'ASSET', condition_id: 'ASSET-010', title: 'Business Asset Statement', description: 'Business bank statement for self-employed borrowers using business funds', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Urma Underwriter', new_date: daysAgo(2), need_brw_request_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond26, loan_id: LOAN_IDS.loan2, category: 'PROP', condition_id: 'PROP-001', title: 'Appraisal Report', description: 'Full appraisal report with interior/exterior photos and comparable sales analysis', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(4), status_set_by: 'Urma Underwriter', new_date: daysAgo(12), cleared_date: daysAgo(4), follow_up_flag: false },
  { id: CONDITION_IDS.cond27, loan_id: LOAN_IDS.loan2, category: 'TITLE', condition_id: 'TITLE-001', title: 'Title Commitment', description: 'Preliminary title report/commitment with all exceptions listed', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(5), status_set_by: 'Sarah Processor', new_date: daysAgo(10), cleared_date: daysAgo(5), follow_up_flag: false },
  { id: CONDITION_IDS.cond28, loan_id: LOAN_IDS.loan2, category: 'CLSNG', condition_id: 'CLSNG-001', title: 'Final Closing Disclosure', description: 'Final Closing Disclosure reviewed and approved by all parties', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond29, loan_id: LOAN_IDS.loan2, category: 'INC', condition_id: 'INC-001', title: 'Verify Employment', description: 'Verbal VOE from current employer verifying employment status, title, and income', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },

  { id: CONDITION_IDS.cond30, loan_id: LOAN_IDS.loan3, category: 'INC', condition_id: 'INC-002', title: 'Pay Stubs Required', description: 'Most recent 30 days of consecutive pay stubs showing YTD earnings', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(3), status_set_by: 'Sarah Processor', new_date: daysAgo(15), need_brw_request_date: daysAgo(13), requested_date: daysAgo(10), processor_to_review_date: daysAgo(5), cleared_date: daysAgo(3), follow_up_flag: false },
  { id: CONDITION_IDS.cond31, loan_id: LOAN_IDS.loan3, category: 'ASSET', condition_id: 'ASSET-001', title: 'Bank Statements', description: 'Most recent 2 months bank statements for all accounts showing sufficient funds for closing', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(2), status_set_by: 'Urma Underwriter', new_date: daysAgo(14), need_brw_request_date: daysAgo(12), requested_date: daysAgo(9), processor_to_review_date: daysAgo(4), ready_for_uw_date: daysAgo(3), cleared_date: daysAgo(2), follow_up_flag: false },
  { id: CONDITION_IDS.cond32, loan_id: LOAN_IDS.loan3, category: 'CLSNG', condition_id: 'CLSNG-001', title: 'Final Closing Disclosure', description: 'Final Closing Disclosure reviewed and approved by all parties', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond33, loan_id: LOAN_IDS.loan3, category: 'TITLE', condition_id: 'TITLE-002', title: 'Title Insurance', description: 'Title insurance policy meeting investor requirements', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond34, loan_id: LOAN_IDS.loan3, category: 'INC', condition_id: 'INC-003', title: 'W-2 Forms', description: 'W-2 forms for the most recent 2 years', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(4), status_set_by: 'Sarah Processor', new_date: daysAgo(14), cleared_date: daysAgo(4), follow_up_flag: false },
  { id: CONDITION_IDS.cond35, loan_id: LOAN_IDS.loan3, category: 'PROP', condition_id: 'PROP-001', title: 'Appraisal Report', description: 'Full appraisal report with interior/exterior photos and comparable sales analysis', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(5), status_set_by: 'Urma Underwriter', new_date: daysAgo(14), cleared_date: daysAgo(5), follow_up_flag: false },
  { id: CONDITION_IDS.cond36, loan_id: LOAN_IDS.loan3, category: 'PROP', condition_id: 'PROP-002', title: 'Purchase Agreement', description: 'Fully executed purchase agreement with all addendums and amendments', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(12), status_set_by: 'Sarah Processor', new_date: daysAgo(15), cleared_date: daysAgo(12), follow_up_flag: false },
  { id: CONDITION_IDS.cond37, loan_id: LOAN_IDS.loan3, category: 'INSUR', condition_id: 'INSUR-001', title: 'Hazard Insurance', description: 'Evidence of hazard insurance with proper coverage amounts and mortgagee clause', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(3), status_set_by: 'Sarah Processor', new_date: daysAgo(10), cleared_date: daysAgo(3), follow_up_flag: false },
  { id: CONDITION_IDS.cond38, loan_id: LOAN_IDS.loan3, category: 'TITLE', condition_id: 'TITLE-001', title: 'Title Commitment', description: 'Preliminary title report/commitment with all exceptions listed', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(6), status_set_by: 'Sarah Processor', new_date: daysAgo(14), cleared_date: daysAgo(6), follow_up_flag: false },
  { id: CONDITION_IDS.cond39, loan_id: LOAN_IDS.loan3, category: 'APP', condition_id: 'APP-002', title: 'Government ID', description: 'Copy of valid government-issued photo ID for all borrowers', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(10), status_set_by: 'Sarah Processor', new_date: daysAgo(15), cleared_date: daysAgo(10), follow_up_flag: false },
  { id: CONDITION_IDS.cond40, loan_id: LOAN_IDS.loan3, category: 'DISC', condition_id: 'DISC-001', title: 'Initial Disclosures', description: 'Signed initial disclosure package including LE, GFE as applicable', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(12), status_set_by: 'Sarah Processor', new_date: daysAgo(15), cleared_date: daysAgo(12), follow_up_flag: false },
  { id: CONDITION_IDS.cond41, loan_id: LOAN_IDS.loan3, category: 'INC', condition_id: 'INC-001', title: 'Verify Employment', description: 'Verbal VOE from current employer verifying employment status, title, and income', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond42, loan_id: LOAN_IDS.loan3, category: 'CLSNG', condition_id: 'CLSNG-003', title: 'Signed Note and Deed', description: 'Executed promissory note and deed of trust/mortgage', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond43, loan_id: LOAN_IDS.loan3, category: 'CLSNG', condition_id: 'CLSNG-004', title: 'Closing Protection Letter', description: 'Closing protection letter from title company', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond44, loan_id: LOAN_IDS.loan3, category: 'INC', condition_id: 'INC-004', title: 'Tax Returns', description: 'Complete signed federal tax returns for the most recent 2 years including all schedules', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(4), status_set_by: 'Urma Underwriter', new_date: daysAgo(14), cleared_date: daysAgo(4), follow_up_flag: false },

  { id: CONDITION_IDS.cond45, loan_id: LOAN_IDS.loan4, category: 'INC', condition_id: 'INC-006', title: 'Rental Income Documentation', description: 'Lease agreements and proof of rental income for investment properties', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond46, loan_id: LOAN_IDS.loan4, category: 'APP', condition_id: 'APP-002', title: 'Government ID', description: 'Copy of valid government-issued photo ID for all borrowers', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(2), need_brw_request_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond47, loan_id: LOAN_IDS.loan4, category: 'INC', condition_id: 'INC-002', title: 'Pay Stubs Required', description: 'Most recent 30 days of consecutive pay stubs showing YTD earnings', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond48, loan_id: LOAN_IDS.loan4, category: 'INC', condition_id: 'INC-003', title: 'W-2 Forms', description: 'W-2 forms for the most recent 2 years', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond49, loan_id: LOAN_IDS.loan4, category: 'INC', condition_id: 'INC-004', title: 'Tax Returns', description: 'Complete signed federal tax returns for the most recent 2 years including all schedules', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond50, loan_id: LOAN_IDS.loan4, category: 'ASSET', condition_id: 'ASSET-001', title: 'Bank Statements', description: 'Most recent 2 months bank statements for all accounts showing sufficient funds for closing', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond51, loan_id: LOAN_IDS.loan4, category: 'PROP', condition_id: 'PROP-001', title: 'Appraisal Report', description: 'Full appraisal report with interior/exterior photos and comparable sales analysis', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond52, loan_id: LOAN_IDS.loan4, category: 'PROP', condition_id: 'PROP-002', title: 'Purchase Agreement', description: 'Fully executed purchase agreement with all addendums and amendments', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(2), need_brw_request_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond53, loan_id: LOAN_IDS.loan4, category: 'PROP', condition_id: 'PROP-009', title: 'Rent Schedule', description: 'Appraisal rent schedule for investment property income calculation', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond54, loan_id: LOAN_IDS.loan4, category: 'TITLE', condition_id: 'TITLE-001', title: 'Title Commitment', description: 'Preliminary title report/commitment with all exceptions listed', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond55, loan_id: LOAN_IDS.loan4, category: 'INSUR', condition_id: 'INSUR-001', title: 'Hazard Insurance', description: 'Evidence of hazard insurance with proper coverage amounts and mortgagee clause', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond56, loan_id: LOAN_IDS.loan4, category: 'DISC', condition_id: 'DISC-001', title: 'Initial Disclosures', description: 'Signed initial disclosure package including LE, GFE as applicable', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(2), need_brw_request_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond57, loan_id: LOAN_IDS.loan4, category: 'CLSNG', condition_id: 'CLSNG-001', title: 'Final Closing Disclosure', description: 'Final Closing Disclosure reviewed and approved by all parties', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond58, loan_id: LOAN_IDS.loan4, category: 'INC', condition_id: 'INC-001', title: 'Verify Employment', description: 'Verbal VOE from current employer verifying employment status, title, and income', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond59, loan_id: LOAN_IDS.loan4, category: 'ASSET', condition_id: 'ASSET-004', title: 'Source of Down Payment', description: 'Documentation of source and seasoning of down payment funds', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  { id: CONDITION_IDS.cond60, loan_id: LOAN_IDS.loan4, category: 'APP', condition_id: 'APP-001', title: 'Updated 1003 Application', description: 'Signed and dated final loan application reflecting current loan terms', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
];

const docRequestsData = [
  { id: DOC_REQUEST_IDS.dr1, condition_id: CONDITION_IDS.cond1, fulfillment_party: 'APP1', document_type: 'Pay Stubs', description_for_borrower: 'Please provide your most recent 30 days of consecutive pay stubs showing year-to-date earnings.', status: 'Pending', requested_date: daysAgo(3) },
  { id: DOC_REQUEST_IDS.dr2, condition_id: CONDITION_IDS.cond2, fulfillment_party: 'APP1', document_type: 'Bank Statements', description_for_borrower: 'Please provide the most recent 2 complete monthly statements for your checking account.', status: 'Complete', requested_date: daysAgo(5) },
  { id: DOC_REQUEST_IDS.dr3, condition_id: CONDITION_IDS.cond2, fulfillment_party: 'APP1', document_type: 'Bank Statements', description_for_borrower: 'Please provide the most recent 2 complete monthly statements for your savings account.', status: 'Pending', requested_date: daysAgo(5) },
  { id: DOC_REQUEST_IDS.dr4, condition_id: CONDITION_IDS.cond4, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please provide a letter explaining the credit inquiries on your credit report from the last 120 days.', status: 'Need to Request', requested_date: null },
  { id: DOC_REQUEST_IDS.dr5, condition_id: CONDITION_IDS.cond8, fulfillment_party: 'APP1', document_type: 'W-2 Forms', description_for_borrower: 'Please provide W-2 forms for 2022 and 2023. Note: The previous submission was missing 2022 W-2.', status: 'Pending', requested_date: daysAgo(5) },
  { id: DOC_REQUEST_IDS.dr6, condition_id: CONDITION_IDS.cond9, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please review, sign, and date the attached updated loan application.', status: 'Pending', requested_date: daysAgo(2) },
  { id: DOC_REQUEST_IDS.dr7, condition_id: CONDITION_IDS.cond13, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please provide documentation explaining the large deposit(s) shown on your bank statements.', status: 'Need to Request', requested_date: null },
  { id: DOC_REQUEST_IDS.dr8, condition_id: CONDITION_IDS.cond16, fulfillment_party: 'APP1', document_type: 'Tax Returns', description_for_borrower: 'Please provide complete signed federal tax returns for 2022 and 2023 including all schedules.', status: 'Pending', requested_date: daysAgo(4) },
  { id: DOC_REQUEST_IDS.dr9, condition_id: CONDITION_IDS.cond17, fulfillment_party: 'APP1', document_type: 'Bank Statements', description_for_borrower: 'Please provide statements for your primary checking account for the last 2 months.', status: 'Complete', requested_date: daysAgo(3) },
  { id: DOC_REQUEST_IDS.dr10, condition_id: CONDITION_IDS.cond19, fulfillment_party: 'APP1', document_type: 'Employment Verification', description_for_borrower: 'Please provide your business license, year-to-date profit and loss statement, and 2 months of business bank statements.', status: 'Need to Request', requested_date: null },
  { id: DOC_REQUEST_IDS.dr11, condition_id: CONDITION_IDS.cond20, fulfillment_party: 'APP1', document_type: 'Bank Statements', description_for_borrower: 'Please provide the most recent 2 months of statements for your savings account.', status: 'Pending', requested_date: daysAgo(2) },
  { id: DOC_REQUEST_IDS.dr12, condition_id: CONDITION_IDS.cond25, fulfillment_party: 'APP1', document_type: 'Bank Statements', description_for_borrower: 'Please provide the most recent 2 months of business bank statements.', status: 'Need to Request', requested_date: null },
  { id: DOC_REQUEST_IDS.dr13, condition_id: CONDITION_IDS.cond45, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please provide current lease agreements and proof of rental income for your investment properties.', status: 'New', requested_date: null },
  { id: DOC_REQUEST_IDS.dr14, condition_id: CONDITION_IDS.cond46, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please provide a clear copy of your valid driver\'s license or passport.', status: 'Need to Request', requested_date: null },
  { id: DOC_REQUEST_IDS.dr15, condition_id: CONDITION_IDS.cond47, fulfillment_party: 'APP1', document_type: 'Pay Stubs', description_for_borrower: 'Please provide your most recent 30 days of consecutive pay stubs.', status: 'New', requested_date: null },
  { id: DOC_REQUEST_IDS.dr16, condition_id: CONDITION_IDS.cond48, fulfillment_party: 'APP1', document_type: 'W-2 Forms', description_for_borrower: 'Please provide W-2 forms for 2022 and 2023.', status: 'New', requested_date: null },
  { id: DOC_REQUEST_IDS.dr17, condition_id: CONDITION_IDS.cond49, fulfillment_party: 'APP1', document_type: 'Tax Returns', description_for_borrower: 'Please provide complete signed federal tax returns for 2022 and 2023.', status: 'New', requested_date: null },
  { id: DOC_REQUEST_IDS.dr18, condition_id: CONDITION_IDS.cond50, fulfillment_party: 'APP1', document_type: 'Bank Statements', description_for_borrower: 'Please provide the most recent 2 months of bank statements for all accounts.', status: 'New', requested_date: null },
  { id: DOC_REQUEST_IDS.dr19, condition_id: CONDITION_IDS.cond52, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please provide the fully executed purchase agreement with all addendums.', status: 'Need to Request', requested_date: null },
  { id: DOC_REQUEST_IDS.dr20, condition_id: CONDITION_IDS.cond55, fulfillment_party: 'APP1', document_type: 'Hazard Insurance Binder', description_for_borrower: 'Please provide evidence of hazard insurance with proper coverage amounts.', status: 'New', requested_date: null },
  { id: DOC_REQUEST_IDS.dr21, condition_id: CONDITION_IDS.cond56, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please sign and return the initial disclosure package.', status: 'Need to Request', requested_date: null },
  { id: DOC_REQUEST_IDS.dr22, condition_id: CONDITION_IDS.cond59, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please provide documentation showing the source and seasoning of your down payment funds.', status: 'New', requested_date: null },
  { id: DOC_REQUEST_IDS.dr23, condition_id: CONDITION_IDS.cond60, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please review, sign, and date the loan application.', status: 'New', requested_date: null },
];

const conditionDocumentsData = [
  { id: DOCUMENT_IDS.doc1, loan_id: LOAN_IDS.loan1, doc_request_id: DOC_REQUEST_IDS.dr2, document_name: 'Chase_Checking_Dec2024.pdf', document_type: 'Bank Statements', description: 'Chase checking account statement for December 2024', status: 'Need to Review', file_url: null, thumbnail_url: null, file_size: 245000, mime_type: 'application/pdf', original_filename: 'Chase_Checking_Dec2024.pdf', page_count: 4 },
  { id: DOCUMENT_IDS.doc2, loan_id: LOAN_IDS.loan1, doc_request_id: DOC_REQUEST_IDS.dr2, document_name: 'Chase_Checking_Nov2024.pdf', document_type: 'Bank Statements', description: 'Chase checking account statement for November 2024', status: 'Reviewed', file_url: null, thumbnail_url: null, file_size: 238000, mime_type: 'application/pdf', original_filename: 'Chase_Checking_Nov2024.pdf', page_count: 3 },
  { id: DOCUMENT_IDS.doc3, loan_id: LOAN_IDS.loan1, doc_request_id: null, document_name: 'Appraisal_Report_123MainSt.pdf', document_type: 'Appraisal', description: 'Full appraisal report for 123 Main Street property', status: 'Approved', file_url: null, thumbnail_url: null, file_size: 1250000, mime_type: 'application/pdf', original_filename: 'Appraisal_Report_123MainSt.pdf', page_count: 28 },
  { id: DOCUMENT_IDS.doc4, loan_id: LOAN_IDS.loan1, doc_request_id: null, document_name: 'Insurance_Binder_StateFarm.pdf', document_type: 'Hazard Insurance Binder', description: 'State Farm hazard insurance binder for property', status: 'Approved', file_url: null, thumbnail_url: null, file_size: 125000, mime_type: 'application/pdf', original_filename: 'Insurance_Binder_StateFarm.pdf', page_count: 2 },
  { id: DOCUMENT_IDS.doc5, loan_id: LOAN_IDS.loan2, doc_request_id: DOC_REQUEST_IDS.dr9, document_name: 'BofA_Checking_Dec2024.pdf', document_type: 'Bank Statements', description: 'Bank of America checking statement December 2024', status: 'Need to Review', file_url: null, thumbnail_url: null, file_size: 198000, mime_type: 'application/pdf', original_filename: 'BofA_Checking_Dec2024.pdf', page_count: 5 },
  { id: DOCUMENT_IDS.doc6, loan_id: LOAN_IDS.loan2, doc_request_id: DOC_REQUEST_IDS.dr9, document_name: 'BofA_Checking_Nov2024.pdf', document_type: 'Bank Statements', description: 'Bank of America checking statement November 2024', status: 'Reviewed', file_url: null, thumbnail_url: null, file_size: 185000, mime_type: 'application/pdf', original_filename: 'BofA_Checking_Nov2024.pdf', page_count: 4 },
  { id: DOCUMENT_IDS.doc7, loan_id: LOAN_IDS.loan1, doc_request_id: DOC_REQUEST_IDS.dr5, document_name: 'W2_2023_TechSolutions.pdf', document_type: 'W-2 Forms', description: 'W-2 from Tech Solutions Inc. for 2023', status: 'Approved', file_url: null, thumbnail_url: null, file_size: 85000, mime_type: 'application/pdf', original_filename: 'W2_2023_TechSolutions.pdf', page_count: 1 },
  { id: DOCUMENT_IDS.doc8, loan_id: LOAN_IDS.loan3, doc_request_id: null, document_name: 'PayStubs_Thompson_Dec2024.pdf', document_type: 'Pay Stubs', description: 'Pay stubs for David Thompson - December 2024', status: 'Approved', file_url: null, thumbnail_url: null, file_size: 156000, mime_type: 'application/pdf', original_filename: 'PayStubs_Thompson_Dec2024.pdf', page_count: 3 },
];

const documentNotesData = [
  { id: generateUUID(), document_id: DOCUMENT_IDS.doc1, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Statement appears complete. Checking for large deposits over $1,000.' },
  { id: generateUUID(), document_id: DOCUMENT_IDS.doc2, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Verified all pages present. No unusual activity noted.' },
  { id: generateUUID(), document_id: DOCUMENT_IDS.doc3, author_name: 'Urma Underwriter', author_role: 'Underwriter', content: 'Appraisal value supports loan amount. Comparable sales are appropriate.' },
  { id: generateUUID(), document_id: DOCUMENT_IDS.doc7, author_name: 'Urma Underwriter', author_role: 'Underwriter', content: 'W-2 for 2023 verified. Still waiting on 2022 W-2.' },
];

const conditionNotesData = [
  { id: NOTE_IDS.note1, loan_id: LOAN_IDS.loan1, condition_id: CONDITION_IDS.cond1, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Borrower confirmed pay stubs will be submitted by end of week.', note_type: 'condition', is_pinned: false },
  { id: NOTE_IDS.note2, loan_id: LOAN_IDS.loan1, condition_id: CONDITION_IDS.cond2, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Received December statement. Waiting on November statement from co-borrower.', note_type: 'condition', is_pinned: false },
  { id: NOTE_IDS.note3, loan_id: LOAN_IDS.loan1, condition_id: CONDITION_IDS.cond2, author_name: 'Urma Underwriter', author_role: 'Underwriter', content: 'Please verify the $5,000 deposit on page 2 of December statement.', note_type: 'condition', is_pinned: true },
  { id: NOTE_IDS.note4, loan_id: LOAN_IDS.loan1, condition_id: CONDITION_IDS.cond3, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Appraisal received and uploaded. Ready for UW review.', note_type: 'condition', is_pinned: false },
  { id: NOTE_IDS.note5, loan_id: LOAN_IDS.loan1, condition_id: CONDITION_IDS.cond5, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Insurance binder received with correct mortgagee clause. Condition cleared.', note_type: 'condition', is_pinned: false },
  { id: NOTE_IDS.note6, loan_id: LOAN_IDS.loan2, condition_id: CONDITION_IDS.cond16, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Borrower is self-employed, will need extra time to gather all tax documents.', note_type: 'condition', is_pinned: false },
  { id: NOTE_IDS.note7, loan_id: LOAN_IDS.loan2, condition_id: CONDITION_IDS.cond16, author_name: 'Urma Underwriter', author_role: 'Underwriter', content: 'Please ensure all schedules are included, especially Schedule C and Schedule SE.', note_type: 'condition', is_pinned: true },
  { id: NOTE_IDS.note8, loan_id: LOAN_IDS.loan1, condition_id: CONDITION_IDS.cond8, author_name: 'Urma Underwriter', author_role: 'Underwriter', content: 'W-2 for 2022 is missing. Cannot clear condition until both years are provided.', note_type: 'condition', is_pinned: false },
  { id: NOTE_IDS.note9, loan_id: LOAN_IDS.loan1, condition_id: CONDITION_IDS.cond8, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Contacted borrower about missing 2022 W-2. They are checking with previous employer.', note_type: 'condition', is_pinned: false },
  { id: NOTE_IDS.note10, loan_id: LOAN_IDS.loan3, condition_id: CONDITION_IDS.cond30, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'All pay stubs verified. Income is consistent with application.', note_type: 'condition', is_pinned: false },
  { id: generateUUID(), loan_id: LOAN_IDS.loan1, condition_id: null, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Borrower called - employment verification in progress. HR department confirmed they will send verification letter by Friday.', note_type: 'update', is_pinned: true },
  { id: generateUUID(), loan_id: LOAN_IDS.loan1, condition_id: null, author_name: 'Urma Underwriter', author_role: 'Underwriter', content: 'Reviewed appraisal report. Value came in at $425,000 which supports the requested loan amount. No issues noted.', note_type: 'update', is_pinned: false },
  { id: generateUUID(), loan_id: LOAN_IDS.loan2, condition_id: null, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Title company confirmed clear title. Insurance binder requested.', note_type: 'update', is_pinned: false },
];

const noteReadStatusData = [
  { id: generateUUID(), note_id: NOTE_IDS.note1, role: 'Processor III', read_at: daysAgo(2) },
  { id: generateUUID(), note_id: NOTE_IDS.note2, role: 'Processor III', read_at: daysAgo(1) },
  { id: generateUUID(), note_id: NOTE_IDS.note4, role: 'Underwriter', read_at: daysAgo(1) },
  { id: generateUUID(), note_id: NOTE_IDS.note5, role: 'Processor III', read_at: daysAgo(1) },
  { id: generateUUID(), note_id: NOTE_IDS.note6, role: 'Underwriter', read_at: daysAgo(2) },
  { id: generateUUID(), note_id: NOTE_IDS.note8, role: 'Processor III', read_at: daysAgo(1) },
  { id: generateUUID(), note_id: NOTE_IDS.note10, role: 'Underwriter', read_at: daysAgo(2) },
];

const userConditionFlagsData = [
  { id: generateUUID(), user_id: null, role: 'Processor III', condition_id: CONDITION_IDS.cond2, flag_color: 'red' },
  { id: generateUUID(), user_id: null, role: 'Underwriter', condition_id: CONDITION_IDS.cond3, flag_color: 'blue' },
  { id: generateUUID(), user_id: null, role: 'Processor III', condition_id: CONDITION_IDS.cond16, flag_color: 'yellow' },
  { id: generateUUID(), user_id: null, role: 'Processor III', condition_id: CONDITION_IDS.cond8, flag_color: 'red' },
];

const emailHistoryData = [
  { id: generateUUID(), loan_id: LOAN_IDS.loan1, email_type: 'doc_request', from_email: 'sarah.processor@cmgfi.com', from_name: 'Sarah Processor', to_emails: [{ email: 'michael.johnson@email.com', name: 'Michael Johnson' }], cc_emails: [], subject: 'Document Request - Johnson Residence Loan #2024-001234', template_name: 'Standard Request', intro_content: 'Thank you for choosing CMG Financial. We need the following documents to continue processing your loan.', body_html: '<p>Dear Michael,</p><p>Please provide the following documents at your earliest convenience:</p><ul><li>Pay stubs for the last 30 days</li><li>Bank statements for the last 2 months</li></ul><p>Thank you,<br/>Sarah Processor</p>', doc_request_ids: [DOC_REQUEST_IDS.dr1, DOC_REQUEST_IDS.dr2], sent_at: daysAgo(5) },
  { id: generateUUID(), loan_id: LOAN_IDS.loan1, email_type: 'doc_request', from_email: 'sarah.processor@cmgfi.com', from_name: 'Sarah Processor', to_emails: [{ email: 'michael.johnson@email.com', name: 'Michael Johnson' }], cc_emails: [{ email: 'sarah.johnson@email.com', name: 'Sarah Johnson' }], subject: 'Follow-up: Additional Documents Needed - Loan #2024-001234', template_name: 'Follow-up Request', intro_content: 'This is a friendly reminder about the outstanding documents for your loan.', body_html: '<p>Dear Michael,</p><p>We are still awaiting the following documents:</p><ul><li>W-2 forms for 2022 and 2023</li></ul><p>Please let us know if you have any questions.</p><p>Thank you,<br/>Sarah Processor</p>', doc_request_ids: [DOC_REQUEST_IDS.dr5], sent_at: daysAgo(3) },
  { id: generateUUID(), loan_id: LOAN_IDS.loan2, email_type: 'doc_request', from_email: 'sarah.processor@cmgfi.com', from_name: 'Sarah Processor', to_emails: [{ email: 'carlos.martinez@email.com', name: 'Carlos Martinez' }], cc_emails: [], subject: 'Document Request - Martinez Refinance Loan #2024-001567', template_name: 'Standard Request', intro_content: 'Thank you for choosing CMG Financial for your refinance. We need the following documents.', body_html: '<p>Dear Carlos,</p><p>To proceed with your refinance application, please provide:</p><ul><li>Tax returns for the last 2 years</li><li>Business documentation</li></ul><p>Thank you,<br/>Sarah Processor</p>', doc_request_ids: [DOC_REQUEST_IDS.dr8, DOC_REQUEST_IDS.dr10], sent_at: daysAgo(4) },
];

async function clearAllData() {
  console.log('Clearing existing seed data...\n');

  const tables = [
    'email_history',
    'user_condition_flags',
    'note_read_status',
    'document_notes',
    'condition_notes',
    'condition_documents',
    'doc_requests',
    'conditions',
    'custom_condition_templates',
    'custom_list_conditions',
    'custom_lists',
    'available_conditions',
    'loan_parties',
    'loans',
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.warn(`  Warning clearing ${table}:`, error.message);
    } else {
      console.log(`  Cleared ${table}`);
    }
  }

  console.log('\nData cleared successfully.\n');
}

async function seedAllData() {
  console.log('Seeding database with dummy data...\n');

  console.log('Inserting loans...');
  const { error: loansError } = await supabase.from('loans').insert(loansData);
  if (loansError) {
    console.error('  Error inserting loans:', loansError.message);
    return false;
  }
  console.log(`  Inserted ${loansData.length} loans`);

  console.log('Inserting loan parties...');
  const { error: partiesError } = await supabase.from('loan_parties').insert(loanPartiesData);
  if (partiesError) {
    console.error('  Error inserting loan parties:', partiesError.message);
    return false;
  }
  console.log(`  Inserted ${loanPartiesData.length} loan parties`);

  console.log('Inserting available conditions...');
  const { error: availCondError } = await supabase.from('available_conditions').insert(availableConditionsData);
  if (availCondError) {
    console.error('  Error inserting available conditions:', availCondError.message);
    return false;
  }
  console.log(`  Inserted ${availableConditionsData.length} available conditions`);

  console.log('Inserting custom lists...');
  const { error: listsError } = await supabase.from('custom_lists').insert(customListsData);
  if (listsError) {
    console.error('  Error inserting custom lists:', listsError.message);
    return false;
  }
  console.log(`  Inserted ${customListsData.length} custom lists`);

  console.log('Inserting custom list conditions...');
  const { error: listCondError } = await supabase.from('custom_list_conditions').insert(customListConditionsData);
  if (listCondError) {
    console.error('  Error inserting custom list conditions:', listCondError.message);
    return false;
  }
  console.log(`  Inserted ${customListConditionsData.length} custom list conditions`);

  console.log('Inserting custom condition templates...');
  const { error: templatesError } = await supabase.from('custom_condition_templates').insert(customConditionTemplatesData);
  if (templatesError) {
    console.error('  Error inserting custom condition templates:', templatesError.message);
    return false;
  }
  console.log(`  Inserted ${customConditionTemplatesData.length} custom condition templates`);

  console.log('Inserting conditions...');
  const { error: conditionsError } = await supabase.from('conditions').insert(conditionsData);
  if (conditionsError) {
    console.error('  Error inserting conditions:', conditionsError.message);
    return false;
  }
  console.log(`  Inserted ${conditionsData.length} conditions`);

  console.log('Inserting doc requests...');
  const { error: docReqError } = await supabase.from('doc_requests').insert(docRequestsData);
  if (docReqError) {
    console.error('  Error inserting doc requests:', docReqError.message);
    return false;
  }
  console.log(`  Inserted ${docRequestsData.length} doc requests`);

  console.log('Inserting condition documents...');
  const { error: docsError } = await supabase.from('condition_documents').insert(conditionDocumentsData);
  if (docsError) {
    console.error('  Error inserting condition documents:', docsError.message);
    return false;
  }
  console.log(`  Inserted ${conditionDocumentsData.length} condition documents`);

  console.log('Inserting document notes...');
  const { error: docNotesError } = await supabase.from('document_notes').insert(documentNotesData);
  if (docNotesError) {
    console.error('  Error inserting document notes:', docNotesError.message);
    return false;
  }
  console.log(`  Inserted ${documentNotesData.length} document notes`);

  console.log('Inserting condition notes...');
  const { error: condNotesError } = await supabase.from('condition_notes').insert(conditionNotesData);
  if (condNotesError) {
    console.error('  Error inserting condition notes:', condNotesError.message);
    return false;
  }
  console.log(`  Inserted ${conditionNotesData.length} condition notes`);

  console.log('Inserting note read status...');
  const { error: readStatusError } = await supabase.from('note_read_status').insert(noteReadStatusData);
  if (readStatusError) {
    console.error('  Error inserting note read status:', readStatusError.message);
    return false;
  }
  console.log(`  Inserted ${noteReadStatusData.length} note read status records`);

  console.log('Inserting user condition flags...');
  const { error: flagsError } = await supabase.from('user_condition_flags').insert(userConditionFlagsData);
  if (flagsError) {
    console.error('  Error inserting user condition flags:', flagsError.message);
    return false;
  }
  console.log(`  Inserted ${userConditionFlagsData.length} user condition flags`);

  console.log('Inserting email history...');
  const { error: emailError } = await supabase.from('email_history').insert(emailHistoryData);
  if (emailError) {
    console.warn(`  Warning inserting email history (RLS may require authenticated user): ${emailError.message}`);
    console.log('  Skipping email history - table requires authenticated access');
  } else {
    console.log(`  Inserted ${emailHistoryData.length} email history records`);
  }

  console.log('\nSeeding completed successfully!');
  return true;
}

async function main() {
  console.log('='.repeat(50));
  console.log('Database Seed Script');
  console.log('='.repeat(50));
  console.log('');

  if (RESET_FLAG) {
    console.log('Running with --reset flag: Will clear existing data first.\n');
    await clearAllData();
  }

  const success = await seedAllData();

  if (success) {
    console.log('\n' + '='.repeat(50));
    console.log('Summary:');
    console.log('='.repeat(50));
    console.log(`  Loans: ${loansData.length}`);
    console.log(`  Loan Parties: ${loanPartiesData.length}`);
    console.log(`  Available Conditions: ${availableConditionsData.length}`);
    console.log(`  Custom Lists: ${customListsData.length}`);
    console.log(`  Custom List Conditions: ${customListConditionsData.length}`);
    console.log(`  Custom Condition Templates: ${customConditionTemplatesData.length}`);
    console.log(`  Conditions: ${conditionsData.length}`);
    console.log(`  Doc Requests: ${docRequestsData.length}`);
    console.log(`  Condition Documents: ${conditionDocumentsData.length}`);
    console.log(`  Document Notes: ${documentNotesData.length}`);
    console.log(`  Condition Notes: ${conditionNotesData.length}`);
    console.log(`  Note Read Status: ${noteReadStatusData.length}`);
    console.log(`  User Condition Flags: ${userConditionFlagsData.length}`);
    console.log(`  Email History: ${emailHistoryData.length}`);
    console.log('');
  } else {
    console.error('\nSeeding failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
