import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { FlagColor } from '../types/conditions';

export function useConditionFlags(loanId: string, role: string) {
  const [flagMap, setFlagMap] = useState<Map<string, FlagColor>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    const { data: conditions } = await supabase
      .from('conditions')
      .select('id')
      .eq('loan_id', loanId);

    if (!conditions || conditions.length === 0) {
      setFlagMap(new Map());
      setLoading(false);
      return;
    }

    const conditionIds = conditions.map((c) => c.id);

    const { data: flags, error } = await supabase
      .from('user_condition_flags')
      .select('condition_id, flag_color')
      .eq('role', role)
      .in('condition_id', conditionIds);

    if (error) {
      console.error('Error fetching flags:', error);
      setLoading(false);
      return;
    }

    const map = new Map<string, FlagColor>();
    (flags || []).forEach((flag) => {
      map.set(flag.condition_id, flag.flag_color as FlagColor);
    });
    setFlagMap(map);
    setLoading(false);
  }, [loanId, role]);

  useEffect(() => {
    if (loanId) {
      fetchFlags();
    }
  }, [loanId, fetchFlags]);

  async function setFlag(conditionId: string, color: FlagColor | null): Promise<boolean> {
    if (color === null) {
      const { error } = await supabase
        .from('user_condition_flags')
        .delete()
        .eq('role', role)
        .eq('condition_id', conditionId);

      if (error) {
        console.error('Error removing flag:', error);
        return false;
      }

      setFlagMap((prev) => {
        const next = new Map(prev);
        next.delete(conditionId);
        return next;
      });
      return true;
    }

    const { error } = await supabase
      .from('user_condition_flags')
      .upsert(
        {
          role,
          condition_id: conditionId,
          flag_color: color,
        },
        { onConflict: 'role,condition_id' }
      );

    if (error) {
      console.error('Error setting flag:', error);
      return false;
    }

    setFlagMap((prev) => {
      const next = new Map(prev);
      next.set(conditionId, color);
      return next;
    });
    return true;
  }

  async function bulkSetFlags(conditionIds: string[], color: FlagColor | null): Promise<boolean> {
    if (color === null) {
      const { error } = await supabase
        .from('user_condition_flags')
        .delete()
        .eq('role', role)
        .in('condition_id', conditionIds);

      if (error) {
        console.error('Error bulk removing flags:', error);
        return false;
      }

      setFlagMap((prev) => {
        const next = new Map(prev);
        conditionIds.forEach((id) => next.delete(id));
        return next;
      });
      return true;
    }

    const records = conditionIds.map((conditionId) => ({
      role,
      condition_id: conditionId,
      flag_color: color,
    }));

    const { error } = await supabase
      .from('user_condition_flags')
      .upsert(records, { onConflict: 'role,condition_id' });

    if (error) {
      console.error('Error bulk setting flags:', error);
      return false;
    }

    setFlagMap((prev) => {
      const next = new Map(prev);
      conditionIds.forEach((id) => next.set(id, color));
      return next;
    });
    return true;
  }

  function getFlag(conditionId: string): FlagColor | null {
    return flagMap.get(conditionId) || null;
  }

  return {
    flagMap,
    loading,
    setFlag,
    bulkSetFlags,
    getFlag,
    refetch: fetchFlags,
  };
}
