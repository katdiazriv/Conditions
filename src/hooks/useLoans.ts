import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Loan } from '../types/conditions';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  async function fetchLoans() {
    setLoading(true);
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('loan_number', { ascending: true });

    if (error) {
      console.error('Error fetching loans:', error);
      setLoading(false);
      return;
    }

    setLoans(data || []);
    setLoading(false);
  }

  async function updateLoanDescription(loanId: string, description: string) {
    const { error } = await supabase
      .from('loans')
      .update({ description })
      .eq('id', loanId);

    if (error) {
      console.error('Error updating loan description:', error);
      return false;
    }

    setLoans(prev =>
      prev.map(loan =>
        loan.id === loanId ? { ...loan, description } : loan
      )
    );
    return true;
  }

  return {
    loans,
    loading,
    updateLoanDescription,
    refetch: fetchLoans,
  };
}
