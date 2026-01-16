import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { LoanTeamMember } from '../types/conditions';

interface UseLoanTeamMembersResult {
  members: LoanTeamMember[];
  loading: boolean;
  searchMembers: (query: string) => LoanTeamMember[];
}

export function useLoanTeamMembers(loanId: string | null): UseLoanTeamMembersResult {
  const [members, setMembers] = useState<LoanTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loanId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    async function fetchMembers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('loan_team_members')
        .select('*')
        .eq('loan_id', loanId)
        .order('name');

      if (error) {
        console.error('Error fetching loan team members:', error);
        setMembers([]);
      } else {
        setMembers(data || []);
      }
      setLoading(false);
    }

    fetchMembers();
  }, [loanId]);

  const searchMembers = useCallback(
    (query: string): LoanTeamMember[] => {
      if (!query) return members;
      const lowerQuery = query.toLowerCase();
      return members.filter(
        (member) =>
          member.name.toLowerCase().includes(lowerQuery) ||
          member.role.toLowerCase().includes(lowerQuery)
      );
    },
    [members]
  );

  return { members, loading, searchMembers };
}
