/*
  # Seed Demo Data

  Populates demo data for:
  - loan_parties: Sample borrowers for a demo loan
  - custom_lists: User-saved condition lists
  - custom_list_conditions: Links conditions to custom lists

  Uses a fixed demo loan_id for consistency across the application.
*/

DO $$
DECLARE
  demo_loan_id uuid := '11111111-1111-1111-1111-111111111111';
  list_joe_id uuid;
  list_favorites_id uuid;
  cond_asset_500 uuid;
  cond_asset_501 uuid;
  cond_inc_400 uuid;
  cond_inc_401 uuid;
  cond_cred_100 uuid;
  cond_emp_200 uuid;
  cond_prop_300 uuid;
  cond_title_600 uuid;
BEGIN
  INSERT INTO loan_parties (loan_id, party_type, party_name) VALUES
    (demo_loan_id, 'B1', 'Briana Borrower'),
    (demo_loan_id, 'APP1', 'Andrew Applicant'),
    (demo_loan_id, 'CB1', 'Carlos Co-Borrower')
  ON CONFLICT DO NOTHING;

  INSERT INTO custom_lists (id, user_id, name) VALUES
    (gen_random_uuid(), NULL, 'Joe Underwriter''s List')
  RETURNING id INTO list_joe_id;

  INSERT INTO custom_lists (id, user_id, name) VALUES
    (gen_random_uuid(), NULL, 'My Favorites')
  RETURNING id INTO list_favorites_id;

  SELECT id INTO cond_asset_500 FROM available_conditions WHERE condition_id = 'ASSET-500';
  SELECT id INTO cond_asset_501 FROM available_conditions WHERE condition_id = 'ASSET-501';
  SELECT id INTO cond_inc_400 FROM available_conditions WHERE condition_id = 'INC-400';
  SELECT id INTO cond_inc_401 FROM available_conditions WHERE condition_id = 'INC-401';
  SELECT id INTO cond_cred_100 FROM available_conditions WHERE condition_id = 'CRED-100';
  SELECT id INTO cond_emp_200 FROM available_conditions WHERE condition_id = 'EMP-200';
  SELECT id INTO cond_prop_300 FROM available_conditions WHERE condition_id = 'PROP-300';
  SELECT id INTO cond_title_600 FROM available_conditions WHERE condition_id = 'TITLE-600';

  INSERT INTO custom_list_conditions (list_id, available_condition_id) VALUES
    (list_joe_id, cond_asset_500),
    (list_joe_id, cond_inc_400),
    (list_joe_id, cond_inc_401),
    (list_joe_id, cond_cred_100),
    (list_joe_id, cond_emp_200);

  INSERT INTO custom_list_conditions (list_id, available_condition_id) VALUES
    (list_favorites_id, cond_asset_500),
    (list_favorites_id, cond_asset_501),
    (list_favorites_id, cond_prop_300),
    (list_favorites_id, cond_title_600);

END $$;
