import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { LoanParty, PartyParent } from '../types/conditions';

export function useLoanParties(loanId: string) {
  const [parties, setParties] = useState<LoanParty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loanId) {
      fetchParties();
    }
  }, [loanId]);

  async function fetchParties() {
    setLoading(true);
    const { data, error } = await supabase
      .from('loan_parties')
      .select('*')
      .eq('loan_id', loanId)
      .order('parent', { ascending: true })
      .order('party_type', { ascending: true });

    if (error) {
      console.error('Error fetching loan parties:', error);
      setLoading(false);
      return;
    }

    setParties(data || []);
    setLoading(false);
  }

  function getPartyDisplay(partyId: string): string {
    const party = parties.find(p => p.id === partyId);
    if (!party) return '';
    return `${party.party_type}: ${party.party_name}`;
  }

  function getPartiesByParent(parent: PartyParent): LoanParty[] {
    return parties.filter(p => p.parent === parent);
  }

  return {
    parties,
    loading,
    getPartyDisplay,
    getPartiesByParent,
    refetch: fetchParties,
  };
}
