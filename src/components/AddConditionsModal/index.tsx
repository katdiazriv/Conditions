import { useState, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRoleContext } from '../../contexts/RoleContext';
import { useAvailableConditions } from '../../hooks/useAvailableConditions';
import { useCustomLists } from '../../hooks/useCustomLists';
import { useLoanParties } from '../../hooks/useLoanParties';
import { useCurrentConditions } from '../../hooks/useCurrentConditions';
import { useNextCustomConditionNumber } from '../../hooks/useNextCustomConditionNumber';
import { useCustomConditionTemplates } from '../../hooks/useCustomConditionTemplates';
import { Button } from '../Button';
import { CategorySidebar } from './CategorySidebar';
import { AvailableConditionsPanel } from './AvailableConditionsPanel';
import { CurrentConditionsPanel } from './CurrentConditionsPanel';
import { TransferButtons } from './TransferButtons';
import { AddCustomConditionModal } from '../AddCustomConditionModal';
import type { PendingCondition, PendingCustomCondition, Condition, DocRequest } from '../../types/conditions';

interface CommittedCondition extends Condition {
  doc_requests: DocRequest[];
}

interface AddConditionsModalProps {
  loanId: string;
  onClose: () => void;
  onAdd: () => void;
}

export function AddConditionsModal({ loanId, onClose, onAdd }: AddConditionsModalProps) {
  const {
    conditions: availableConditions,
    allConditions,
    loading: loadingAvailable,
    selectedCategory,
    selectedListId,
    searchQuery,
    setSearchQuery,
    selectCategory,
    selectList,
  } = useAvailableConditions();

  const { lists } = useCustomLists();
  const { parties } = useLoanParties(loanId);
  const { conditions: committedConditions } = useCurrentConditions(loanId);
  const { nextNumber: nextConditionNumber, refetch: refetchNextNumber } = useNextCustomConditionNumber();
  const { templatesAsAvailableConditions, refetch: refetchTemplates } = useCustomConditionTemplates();
  const { selectedRole } = useRoleContext();

  const [pendingConditions, setPendingConditions] = useState<PendingCondition[]>([]);
  const [pendingCustomConditions, setPendingCustomConditions] = useState<PendingCustomCondition[]>([]);
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<Set<string>>(new Set());
  const [selectedPendingIds, setSelectedPendingIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingCustomCondition, setEditingCustomCondition] = useState<PendingCustomCondition | null>(null);
  const [showCustomTemplates, setShowCustomTemplates] = useState(false);

  const addedConditionIds = useMemo(() => {
    const ids = new Set<string>();
    committedConditions.forEach(c => ids.add(c.condition_id));
    return ids;
  }, [committedConditions]);

  const handleToggleSelectAvailable = useCallback((id: string) => {
    setSelectedAvailableIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAllAvailable = useCallback(() => {
    const sourceConditions = showCustomTemplates ? templatesAsAvailableConditions : availableConditions;
    const allSelected = sourceConditions.length > 0 &&
      sourceConditions.every(c => selectedAvailableIds.has(c.id));

    if (allSelected) {
      setSelectedAvailableIds(new Set());
    } else {
      setSelectedAvailableIds(new Set(sourceConditions.map(c => c.id)));
    }
  }, [availableConditions, templatesAsAvailableConditions, showCustomTemplates, selectedAvailableIds]);

  const handleToggleSelectPending = useCallback((tempId: string) => {
    setSelectedPendingIds(prev => {
      const next = new Set(prev);
      if (next.has(tempId)) {
        next.delete(tempId);
      } else {
        next.add(tempId);
      }
      return next;
    });
  }, []);

  const handleAddConditions = useCallback(() => {
    const sourceConditions = showCustomTemplates ? templatesAsAvailableConditions : allConditions;
    const conditionsToAdd = sourceConditions.filter(c => selectedAvailableIds.has(c.id));
    const defaultPartyId = parties.length > 0 ? parties[0].id : null;

    const newPending: PendingCondition[] = conditionsToAdd.map(condition => ({
      temp_id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      available_condition: condition,
      selected_party_id: condition.source_type === 'BRW' ? defaultPartyId : null,
      is_newly_added: true,
    }));

    setPendingConditions(prev => [...newPending, ...prev]);
    setSelectedAvailableIds(new Set());
  }, [allConditions, templatesAsAvailableConditions, showCustomTemplates, selectedAvailableIds, parties]);

  const handleRemoveConditions = useCallback(() => {
    setPendingConditions(prev =>
      prev.filter(p => !selectedPendingIds.has(p.temp_id))
    );
    setPendingCustomConditions(prev =>
      prev.filter(p => !selectedPendingIds.has(p.temp_id))
    );
    setSelectedPendingIds(new Set());
  }, [selectedPendingIds]);

  const handlePartyChange = useCallback((tempId: string, partyId: string) => {
    setPendingConditions(prev =>
      prev.map(p =>
        p.temp_id === tempId ? { ...p, selected_party_id: partyId || null } : p
      )
    );
  }, []);

  const handleTitleChange = useCallback((tempId: string, title: string) => {
    setPendingConditions(prev =>
      prev.map(p =>
        p.temp_id === tempId ? { ...p, edited_title: title } : p
      )
    );
  }, []);

  const handleDescriptionChange = useCallback((tempId: string, description: string) => {
    setPendingConditions(prev =>
      prev.map(p =>
        p.temp_id === tempId ? { ...p, edited_description: description } : p
      )
    );
  }, []);

  const handleCopyCondition = useCallback((
    condition: PendingCondition | CommittedCondition,
    isCommitted: boolean
  ) => {
    const defaultPartyId = parties.length > 0 ? parties[0].id : null;

    if (isCommitted) {
      const committed = condition as CommittedCondition;
      const availableCondition = allConditions.find(
        ac => ac.condition_id === committed.condition_id
      );
      if (!availableCondition) return;

      const newPending: PendingCondition = {
        temp_id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        available_condition: availableCondition,
        selected_party_id: availableCondition.source_type === 'BRW' ? defaultPartyId : null,
        is_newly_added: true,
      };
      setPendingConditions(prev => [newPending, ...prev]);
    } else {
      const pending = condition as PendingCondition;
      const newPending: PendingCondition = {
        temp_id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        available_condition: pending.available_condition,
        selected_party_id: pending.available_condition.source_type === 'BRW' ? defaultPartyId : null,
        is_newly_added: true,
      };
      setPendingConditions(prev => [newPending, ...prev]);
    }
  }, [allConditions, parties]);

  const getPartyDisplayForCondition = useCallback((partyType: string): string => {
    const party = parties.find(p => p.party_type === partyType);
    return party ? `${party.party_type}: ${party.party_name}` : partyType;
  }, [parties]);

  const handleAddCustomCondition = useCallback((condition: PendingCustomCondition) => {
    setPendingCustomConditions(prev => [condition, ...prev]);
  }, []);

  const handleEditCustomCondition = useCallback((condition: PendingCustomCondition) => {
    setEditingCustomCondition(condition);
    setShowCustomModal(true);
  }, []);

  const handleUpdateCustomCondition = useCallback((updatedCondition: PendingCustomCondition) => {
    setPendingCustomConditions(prev =>
      prev.map(c => c.temp_id === updatedCondition.temp_id ? updatedCondition : c)
    );
    setEditingCustomCondition(null);
  }, []);

  const handleCustomPartyChange = useCallback((tempId: string, partyId: string) => {
    setPendingCustomConditions(prev =>
      prev.map(p =>
        p.temp_id === tempId ? { ...p, selected_party_id: partyId || null } : p
      )
    );
  }, []);

  const handleCustomTitleChange = useCallback((tempId: string, title: string) => {
    setPendingCustomConditions(prev =>
      prev.map(p =>
        p.temp_id === tempId ? { ...p, title } : p
      )
    );
  }, []);

  const handleCustomDescriptionChange = useCallback((tempId: string, description: string) => {
    setPendingCustomConditions(prev =>
      prev.map(p =>
        p.temp_id === tempId ? { ...p, description } : p
      )
    );
  }, []);

  const handleOpenCustomModal = useCallback(() => {
    setEditingCustomCondition(null);
    setShowCustomModal(true);
  }, []);

  const handleCloseCustomModal = useCallback(() => {
    setShowCustomModal(false);
    setEditingCustomCondition(null);
  }, []);

  const handleSelectCustomTemplates = useCallback(() => {
    setShowCustomTemplates(true);
    selectCategory(null);
    selectList(null);
    setSelectedAvailableIds(new Set());
  }, [selectCategory, selectList]);

  const handleSelectCategoryWithReset = useCallback((category: string | null) => {
    setShowCustomTemplates(false);
    selectCategory(category);
  }, [selectCategory]);

  const handleSelectListWithReset = useCallback((listId: string | null) => {
    setShowCustomTemplates(false);
    selectList(listId);
  }, [selectList]);

  const displayedConditions = showCustomTemplates
    ? templatesAsAvailableConditions
    : availableConditions;

  const handleSave = async () => {
    if (pendingConditions.length === 0 && pendingCustomConditions.length === 0) {
      onClose();
      return;
    }

    setSaving(true);

    try {
      for (const pending of pendingConditions) {
        const ac = pending.available_condition;
        const title = pending.edited_title ?? ac.title;
        const description = pending.edited_description ?? ac.description;

        const { data: insertedCondition, error: conditionError } = await supabase
          .from('conditions')
          .insert({
            category: ac.category,
            condition_id: ac.condition_id,
            title,
            description,
            source_type: ac.source_type,
            condition_class: ac.condition_class,
            stage: ac.default_stage,
            status: 'New',
            loan_id: loanId,
          })
          .select()
          .single();

        if (conditionError) {
          console.error('Error inserting condition:', conditionError);
          continue;
        }

        if (ac.source_type === 'BRW' && pending.selected_party_id) {
          const party = parties.find(p => p.id === pending.selected_party_id);
          if (party) {
            const { error: docError } = await supabase
              .from('doc_requests')
              .insert({
                condition_id: insertedCondition.id,
                fulfillment_party: party.party_type,
                document_type: title,
                status: 'New',
              });

            if (docError) {
              console.error('Error inserting doc_request:', docError);
            }
          }
        }
      }

      for (const customCondition of pendingCustomConditions) {
        const { data: insertedCondition, error: conditionError } = await supabase
          .from('conditions')
          .insert({
            category: customCondition.category,
            condition_id: customCondition.condition_id,
            title: customCondition.title,
            description: customCondition.description,
            source_type: customCondition.source_type,
            condition_class: customCondition.condition_class,
            stage: customCondition.stage,
            status: customCondition.status,
            loan_id: loanId,
          })
          .select()
          .single();

        if (conditionError) {
          console.error('Error inserting custom condition:', conditionError);
          continue;
        }

        if (customCondition.flag_color) {
          const { error: flagError } = await supabase
            .from('user_condition_flags')
            .insert({
              role: selectedRole,
              condition_id: insertedCondition.id,
              flag_color: customCondition.flag_color,
            });

          if (flagError) {
            console.error('Error inserting flag:', flagError);
          }
        }

        if (customCondition.source_type === 'BRW' && customCondition.selected_party_id) {
          const party = parties.find(p => p.id === customCondition.selected_party_id);
          if (party) {
            const { error: docError } = await supabase
              .from('doc_requests')
              .insert({
                condition_id: insertedCondition.id,
                fulfillment_party: party.party_type,
                document_type: customCondition.title,
                status: 'New',
              });

            if (docError) {
              console.error('Error inserting doc_request:', docError);
            }
          }
        }

        for (const docRequest of customCondition.doc_requests) {
          const { error: docError } = await supabase
            .from('doc_requests')
            .insert({
              condition_id: insertedCondition.id,
              fulfillment_party: docRequest.fulfillment_party,
              document_type: docRequest.document_type,
              description_for_borrower: docRequest.description_for_borrower,
              status: 'New',
            });

          if (docError) {
            console.error('Error inserting doc_request:', docError);
          }
        }

        if (customCondition.save_as_template) {
          const { error: templateError } = await supabase
            .from('custom_condition_templates')
            .insert({
              user_id: null,
              category: customCondition.category,
              condition_number: customCondition.condition_number,
              title: customCondition.title,
              description: customCondition.description,
              source_type: customCondition.source_type,
              condition_class: customCondition.condition_class,
              default_stage: customCondition.stage,
            });

          if (templateError) {
            console.error('Error saving template:', templateError);
          } else {
            refetchTemplates();
            refetchNextNumber();
          }
        }
      }

      onAdd();
      onClose();
    } catch (error) {
      console.error('Error saving conditions:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full h-full max-w-[95vw] max-h-[90vh] m-4 bg-white rounded-lg shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h1 className="text-base font-bold text-gray-900">Add Conditions</h1>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex min-h-0">
          <CategorySidebar
            lists={lists}
            selectedCategory={selectedCategory}
            selectedListId={selectedListId}
            showCustomTemplates={showCustomTemplates}
            onSelectCategory={handleSelectCategoryWithReset}
            onSelectList={handleSelectListWithReset}
            onSelectCustomTemplates={handleSelectCustomTemplates}
          />

          <AvailableConditionsPanel
            conditions={displayedConditions}
            addedConditionIds={addedConditionIds}
            selectedIds={selectedAvailableIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleSelect={handleToggleSelectAvailable}
            onSelectAll={handleSelectAllAvailable}
            onCustomClick={handleOpenCustomModal}
            loading={loadingAvailable}
          />

          <TransferButtons
            onAdd={handleAddConditions}
            onRemove={handleRemoveConditions}
            addDisabled={selectedAvailableIds.size === 0}
            removeDisabled={selectedPendingIds.size === 0}
          />

          <CurrentConditionsPanel
            committedConditions={committedConditions}
            pendingConditions={pendingConditions}
            pendingCustomConditions={pendingCustomConditions}
            parties={parties}
            selectedPendingIds={selectedPendingIds}
            onToggleSelectPending={handleToggleSelectPending}
            onPartyChange={handlePartyChange}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
            onCopyCondition={handleCopyCondition}
            onEditCustomCondition={handleEditCustomCondition}
            onCustomPartyChange={handleCustomPartyChange}
            onCustomTitleChange={handleCustomTitleChange}
            onCustomDescriptionChange={handleCustomDescriptionChange}
            getPartyDisplay={getPartyDisplayForCondition}
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </div>

      {showCustomModal && (
        <AddCustomConditionModal
          loanId={loanId}
          parties={parties}
          nextConditionNumber={nextConditionNumber + pendingCustomConditions.length}
          editingCondition={editingCustomCondition}
          onClose={handleCloseCustomModal}
          onAddCondition={editingCustomCondition ? handleUpdateCustomCondition : handleAddCustomCondition}
        />
      )}
    </div>
  );
}
