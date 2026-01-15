import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { AvailableCondition } from '../types/conditions';

export function useAvailableConditions() {
  const [conditions, setConditions] = useState<AvailableCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Standard');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [listConditionIds, setListConditionIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConditions();
  }, []);

  useEffect(() => {
    if (selectedListId) {
      fetchListConditions(selectedListId);
    } else {
      setListConditionIds([]);
    }
  }, [selectedListId]);

  async function fetchConditions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('available_conditions')
      .select('*')
      .order('condition_id', { ascending: true });

    if (error) {
      console.error('Error fetching available conditions:', error);
      setLoading(false);
      return;
    }

    setConditions(data || []);
    setLoading(false);
  }

  async function fetchListConditions(listId: string) {
    const { data, error } = await supabase
      .from('custom_list_conditions')
      .select('available_condition_id')
      .eq('list_id', listId);

    if (error) {
      console.error('Error fetching list conditions:', error);
      return;
    }

    setListConditionIds((data || []).map(d => d.available_condition_id));
  }

  const filteredConditions = useMemo(() => {
    let result = [...conditions];

    if (selectedListId && listConditionIds.length > 0) {
      result = result.filter(c => listConditionIds.includes(c.id));
    } else if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'Standard') {
      result = result.filter(c => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.condition_id.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [conditions, selectedCategory, selectedListId, listConditionIds, searchQuery]);

  function selectCategory(category: string | null) {
    setSelectedCategory(category);
    setSelectedListId(null);
  }

  function selectList(listId: string | null) {
    setSelectedListId(listId);
    setSelectedCategory(null);
  }

  return {
    conditions: filteredConditions,
    allConditions: conditions,
    loading,
    selectedCategory,
    selectedListId,
    searchQuery,
    setSearchQuery,
    selectCategory,
    selectList,
    refetch: fetchConditions,
  };
}
