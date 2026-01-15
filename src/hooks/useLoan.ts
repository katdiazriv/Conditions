import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Loan } from '../types/conditions';

export function useLoan(loanId: string | null) {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loanId) {
      fetchLoan();
    } else {
      setLoan(null);
      setLoading(false);
    }
  }, [loanId]);

  async function fetchLoan() {
    setLoading(true);
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching loan:', error);
      setLoading(false);
      return;
    }

    setLoan(data);
    setLoading(false);
  }

  return {
    loan,
    loading,
    refetch: fetchLoan,
  };
}
