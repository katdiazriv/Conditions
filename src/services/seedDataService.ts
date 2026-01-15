import { supabase } from '../lib/supabase';

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

function generateSeedData() {
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

  const CONDITION_IDS: Record<string, string> = {};
  for (let i = 1; i <= 60; i++) {
    CONDITION_IDS[`cond${i}`] = generateUUID();
  }

  const DOC_REQUEST_IDS: Record<string, string> = {};
  for (let i = 1; i <= 30; i++) {
    DOC_REQUEST_IDS[`dr${i}`] = generateUUID();
  }

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

  const NOTE_IDS: Record<string, string> = {};
  for (let i = 1; i <= 10; i++) {
    NOTE_IDS[`note${i}`] = generateUUID();
  }

  const CUSTOM_LIST_IDS = {
    list1: generateUUID(),
    list2: generateUUID(),
  };

  const AVAILABLE_CONDITION_IDS: Record<string, string> = {};
  for (let i = 1; i <= 80; i++) {
    AVAILABLE_CONDITION_IDS[`ac${i}`] = generateUUID();
  }

  const loansData = [
    { id: LOAN_IDS.loan1, loan_number: '2024-001234', description: 'Johnson Residence - Purchase', status: 'Conditions for Review' },
    { id: LOAN_IDS.loan2, loan_number: '2024-001567', description: 'Martinez Family - Refinance', status: 'UW Received' },
    { id: LOAN_IDS.loan3, loan_number: '2024-001890', description: 'Thompson Estate - Purchase', status: 'Approved' },
    { id: LOAN_IDS.loan4, loan_number: '2024-002123', description: 'Williams Investment Property', status: 'File Received' },
  ];

  const loanPartiesData = [
    { id: PARTY_IDS.loan1_borrower, loan_id: LOAN_IDS.loan1, party_type: 'Borrower', party_name: 'Michael Johnson', parent: 'APP1' },
    { id: PARTY_IDS.loan1_coborrower, loan_id: LOAN_IDS.loan1, party_type: 'Co-Borrower', party_name: 'Sarah Johnson', parent: 'APP1' },
    { id: PARTY_IDS.loan1_app1, loan_id: LOAN_IDS.loan1, party_type: 'APP1', party_name: 'Michael & Sarah Johnson', parent: 'APP1' },
    { id: PARTY_IDS.loan2_borrower, loan_id: LOAN_IDS.loan2, party_type: 'Borrower', party_name: 'Carlos Martinez', parent: 'APP1' },
    { id: PARTY_IDS.loan2_coborrower, loan_id: LOAN_IDS.loan2, party_type: 'Co-Borrower', party_name: 'Maria Martinez', parent: 'APP1' },
    { id: PARTY_IDS.loan2_app1, loan_id: LOAN_IDS.loan2, party_type: 'APP1', party_name: 'Carlos & Maria Martinez', parent: 'APP1' },
    { id: PARTY_IDS.loan3_borrower, loan_id: LOAN_IDS.loan3, party_type: 'Borrower', party_name: 'David Thompson', parent: 'APP1' },
    { id: PARTY_IDS.loan3_coborrower, loan_id: LOAN_IDS.loan3, party_type: 'Co-Borrower', party_name: 'Emily Thompson', parent: 'APP1' },
    { id: PARTY_IDS.loan3_app1, loan_id: LOAN_IDS.loan3, party_type: 'APP1', party_name: 'David & Emily Thompson', parent: 'APP1' },
    { id: PARTY_IDS.loan4_borrower, loan_id: LOAN_IDS.loan4, party_type: 'Borrower', party_name: 'James Williams', parent: 'APP1' },
    { id: PARTY_IDS.loan4_coborrower, loan_id: LOAN_IDS.loan4, party_type: 'Co-Borrower', party_name: 'Patricia Williams', parent: 'APP1' },
    { id: PARTY_IDS.loan4_app1, loan_id: LOAN_IDS.loan4, party_type: 'APP1', party_name: 'James & Patricia Williams', parent: 'APP1' },
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
    { id: CUSTOM_LIST_IDS.list1, user_id: null, name: 'Frequently Used' },
    { id: CUSTOM_LIST_IDS.list2, user_id: null, name: 'FHA Loans' },
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
    { id: generateUUID(), user_id: null, category: 'MISC', condition_number: 1, title: 'Social Security Award Letter', description: 'Current Social Security award letter showing benefit amount', source_type: 'BRW', condition_class: 'Processor III', default_stage: 'Prior to Docs' },
    { id: generateUUID(), user_id: null, category: 'INC', condition_number: 2, title: 'Bonus/Commission History', description: 'Documentation of bonus/commission history for the past 2 years', source_type: 'BRW', condition_class: 'UW', default_stage: 'Prior to Docs' },
    { id: generateUUID(), user_id: null, category: 'PROP', condition_number: 3, title: 'Well/Septic Inspection', description: 'Well water test and septic inspection report for rural properties', source_type: 'INT', condition_class: 'Processor III', default_stage: 'Prior to Funding' },
  ];

  const conditionsData = [
    { id: CONDITION_IDS.cond1, loan_id: LOAN_IDS.loan1, category: 'INC', condition_id: 'INC-002', title: 'Pay Stubs Required', description: 'Most recent 30 days of consecutive pay stubs showing YTD earnings', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Requested', status_date: daysAgo(3), status_set_by: 'Sarah Processor', new_date: daysAgo(7), need_brw_request_date: daysAgo(5), requested_date: daysAgo(3), follow_up_flag: false },
    { id: CONDITION_IDS.cond2, loan_id: LOAN_IDS.loan1, category: 'ASSET', condition_id: 'ASSET-001', title: 'Bank Statements', description: 'Most recent 2 months bank statements for all accounts', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Processor to Review', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(10), need_brw_request_date: daysAgo(8), requested_date: daysAgo(5), processor_to_review_date: daysAgo(1), follow_up_flag: true, follow_up_date: daysFromNow(2) },
    { id: CONDITION_IDS.cond3, loan_id: LOAN_IDS.loan1, category: 'PROP', condition_id: 'PROP-001', title: 'Appraisal Report', description: 'Full appraisal report with interior/exterior photos', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'Ready for UW', status_date: daysAgo(2), status_set_by: 'Sarah Processor', new_date: daysAgo(14), ready_for_uw_date: daysAgo(2), follow_up_flag: false },
    { id: CONDITION_IDS.cond4, loan_id: LOAN_IDS.loan1, category: 'CRED', condition_id: 'CRED-001', title: 'Letter of Explanation', description: 'Written explanation for credit inquiries', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(2), status_set_by: 'Urma Underwriter', new_date: daysAgo(5), need_brw_request_date: daysAgo(2), follow_up_flag: false },
    { id: CONDITION_IDS.cond5, loan_id: LOAN_IDS.loan1, category: 'INSUR', condition_id: 'INSUR-001', title: 'Hazard Insurance', description: 'Evidence of hazard insurance with proper coverage', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(12), cleared_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond6, loan_id: LOAN_IDS.loan1, category: 'TITLE', condition_id: 'TITLE-001', title: 'Title Commitment', description: 'Preliminary title report/commitment', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond7, loan_id: LOAN_IDS.loan1, category: 'INC', condition_id: 'INC-001', title: 'Verify Employment', description: 'Verbal VOE from current employer', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond8, loan_id: LOAN_IDS.loan1, category: 'INC', condition_id: 'INC-003', title: 'W-2 Forms', description: 'W-2 forms for the most recent 2 years', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Not Cleared', status_date: daysAgo(1), status_set_by: 'Urma Underwriter', new_date: daysAgo(10), not_cleared_date: daysAgo(1), follow_up_flag: true, follow_up_date: daysFromNow(1) },
    { id: CONDITION_IDS.cond9, loan_id: LOAN_IDS.loan1, category: 'APP', condition_id: 'APP-001', title: 'Updated 1003 Application', description: 'Signed and dated final loan application', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Requested', status_date: daysAgo(2), status_set_by: 'Sarah Processor', new_date: daysAgo(6), requested_date: daysAgo(2), follow_up_flag: false },
    { id: CONDITION_IDS.cond10, loan_id: LOAN_IDS.loan1, category: 'APP', condition_id: 'APP-002', title: 'Government ID', description: 'Copy of valid government-issued photo ID', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(5), status_set_by: 'Sarah Processor', new_date: daysAgo(12), cleared_date: daysAgo(5), follow_up_flag: false },
    { id: CONDITION_IDS.cond11, loan_id: LOAN_IDS.loan1, category: 'DISC', condition_id: 'DISC-001', title: 'Initial Disclosures', description: 'Signed initial disclosure package', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(10), status_set_by: 'Sarah Processor', new_date: daysAgo(14), cleared_date: daysAgo(10), follow_up_flag: false },
    { id: CONDITION_IDS.cond12, loan_id: LOAN_IDS.loan1, category: 'CLSNG', condition_id: 'CLSNG-001', title: 'Final Closing Disclosure', description: 'Final Closing Disclosure reviewed', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond13, loan_id: LOAN_IDS.loan1, category: 'ASSET', condition_id: 'ASSET-009', title: 'Large Deposit Explanation', description: 'Explanation for large deposits on bank statements', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Urma Underwriter', new_date: daysAgo(2), need_brw_request_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond14, loan_id: LOAN_IDS.loan1, category: 'INC', condition_id: 'INC-013', title: '4506-C Tax Transcript', description: 'IRS Form 4506-C request', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Requested', status_date: daysAgo(4), status_set_by: 'Sarah Processor', new_date: daysAgo(7), requested_date: daysAgo(4), follow_up_flag: false },
    { id: CONDITION_IDS.cond15, loan_id: LOAN_IDS.loan1, category: 'PROP', condition_id: 'PROP-002', title: 'Purchase Agreement', description: 'Fully executed purchase agreement', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(8), status_set_by: 'Sarah Processor', new_date: daysAgo(14), cleared_date: daysAgo(8), follow_up_flag: false },
    { id: CONDITION_IDS.cond16, loan_id: LOAN_IDS.loan2, category: 'INC', condition_id: 'INC-004', title: 'Tax Returns', description: 'Complete signed federal tax returns', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Requested', status_date: daysAgo(4), status_set_by: 'Sarah Processor', new_date: daysAgo(8), requested_date: daysAgo(4), follow_up_flag: true, follow_up_date: daysFromNow(1), expiration_date: daysFromNow(30) },
    { id: CONDITION_IDS.cond17, loan_id: LOAN_IDS.loan2, category: 'ASSET', condition_id: 'ASSET-001', title: 'Bank Statements - Checking', description: 'Most recent 2 months bank statements for checking', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Processor to Review', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(6), processor_to_review_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond18, loan_id: LOAN_IDS.loan2, category: 'TITLE', condition_id: 'TITLE-003', title: 'Payoff Statement', description: 'Payoff statement from existing lienholder', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Ready for UW', status_date: daysAgo(2), status_set_by: 'Sarah Processor', new_date: daysAgo(10), ready_for_uw_date: daysAgo(2), follow_up_flag: false },
    { id: CONDITION_IDS.cond19, loan_id: LOAN_IDS.loan2, category: 'INC', condition_id: 'INC-005', title: 'Self-Employment Documentation', description: 'Business license, P&L, and bank statements', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Urma Underwriter', new_date: daysAgo(3), need_brw_request_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond20, loan_id: LOAN_IDS.loan2, category: 'ASSET', condition_id: 'ASSET-005', title: 'Bank Statements - Savings', description: 'Most recent 2 months bank statements for savings', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Requested', status_date: daysAgo(2), status_set_by: 'Sarah Processor', new_date: daysAgo(5), requested_date: daysAgo(2), follow_up_flag: false },
    { id: CONDITION_IDS.cond21, loan_id: LOAN_IDS.loan2, category: 'INC', condition_id: 'INC-002', title: 'Pay Stubs Required', description: 'Most recent 30 days of pay stubs', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(3), status_set_by: 'Sarah Processor', new_date: daysAgo(10), cleared_date: daysAgo(3), follow_up_flag: false },
    { id: CONDITION_IDS.cond22, loan_id: LOAN_IDS.loan2, category: 'INSUR', condition_id: 'INSUR-001', title: 'Hazard Insurance', description: 'Evidence of hazard insurance', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(2), status_set_by: 'System', new_date: daysAgo(2), follow_up_flag: false },
    { id: CONDITION_IDS.cond23, loan_id: LOAN_IDS.loan2, category: 'APP', condition_id: 'APP-002', title: 'Government ID', description: 'Copy of valid government-issued photo ID', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(6), status_set_by: 'Sarah Processor', new_date: daysAgo(10), cleared_date: daysAgo(6), follow_up_flag: false },
    { id: CONDITION_IDS.cond24, loan_id: LOAN_IDS.loan2, category: 'INC', condition_id: 'INC-014', title: 'CPA Letter', description: 'CPA letter confirming self-employment income', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'Urma Underwriter', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond25, loan_id: LOAN_IDS.loan2, category: 'ASSET', condition_id: 'ASSET-010', title: 'Business Asset Statement', description: 'Business bank statement', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Urma Underwriter', new_date: daysAgo(2), need_brw_request_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond26, loan_id: LOAN_IDS.loan2, category: 'PROP', condition_id: 'PROP-001', title: 'Appraisal Report', description: 'Full appraisal report', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(4), status_set_by: 'Urma Underwriter', new_date: daysAgo(12), cleared_date: daysAgo(4), follow_up_flag: false },
    { id: CONDITION_IDS.cond27, loan_id: LOAN_IDS.loan2, category: 'TITLE', condition_id: 'TITLE-001', title: 'Title Commitment', description: 'Preliminary title report', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(5), status_set_by: 'Sarah Processor', new_date: daysAgo(10), cleared_date: daysAgo(5), follow_up_flag: false },
    { id: CONDITION_IDS.cond28, loan_id: LOAN_IDS.loan2, category: 'CLSNG', condition_id: 'CLSNG-001', title: 'Final Closing Disclosure', description: 'Final Closing Disclosure', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond29, loan_id: LOAN_IDS.loan2, category: 'INC', condition_id: 'INC-001', title: 'Verify Employment', description: 'Verbal VOE from current employer', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond30, loan_id: LOAN_IDS.loan3, category: 'INC', condition_id: 'INC-002', title: 'Pay Stubs Required', description: 'Most recent 30 days of pay stubs', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(3), status_set_by: 'Sarah Processor', new_date: daysAgo(15), cleared_date: daysAgo(3), follow_up_flag: false },
    { id: CONDITION_IDS.cond31, loan_id: LOAN_IDS.loan3, category: 'ASSET', condition_id: 'ASSET-001', title: 'Bank Statements', description: 'Most recent 2 months bank statements', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(2), status_set_by: 'Urma Underwriter', new_date: daysAgo(14), cleared_date: daysAgo(2), follow_up_flag: false },
    { id: CONDITION_IDS.cond32, loan_id: LOAN_IDS.loan3, category: 'CLSNG', condition_id: 'CLSNG-001', title: 'Final Closing Disclosure', description: 'Final Closing Disclosure', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond33, loan_id: LOAN_IDS.loan3, category: 'TITLE', condition_id: 'TITLE-002', title: 'Title Insurance', description: 'Title insurance policy', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond34, loan_id: LOAN_IDS.loan3, category: 'INC', condition_id: 'INC-003', title: 'W-2 Forms', description: 'W-2 forms for most recent 2 years', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(4), status_set_by: 'Sarah Processor', new_date: daysAgo(14), cleared_date: daysAgo(4), follow_up_flag: false },
    { id: CONDITION_IDS.cond35, loan_id: LOAN_IDS.loan3, category: 'PROP', condition_id: 'PROP-001', title: 'Appraisal Report', description: 'Full appraisal report', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(5), status_set_by: 'Urma Underwriter', new_date: daysAgo(14), cleared_date: daysAgo(5), follow_up_flag: false },
    { id: CONDITION_IDS.cond36, loan_id: LOAN_IDS.loan3, category: 'PROP', condition_id: 'PROP-002', title: 'Purchase Agreement', description: 'Fully executed purchase agreement', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(12), status_set_by: 'Sarah Processor', new_date: daysAgo(15), cleared_date: daysAgo(12), follow_up_flag: false },
    { id: CONDITION_IDS.cond37, loan_id: LOAN_IDS.loan3, category: 'INSUR', condition_id: 'INSUR-001', title: 'Hazard Insurance', description: 'Evidence of hazard insurance', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(3), status_set_by: 'Sarah Processor', new_date: daysAgo(10), cleared_date: daysAgo(3), follow_up_flag: false },
    { id: CONDITION_IDS.cond38, loan_id: LOAN_IDS.loan3, category: 'TITLE', condition_id: 'TITLE-001', title: 'Title Commitment', description: 'Preliminary title report', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(6), status_set_by: 'Sarah Processor', new_date: daysAgo(14), cleared_date: daysAgo(6), follow_up_flag: false },
    { id: CONDITION_IDS.cond39, loan_id: LOAN_IDS.loan3, category: 'APP', condition_id: 'APP-002', title: 'Government ID', description: 'Copy of valid government-issued ID', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(10), status_set_by: 'Sarah Processor', new_date: daysAgo(15), cleared_date: daysAgo(10), follow_up_flag: false },
    { id: CONDITION_IDS.cond40, loan_id: LOAN_IDS.loan3, category: 'DISC', condition_id: 'DISC-001', title: 'Initial Disclosures', description: 'Signed initial disclosure package', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(12), status_set_by: 'Sarah Processor', new_date: daysAgo(15), cleared_date: daysAgo(12), follow_up_flag: false },
    { id: CONDITION_IDS.cond41, loan_id: LOAN_IDS.loan3, category: 'INC', condition_id: 'INC-001', title: 'Verify Employment', description: 'Verbal VOE from current employer', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond42, loan_id: LOAN_IDS.loan3, category: 'CLSNG', condition_id: 'CLSNG-003', title: 'Signed Note and Deed', description: 'Executed promissory note and deed', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond43, loan_id: LOAN_IDS.loan3, category: 'CLSNG', condition_id: 'CLSNG-004', title: 'Closing Protection Letter', description: 'Closing protection letter', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond44, loan_id: LOAN_IDS.loan3, category: 'INC', condition_id: 'INC-004', title: 'Tax Returns', description: 'Complete signed federal tax returns', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'Cleared', status_date: daysAgo(4), status_set_by: 'Urma Underwriter', new_date: daysAgo(14), cleared_date: daysAgo(4), follow_up_flag: false },
    { id: CONDITION_IDS.cond45, loan_id: LOAN_IDS.loan4, category: 'INC', condition_id: 'INC-006', title: 'Rental Income Documentation', description: 'Lease agreements and rental income proof', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond46, loan_id: LOAN_IDS.loan4, category: 'APP', condition_id: 'APP-002', title: 'Government ID', description: 'Copy of valid government-issued ID', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(2), need_brw_request_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond47, loan_id: LOAN_IDS.loan4, category: 'INC', condition_id: 'INC-002', title: 'Pay Stubs Required', description: 'Most recent 30 days of pay stubs', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond48, loan_id: LOAN_IDS.loan4, category: 'INC', condition_id: 'INC-003', title: 'W-2 Forms', description: 'W-2 forms for most recent 2 years', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond49, loan_id: LOAN_IDS.loan4, category: 'INC', condition_id: 'INC-004', title: 'Tax Returns', description: 'Complete signed federal tax returns', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond50, loan_id: LOAN_IDS.loan4, category: 'ASSET', condition_id: 'ASSET-001', title: 'Bank Statements', description: 'Most recent 2 months bank statements', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond51, loan_id: LOAN_IDS.loan4, category: 'PROP', condition_id: 'PROP-001', title: 'Appraisal Report', description: 'Full appraisal report', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond52, loan_id: LOAN_IDS.loan4, category: 'PROP', condition_id: 'PROP-002', title: 'Purchase Agreement', description: 'Fully executed purchase agreement', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(2), need_brw_request_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond53, loan_id: LOAN_IDS.loan4, category: 'PROP', condition_id: 'PROP-009', title: 'Rent Schedule', description: 'Appraisal rent schedule', source_type: 'INT', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond54, loan_id: LOAN_IDS.loan4, category: 'TITLE', condition_id: 'TITLE-001', title: 'Title Commitment', description: 'Preliminary title report', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond55, loan_id: LOAN_IDS.loan4, category: 'INSUR', condition_id: 'INSUR-001', title: 'Hazard Insurance', description: 'Evidence of hazard insurance', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond56, loan_id: LOAN_IDS.loan4, category: 'DISC', condition_id: 'DISC-001', title: 'Initial Disclosures', description: 'Signed initial disclosure package', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'Need Brw Request', status_date: daysAgo(1), status_set_by: 'Sarah Processor', new_date: daysAgo(2), need_brw_request_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond57, loan_id: LOAN_IDS.loan4, category: 'CLSNG', condition_id: 'CLSNG-001', title: 'Final Closing Disclosure', description: 'Final Closing Disclosure', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond58, loan_id: LOAN_IDS.loan4, category: 'INC', condition_id: 'INC-001', title: 'Verify Employment', description: 'Verbal VOE from current employer', source_type: 'INT', condition_class: 'Processor III', stage: 'Prior to Funding', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond59, loan_id: LOAN_IDS.loan4, category: 'ASSET', condition_id: 'ASSET-004', title: 'Source of Down Payment', description: 'Documentation of down payment source', source_type: 'BRW', condition_class: 'UW', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
    { id: CONDITION_IDS.cond60, loan_id: LOAN_IDS.loan4, category: 'APP', condition_id: 'APP-001', title: 'Updated 1003 Application', description: 'Signed final loan application', source_type: 'BRW', condition_class: 'Processor III', stage: 'Prior to Docs', status: 'New', status_date: daysAgo(1), status_set_by: 'System', new_date: daysAgo(1), follow_up_flag: false },
  ];

  const docRequestsData = [
    { id: DOC_REQUEST_IDS.dr1, condition_id: CONDITION_IDS.cond1, fulfillment_party: 'APP1', document_type: 'Pay Stubs', description_for_borrower: 'Please provide your most recent 30 days of pay stubs.', status: 'Pending', requested_date: daysAgo(3) },
    { id: DOC_REQUEST_IDS.dr2, condition_id: CONDITION_IDS.cond2, fulfillment_party: 'APP1', document_type: 'Bank Statements', description_for_borrower: 'Please provide 2 months of bank statements.', status: 'Complete', requested_date: daysAgo(5) },
    { id: DOC_REQUEST_IDS.dr3, condition_id: CONDITION_IDS.cond4, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please provide a letter explaining credit inquiries.', status: 'Need to Request', requested_date: null },
    { id: DOC_REQUEST_IDS.dr4, condition_id: CONDITION_IDS.cond8, fulfillment_party: 'APP1', document_type: 'W-2 Forms', description_for_borrower: 'Please provide W-2 forms for 2022 and 2023.', status: 'Pending', requested_date: daysAgo(5) },
    { id: DOC_REQUEST_IDS.dr5, condition_id: CONDITION_IDS.cond16, fulfillment_party: 'APP1', document_type: 'Tax Returns', description_for_borrower: 'Please provide tax returns for 2022 and 2023.', status: 'Pending', requested_date: daysAgo(4) },
    { id: DOC_REQUEST_IDS.dr6, condition_id: CONDITION_IDS.cond17, fulfillment_party: 'APP1', document_type: 'Bank Statements', description_for_borrower: 'Please provide checking account statements.', status: 'Complete', requested_date: daysAgo(3) },
    { id: DOC_REQUEST_IDS.dr7, condition_id: CONDITION_IDS.cond19, fulfillment_party: 'APP1', document_type: 'Employment Verification', description_for_borrower: 'Please provide business documentation.', status: 'Need to Request', requested_date: null },
    { id: DOC_REQUEST_IDS.dr8, condition_id: CONDITION_IDS.cond45, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please provide lease agreements.', status: 'New', requested_date: null },
    { id: DOC_REQUEST_IDS.dr9, condition_id: CONDITION_IDS.cond46, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please provide government ID.', status: 'Need to Request', requested_date: null },
    { id: DOC_REQUEST_IDS.dr10, condition_id: CONDITION_IDS.cond52, fulfillment_party: 'APP1', document_type: 'Miscellaneous', description_for_borrower: 'Please provide purchase agreement.', status: 'Need to Request', requested_date: null },
  ];

  const conditionDocumentsData = [
    { id: DOCUMENT_IDS.doc1, loan_id: LOAN_IDS.loan1, doc_request_id: DOC_REQUEST_IDS.dr2, document_name: 'Chase_Checking_Dec2024.pdf', document_type: 'Bank Statements', description: 'Chase checking statement December 2024', status: 'Need to Review', file_url: null, thumbnail_url: null, file_size: 245000, mime_type: 'application/pdf', original_filename: 'Chase_Checking_Dec2024.pdf', page_count: 4 },
    { id: DOCUMENT_IDS.doc2, loan_id: LOAN_IDS.loan1, doc_request_id: DOC_REQUEST_IDS.dr2, document_name: 'Chase_Checking_Nov2024.pdf', document_type: 'Bank Statements', description: 'Chase checking statement November 2024', status: 'Reviewed', file_url: null, thumbnail_url: null, file_size: 238000, mime_type: 'application/pdf', original_filename: 'Chase_Checking_Nov2024.pdf', page_count: 3 },
    { id: DOCUMENT_IDS.doc3, loan_id: LOAN_IDS.loan1, doc_request_id: null, document_name: 'Appraisal_Report.pdf', document_type: 'Appraisal', description: 'Full appraisal report', status: 'Approved', file_url: null, thumbnail_url: null, file_size: 1250000, mime_type: 'application/pdf', original_filename: 'Appraisal_Report.pdf', page_count: 28 },
    { id: DOCUMENT_IDS.doc4, loan_id: LOAN_IDS.loan1, doc_request_id: null, document_name: 'Insurance_Binder.pdf', document_type: 'Hazard Insurance Binder', description: 'Hazard insurance binder', status: 'Approved', file_url: null, thumbnail_url: null, file_size: 125000, mime_type: 'application/pdf', original_filename: 'Insurance_Binder.pdf', page_count: 2 },
    { id: DOCUMENT_IDS.doc5, loan_id: LOAN_IDS.loan2, doc_request_id: DOC_REQUEST_IDS.dr6, document_name: 'BofA_Checking_Dec2024.pdf', document_type: 'Bank Statements', description: 'BofA checking December 2024', status: 'Need to Review', file_url: null, thumbnail_url: null, file_size: 198000, mime_type: 'application/pdf', original_filename: 'BofA_Checking_Dec2024.pdf', page_count: 5 },
    { id: DOCUMENT_IDS.doc6, loan_id: LOAN_IDS.loan2, doc_request_id: DOC_REQUEST_IDS.dr6, document_name: 'BofA_Checking_Nov2024.pdf', document_type: 'Bank Statements', description: 'BofA checking November 2024', status: 'Reviewed', file_url: null, thumbnail_url: null, file_size: 185000, mime_type: 'application/pdf', original_filename: 'BofA_Checking_Nov2024.pdf', page_count: 4 },
    { id: DOCUMENT_IDS.doc7, loan_id: LOAN_IDS.loan1, doc_request_id: DOC_REQUEST_IDS.dr4, document_name: 'W2_2023.pdf', document_type: 'W-2 Forms', description: 'W-2 for 2023', status: 'Approved', file_url: null, thumbnail_url: null, file_size: 85000, mime_type: 'application/pdf', original_filename: 'W2_2023.pdf', page_count: 1 },
    { id: DOCUMENT_IDS.doc8, loan_id: LOAN_IDS.loan3, doc_request_id: null, document_name: 'PayStubs_Thompson.pdf', document_type: 'Pay Stubs', description: 'Pay stubs December 2024', status: 'Approved', file_url: null, thumbnail_url: null, file_size: 156000, mime_type: 'application/pdf', original_filename: 'PayStubs_Thompson.pdf', page_count: 3 },
  ];

  const documentConditionAssociationsData = [
    { id: generateUUID(), document_id: DOCUMENT_IDS.doc1, condition_id: CONDITION_IDS.cond2 },
    { id: generateUUID(), document_id: DOCUMENT_IDS.doc2, condition_id: CONDITION_IDS.cond2 },
    { id: generateUUID(), document_id: DOCUMENT_IDS.doc3, condition_id: CONDITION_IDS.cond3 },
    { id: generateUUID(), document_id: DOCUMENT_IDS.doc4, condition_id: CONDITION_IDS.cond5 },
    { id: generateUUID(), document_id: DOCUMENT_IDS.doc5, condition_id: CONDITION_IDS.cond17 },
    { id: generateUUID(), document_id: DOCUMENT_IDS.doc6, condition_id: CONDITION_IDS.cond17 },
    { id: generateUUID(), document_id: DOCUMENT_IDS.doc7, condition_id: CONDITION_IDS.cond8 },
    { id: generateUUID(), document_id: DOCUMENT_IDS.doc8, condition_id: CONDITION_IDS.cond30 },
  ];

  const documentNotesData = [
    { id: generateUUID(), document_id: DOCUMENT_IDS.doc1, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Statement complete. Checking for large deposits.' },
    { id: generateUUID(), document_id: DOCUMENT_IDS.doc3, author_name: 'Urma Underwriter', author_role: 'Underwriter', content: 'Appraisal value supports loan amount.' },
  ];

  const conditionNotesData = [
    { id: NOTE_IDS.note1, loan_id: LOAN_IDS.loan1, condition_id: CONDITION_IDS.cond1, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Borrower confirmed pay stubs coming by end of week.', note_type: 'condition', is_pinned: false, read_by_roles: ['Processor III'] },
    { id: NOTE_IDS.note2, loan_id: LOAN_IDS.loan1, condition_id: CONDITION_IDS.cond2, author_name: 'Urma Underwriter', author_role: 'Underwriter', content: 'Please verify the $5,000 deposit on page 2.', note_type: 'condition', is_pinned: true, read_by_roles: [] },
    { id: NOTE_IDS.note3, loan_id: LOAN_IDS.loan2, condition_id: CONDITION_IDS.cond16, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Borrower is self-employed, needs extra time.', note_type: 'condition', is_pinned: false, read_by_roles: ['Underwriter'] },
    { id: NOTE_IDS.note4, loan_id: LOAN_IDS.loan1, condition_id: null, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Employment verification in progress. HR will send letter by Friday.', note_type: 'update', is_pinned: true, read_by_roles: [] },
    { id: NOTE_IDS.note5, loan_id: LOAN_IDS.loan2, condition_id: null, author_name: 'Sarah Processor', author_role: 'Processor III', content: 'Title company confirmed clear title.', note_type: 'update', is_pinned: false, read_by_roles: [] },
  ];

  const noteReadStatusData = [
    { id: generateUUID(), note_id: NOTE_IDS.note1, role: 'Processor III', read_at: daysAgo(2) },
    { id: generateUUID(), note_id: NOTE_IDS.note3, role: 'Underwriter', read_at: daysAgo(2) },
  ];

  const userConditionFlagsData = [
    { id: generateUUID(), user_id: null, role: 'Processor III', condition_id: CONDITION_IDS.cond2, flag_color: 'red' },
    { id: generateUUID(), user_id: null, role: 'Underwriter', condition_id: CONDITION_IDS.cond3, flag_color: 'blue' },
    { id: generateUUID(), user_id: null, role: 'Processor III', condition_id: CONDITION_IDS.cond16, flag_color: 'yellow' },
    { id: generateUUID(), user_id: null, role: 'Processor III', condition_id: CONDITION_IDS.cond8, flag_color: 'red' },
  ];

  return {
    loansData,
    loanPartiesData,
    availableConditionsData,
    customListsData,
    customListConditionsData,
    customConditionTemplatesData,
    conditionsData,
    docRequestsData,
    conditionDocumentsData,
    documentConditionAssociationsData,
    documentNotesData,
    conditionNotesData,
    noteReadStatusData,
    userConditionFlagsData,
  };
}

const TABLES_IN_ORDER = [
  'email_history',
  'user_condition_flags',
  'note_read_status',
  'document_notes',
  'condition_notes',
  'document_condition_associations',
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

export async function clearAllSeedData(): Promise<{ success: boolean; error?: string }> {
  for (const table of TABLES_IN_ORDER) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.warn(`Warning clearing ${table}:`, error.message);
    }
  }
  return { success: true };
}

export async function seedDatabase(): Promise<{ success: boolean; error?: string }> {
  const data = generateSeedData();

  const insertOperations = [
    { table: 'loans', data: data.loansData },
    { table: 'loan_parties', data: data.loanPartiesData },
    { table: 'available_conditions', data: data.availableConditionsData },
    { table: 'custom_lists', data: data.customListsData },
    { table: 'custom_list_conditions', data: data.customListConditionsData },
    { table: 'custom_condition_templates', data: data.customConditionTemplatesData },
    { table: 'conditions', data: data.conditionsData },
    { table: 'doc_requests', data: data.docRequestsData },
    { table: 'condition_documents', data: data.conditionDocumentsData },
    { table: 'document_condition_associations', data: data.documentConditionAssociationsData },
    { table: 'document_notes', data: data.documentNotesData },
    { table: 'condition_notes', data: data.conditionNotesData },
    { table: 'note_read_status', data: data.noteReadStatusData },
    { table: 'user_condition_flags', data: data.userConditionFlagsData },
  ];

  for (const op of insertOperations) {
    const { error } = await supabase.from(op.table).insert(op.data);
    if (error) {
      return { success: false, error: `Error inserting ${op.table}: ${error.message}` };
    }
  }

  return { success: true };
}

export async function runSeedWithReset(): Promise<{ success: boolean; error?: string }> {
  const clearResult = await clearAllSeedData();
  if (!clearResult.success) {
    return clearResult;
  }

  return seedDatabase();
}
