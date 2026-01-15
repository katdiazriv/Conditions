import { supabase } from '../lib/supabase';

export async function updateConditionExpirationFromDocument(
  conditionIds: string[],
  newExpirationDate: string
): Promise<boolean> {
  if (conditionIds.length === 0 || !newExpirationDate) {
    return true;
  }

  const newDate = new Date(newExpirationDate);
  if (isNaN(newDate.getTime())) {
    return false;
  }

  const { data: conditions, error: fetchError } = await supabase
    .from('conditions')
    .select('id, expiration_date')
    .in('id', conditionIds);

  if (fetchError) {
    console.error('Error fetching conditions for expiration update:', fetchError);
    return false;
  }

  const conditionsToUpdate: string[] = [];

  for (const condition of conditions || []) {
    if (!condition.expiration_date) {
      conditionsToUpdate.push(condition.id);
    } else {
      const existingDate = new Date(condition.expiration_date);
      if (newDate < existingDate) {
        conditionsToUpdate.push(condition.id);
      }
    }
  }

  if (conditionsToUpdate.length === 0) {
    return true;
  }

  const { error: updateError } = await supabase
    .from('conditions')
    .update({ expiration_date: newExpirationDate })
    .in('id', conditionsToUpdate);

  if (updateError) {
    console.error('Error updating condition expiration dates:', updateError);
    return false;
  }

  return true;
}
