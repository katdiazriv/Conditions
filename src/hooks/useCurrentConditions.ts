import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Condition, DocRequest } from '../types/conditions';

interface CurrentCondition extends Condition {
  doc_requests: DocRequest[];
}

export function useCurrentConditions(loanId: string) {
  const [conditions, setConditions] = useState<CurrentCondition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loanId) {
      fetchConditions();
    }
  }, [loanId]);

  async function fetchConditions() {
    setLoading(true);

    const { data: conditionsData, error: conditionsError } = await supabase
      .from('conditions')
      .select('*')
      .eq('loan_id', loanId)
      .order('condition_id', { ascending: true });

    if (conditionsError) {
      console.error('Error fetching current conditions:', conditionsError);
      setLoading(false);
      return;
    }

    const { data: docRequests } = await supabase
      .from('doc_requests')
      .select('*');

    const conditionsWithDocs: CurrentCondition[] = (conditionsData || []).map(
      condition => ({
        ...condition,
        doc_requests: (docRequests || []).filter(
          dr => dr.condition_id === condition.id
        ),
      })
    );

    setConditions(conditionsWithDocs);
    setLoading(false);
  }

  function getConditionIds(): string[] {
    return conditions.map(c => c.condition_id);
  }

  return {
    conditions,
    loading,
    getConditionIds,
    refetch: fetchConditions,
  };
}
