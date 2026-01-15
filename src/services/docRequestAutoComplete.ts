import { supabase } from '../lib/supabase';

interface AutoCompleteResult {
  success: boolean;
  completedCount: number;
}

export async function autoCompleteDocRequests(
  documentType: string | null | undefined,
  conditionIds: string[]
): Promise<AutoCompleteResult> {
  if (!documentType || conditionIds.length === 0) {
    return { success: true, completedCount: 0 };
  }

  const normalizedDocType = documentType.toLowerCase();

  const { data: pendingRequests, error: fetchError } = await supabase
    .from('doc_requests')
    .select('id, document_type')
    .in('condition_id', conditionIds)
    .neq('status', 'Complete');

  if (fetchError || !pendingRequests) {
    return { success: false, completedCount: 0 };
  }

  const matchingIds = pendingRequests
    .filter((dr) => dr.document_type?.toLowerCase() === normalizedDocType)
    .map((dr) => dr.id);

  if (matchingIds.length === 0) {
    return { success: true, completedCount: 0 };
  }

  const { error: updateError } = await supabase
    .from('doc_requests')
    .update({ status: 'Complete' })
    .in('id', matchingIds);

  if (updateError) {
    return { success: false, completedCount: 0 };
  }

  return { success: true, completedCount: matchingIds.length };
}
