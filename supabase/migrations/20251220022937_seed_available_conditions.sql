/*
  # Seed Available Conditions

  Populates the available_conditions table with realistic mortgage condition templates
  organized by category. These serve as the master library from which conditions
  are copied when added to a loan.

  Categories included:
    - ASSET (Asset verification)
    - CRED (Credit related)
    - INC (Income verification)
    - EMP (Employment verification)
    - PROP (Property related)
    - TITLE (Title and legal)
    - APPR (Appraisal)
    - INSUR (Insurance)
    - GOV (Government/compliance)
    - MISC (Miscellaneous)
*/

INSERT INTO available_conditions (category, condition_id, title, description, source_type, condition_class, responsibility, default_stage) VALUES
-- ASSET conditions
('ASSET', 'ASSET-500', 'Sufficient Funds', 'Provide bank statements for all accounts showing sufficient funds to close for the most recent 2 months. All pages must be included.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('ASSET', 'ASSET-501', 'Large Deposit', 'Provide documentation explaining and sourcing the large deposit(s) identified on bank statements. Include paper trail showing source of funds.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('ASSET', 'ASSET-502', 'Gift Funds', 'Provide signed gift letter from donor confirming funds are a gift with no expectation of repayment. Include donor bank statements showing ability to gift.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('ASSET', 'ASSET-503', 'Retirement Funds', 'Provide most recent quarterly statement for retirement account(s) showing current balance and vesting status.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('ASSET', 'ASSET-504', 'Stock/Investment Accounts', 'Provide most recent 2 months statements for all investment accounts to be used for closing funds.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('ASSET', 'ASSET-505', 'Business Funds', 'Provide business bank statements for most recent 2 months if using business funds for closing. Include CPA letter confirming withdrawal will not impact business.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('ASSET', 'ASSET-506', 'Earnest Money', 'Provide copy of earnest money deposit check (front and back) and bank statement showing check cleared.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),

-- CRED conditions
('CRED', 'CRED-100', 'Credit Explanation', 'Provide written letter of explanation for derogatory credit items identified on credit report.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('CRED', 'CRED-101', 'Verification of Rent', 'Provide 12 months cancelled checks or bank statements showing rental payment history.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('CRED', 'CRED-102', 'Judgments/Liens', 'Provide documentation showing judgment/lien has been satisfied or payment arrangement in place.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('CRED', 'CRED-103', 'Collections', 'Provide documentation regarding collection accounts. Medical collections over $2,000 require explanation.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('CRED', 'CRED-104', 'Bankruptcy', 'Provide complete bankruptcy discharge documents including schedule of debts.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('CRED', 'CRED-105', 'Credit Supplement', 'Order credit supplement to update credit report with additional tradelines or updated balances.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),

-- INC conditions
('INC', 'INC-400', 'Paystubs', 'Provide most recent 30 days of paystubs covering current pay period.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('INC', 'INC-401', 'W-2s', 'Provide W-2 forms for the most recent 2 years from all employers.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('INC', 'INC-402', 'Tax Returns', 'Provide complete signed federal tax returns for most recent 2 years including all schedules.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('INC', 'INC-403', 'Self-Employment', 'Provide business tax returns for most recent 2 years. Include year-to-date profit and loss statement.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('INC', 'INC-404', 'Social Security', 'Provide Social Security Award letter showing current benefit amount.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('INC', 'INC-405', 'Pension/Retirement', 'Provide pension or retirement award letter showing monthly benefit amount.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('INC', 'INC-406', 'Child Support/Alimony', 'Provide divorce decree or court order and 12 months proof of receipt.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('INC', 'INC-407', 'Rental Income', 'Provide current signed lease agreements and 2 years tax returns showing rental income.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('INC', 'INC-408', '4506-C Transcript', 'Order IRS transcripts to verify income reported on tax returns.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),

-- EMP conditions
('EMP', 'EMP-200', 'VOE', 'Obtain written verification of employment from current employer confirming position, start date, and income.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),
('EMP', 'EMP-201', 'Verbal VOE', 'Complete verbal verification of employment within 10 business days of closing.', 'INT', 'Processor III', 'Processor', 'Prior to Funding'),
('EMP', 'EMP-202', 'Employment Gap', 'Provide written explanation for gap in employment history.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('EMP', 'EMP-203', 'New Employment', 'Provide offer letter and first paystub from new employer.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('EMP', 'EMP-204', 'CPA Letter', 'Provide CPA letter confirming self-employment for minimum 2 years and business in good standing.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),

-- PROP conditions
('PROP', 'PROP-300', 'HOA Cert', 'Obtain HOA certificate/questionnaire confirming dues, reserves, and litigation status.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),
('PROP', 'PROP-301', 'Property Survey', 'Provide current property survey showing boundaries and improvements.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),
('PROP', 'PROP-302', 'Termite Inspection', 'Provide termite/pest inspection report. Any treatment required must be completed prior to closing.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),
('PROP', 'PROP-303', 'Well/Septic', 'Provide well water test and septic inspection report meeting lender requirements.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),
('PROP', 'PROP-304', 'Occupancy', 'Provide signed occupancy affidavit confirming intent to occupy as primary residence.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('PROP', 'PROP-305', 'REO Rental', 'Provide current lease agreement and proof of rental income for all retained properties.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),

-- TITLE conditions
('TITLE', 'TITLE-600', 'Title Commitment', 'Review and clear all title commitment requirements and exceptions.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),
('TITLE', 'TITLE-601', 'Clear Prior Liens', 'Confirm all prior liens will be paid off at closing. Obtain payoff statements.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),
('TITLE', 'TITLE-602', 'Power of Attorney', 'Provide recorded Power of Attorney if borrower will not be present at closing.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),
('TITLE', 'TITLE-603', 'Trust Review', 'Provide complete copy of trust agreement for title review and vesting confirmation.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('TITLE', 'TITLE-604', 'Name Affidavit', 'Provide name affidavit to clear name variations appearing in title search.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),

-- APPR conditions
('APPR', 'APPR-700', 'Appraisal Ordered', 'Order appraisal and confirm property access with borrower/agent.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),
('APPR', 'APPR-701', 'Appraisal Review', 'Review appraisal for accuracy and compliance with guidelines.', 'INT', 'UW', 'Underwriter', 'Prior to Docs'),
('APPR', 'APPR-702', 'Repairs Required', 'Complete required repairs identified in appraisal. Provide photos and receipts upon completion.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('APPR', 'APPR-703', 'Re-inspection', 'Order re-inspection to verify completion of required repairs.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),
('APPR', 'APPR-704', 'Second Appraisal', 'Order second appraisal due to value dispute or guideline requirement.', 'INT', 'UW', 'Underwriter', 'Prior to Docs'),

-- INSUR conditions
('INSUR', 'INSUR-800', 'Homeowners Insurance', 'Provide evidence of homeowners insurance with mortgagee clause and coverage meeting loan requirements.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),
('INSUR', 'INSUR-801', 'Flood Insurance', 'Property is in flood zone. Provide evidence of flood insurance meeting minimum requirements.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),
('INSUR', 'INSUR-802', 'Condo Insurance', 'Provide master insurance policy and HO-6 walls-in coverage for condominium.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),
('INSUR', 'INSUR-803', 'Wind/Hail', 'Provide evidence of wind/hail coverage if not included in standard homeowners policy.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),

-- GOV conditions
('GOV', 'GOV-1050', 'USDA Eligibility', 'Verify property and borrower eligibility for USDA financing.', 'INT', 'UW', 'Underwriter', 'Prior to Docs'),
('GOV', 'GOV-1051', 'VA Entitlement', 'Obtain Certificate of Eligibility and verify available entitlement.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),
('GOV', 'GOV-1052', 'FHA Case Number', 'Obtain FHA case number assignment and CAIVRS clearance.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),
('GOV', 'GOV-1053', 'VA NOV', 'Obtain VA Notice of Value and review for conditions.', 'INT', 'Processor III', 'Processor', 'Prior to Docs'),
('GOV', 'GOV-1054', 'URLA/4506', 'Obtain updated and signed Uniform Residential Loan Application and 4506-C.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),
('GOV', 'GOV-1055', 'SSA-89', 'Provide signed SSA-89 form for Social Security number verification.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),
('GOV', 'GOV-1056', 'Compliance Review', 'Complete compliance review of loan file for regulatory requirements.', 'INT', 'UW', 'Underwriter', 'Prior to Funding'),
('GOV', 'GOV-1057', 'Final CD Review', 'Review final Closing Disclosure for accuracy prior to consummation.', 'INT', 'Processor III', 'Processor', 'Prior to Funding'),

-- MISC conditions
('MISC', 'MISC-900', 'AUS Findings', 'Clear all DU/LP findings and conditions prior to final approval.', 'INT', 'UW', 'Underwriter', 'Prior to Docs'),
('MISC', 'MISC-901', 'Identity Verification', 'Provide copy of valid government-issued photo ID for all borrowers.', 'BRW', 'Processor III', 'Processor', 'Prior to Docs'),
('MISC', 'MISC-902', 'Divorce Decree', 'Provide complete divorce decree including property settlement agreement.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('MISC', 'MISC-903', 'Child Support Order', 'Provide court order establishing child support obligation.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('MISC', 'MISC-904', 'Residency Status', 'Provide documentation of legal residency status (green card, visa, work permit).', 'BRW', 'UW', 'Underwriter', 'Prior to Docs'),
('MISC', 'MISC-905', 'Additional Info', 'Provide additional information or documentation as requested by underwriter.', 'BRW', 'UW', 'Underwriter', 'Prior to Docs')

ON CONFLICT (condition_id) DO NOTHING;
