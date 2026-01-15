import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CustomConditionTemplate, AvailableCondition } from '../types/conditions';

export function useCustomConditionTemplates() {
  const [templates, setTemplates] = useState<CustomConditionTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('custom_condition_templates')
      .select('*')
      .order('condition_number', { ascending: true });

    if (error) {
      console.error('Error fetching custom templates:', error);
      setTemplates([]);
    } else {
      setTemplates(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const templatesAsAvailableConditions: AvailableCondition[] = templates.map(template => ({
    id: template.id,
    category: template.category,
    condition_id: `${template.category}-${template.condition_number}`,
    title: template.title,
    description: template.description,
    source_type: template.source_type,
    condition_class: template.condition_class,
    default_stage: template.default_stage,
    created_at: template.created_at,
  }));

  return {
    templates,
    templatesAsAvailableConditions,
    loading,
    refetch: fetchTemplates,
  };
}
