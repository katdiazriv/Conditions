import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const STARTING_CUSTOM_NUMBER = 9001;

export function useNextCustomConditionNumber() {
  const [nextNumber, setNextNumber] = useState<number>(STARTING_CUSTOM_NUMBER);
  const [loading, setLoading] = useState(true);

  const fetchNextNumber = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('custom_condition_templates')
      .select('condition_number')
      .order('condition_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching max condition number:', error);
      setNextNumber(STARTING_CUSTOM_NUMBER);
    } else if (data) {
      setNextNumber(data.condition_number + 1);
    } else {
      setNextNumber(STARTING_CUSTOM_NUMBER);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNextNumber();
  }, [fetchNextNumber]);

  return {
    nextNumber,
    loading,
    refetch: fetchNextNumber,
  };
}
