import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button';
import { CustomConditionFieldsSection } from './CustomConditionFieldsSection';
import { LocalDocRequestsSection, type LocalDocRequest } from './LocalDocRequestsSection';
import type {
  CustomConditionFormState,
  PendingCustomCondition,
  LoanParty,
  FlagColor,
} from '../../types/conditions';

interface AddCustomConditionModalProps {
  loanId: string;
  parties: LoanParty[];
  nextConditionNumber: number;
  editingCondition?: PendingCustomCondition | null;
  onClose: () => void;
  onAddCondition: (condition: PendingCustomCondition) => void;
}

const DEFAULT_FORM_STATE: CustomConditionFormState = {
  title: '',
  description: '',
  category: 'MISC',
  status: 'New',
  stage: 'Prior to Docs',
  condition_class: 'UW',
  source_type: 'BRW',
  save_as_template: false,
};

export function AddCustomConditionModal({
  loanId,
  parties,
  nextConditionNumber,
  editingCondition,
  onClose,
  onAddCondition,
}: AddCustomConditionModalProps) {
  const isEditing = !!editingCondition;

  const [formState, setFormState] = useState<CustomConditionFormState>(() => {
    if (editingCondition) {
      return {
        title: editingCondition.title,
        description: editingCondition.description,
        category: editingCondition.category,
        status: editingCondition.status,
        stage: editingCondition.stage,
        condition_class: editingCondition.condition_class,
        source_type: editingCondition.source_type,
        save_as_template: editingCondition.save_as_template,
      };
    }
    return DEFAULT_FORM_STATE;
  });

  const [flagColor, setFlagColor] = useState<FlagColor | null>(() => {
    return editingCondition?.flag_color ?? null;
  });

  const [docRequests, setDocRequests] = useState<LocalDocRequest[]>(() => {
    if (editingCondition) {
      return editingCondition.doc_requests.map((dr, index) => ({
        temp_id: `doc-edit-${index}-${Date.now()}`,
        document_type: dr.document_type,
        fulfillment_party: dr.fulfillment_party,
        description_for_borrower: dr.description_for_borrower || '',
      }));
    }
    return [];
  });

  const [adding, setAdding] = useState(false);

  const conditionNumber = isEditing ? editingCondition.condition_number : nextConditionNumber;

  const handleFieldChange = useCallback(<K extends keyof CustomConditionFormState>(
    field: K,
    value: CustomConditionFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFlagChange = useCallback((color: FlagColor | null) => {
    setFlagColor(color);
  }, []);

  const handleAddDocRequest = useCallback((docRequest: Omit<LocalDocRequest, 'temp_id'>) => {
    const newDocRequest: LocalDocRequest = {
      ...docRequest,
      temp_id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setDocRequests((prev) => [...prev, newDocRequest]);
  }, []);

  const handleUpdateDocRequest = useCallback((tempId: string, data: Partial<LocalDocRequest>) => {
    setDocRequests((prev) =>
      prev.map((dr) => (dr.temp_id === tempId ? { ...dr, ...data } : dr))
    );
  }, []);

  const handleDeleteDocRequest = useCallback((tempId: string) => {
    setDocRequests((prev) => prev.filter((dr) => dr.temp_id !== tempId));
  }, []);

  const handleAddCondition = useCallback(() => {
    if (!formState.title.trim()) return;

    setAdding(true);

    const conditionId = `${formState.category}-${conditionNumber}`;
    const defaultPartyId = parties.length > 0 ? parties[0].id : null;
    const existingPartyId = isEditing ? editingCondition.selected_party_id : null;

    const pendingCondition: PendingCustomCondition = {
      temp_id: isEditing
        ? editingCondition.temp_id
        : `pending-custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: formState.category,
      condition_number: conditionNumber,
      condition_id: conditionId,
      title: formState.title,
      description: formState.description,
      source_type: formState.source_type,
      condition_class: formState.condition_class,
      stage: formState.stage,
      status: formState.status,
      flag_color: flagColor,
      save_as_template: formState.save_as_template,
      selected_party_id: formState.source_type === 'BRW'
        ? (existingPartyId || defaultPartyId)
        : null,
      is_custom: true,
      doc_requests: docRequests.map((dr) => ({
        fulfillment_party: dr.fulfillment_party,
        document_type: dr.document_type,
        description_for_borrower: dr.description_for_borrower,
      })),
      notes: [],
    };

    onAddCondition(pendingCondition);
    setAdding(false);
    onClose();
  }, [formState, conditionNumber, parties, docRequests, onAddCondition, onClose, isEditing, editingCondition, flagColor]);

  const isValid = formState.title.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg w-full max-w-[540px] max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">
            {isEditing ? 'Edit Custom Condition' : 'Add Custom Condition'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <CustomConditionFieldsSection
            formState={formState}
            conditionNumber={conditionNumber}
            flagColor={flagColor}
            onFieldChange={handleFieldChange}
            onFlagChange={handleFlagChange}
          />

          <div className="mt-8">
            <LocalDocRequestsSection
              docRequests={docRequests}
              parties={parties}
              onAdd={handleAddDocRequest}
              onUpdate={handleUpdateDocRequest}
              onDelete={handleDeleteDocRequest}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleAddCondition}
            disabled={adding || !isValid}
          >
            {adding
              ? (isEditing ? 'Updating...' : 'Adding...')
              : (isEditing ? 'Update Condition' : 'Add Condition')}
          </Button>
        </div>
      </div>
    </div>
  );
}
