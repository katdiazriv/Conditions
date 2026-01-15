import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Loan } from '../types/conditions';

interface LoanContextType {
  selectedLoanId: string | null;
  setSelectedLoanId: (id: string) => void;
  selectedLoan: Loan | null;
  loading: boolean;
}

const LoanContext = createContext<LoanContextType | null>(null);

const STORAGE_KEY = 'selectedLoanId';

export function LoanProvider({ children }: { children: ReactNode }) {
  const [selectedLoanId, setSelectedLoanIdState] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeLoan();
  }, []);

  useEffect(() => {
    if (selectedLoanId) {
      fetchLoan(selectedLoanId);
    }
  }, [selectedLoanId]);

  async function initializeLoan() {
    const storedLoanId = localStorage.getItem(STORAGE_KEY);

    if (storedLoanId) {
      const { data } = await supabase
        .from('loans')
        .select('*')
        .eq('id', storedLoanId)
        .maybeSingle();

      if (data) {
        setSelectedLoanIdState(storedLoanId);
        setSelectedLoan(data);
        setLoading(false);
        return;
      }
    }

    const { data: loans } = await supabase
      .from('loans')
      .select('*')
      .order('loan_number', { ascending: true })
      .limit(1);

    if (loans && loans.length > 0) {
      const firstLoan = loans[0];
      setSelectedLoanIdState(firstLoan.id);
      setSelectedLoan(firstLoan);
      localStorage.setItem(STORAGE_KEY, firstLoan.id);
    }

    setLoading(false);
  }

  async function fetchLoan(loanId: string) {
    const { data } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .maybeSingle();

    if (data) {
      setSelectedLoan(data);
    }
  }

  function setSelectedLoanId(id: string) {
    setSelectedLoanIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <LoanContext.Provider
      value={{
        selectedLoanId,
        setSelectedLoanId,
        selectedLoan,
        loading,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
}

export function useLoanContext() {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoanContext must be used within a LoanProvider');
  }
  return context;
}
