import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CustomList } from '../types/conditions';

export function useCustomLists() {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLists();
  }, []);

  async function fetchLists() {
    setLoading(true);
    const { data, error } = await supabase
      .from('custom_lists')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching custom lists:', error);
      setLoading(false);
      return;
    }

    setLists(data || []);
    setLoading(false);
  }

  return {
    lists,
    loading,
    refetch: fetchLists,
  };
}
