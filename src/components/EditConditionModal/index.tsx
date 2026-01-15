import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useConditionDetail } from '../../hooks/useConditionDetail';
import { useLoanParties } from '../../hooks/useLoanParties';
import { Button } from '../Button';
import { ConditionFieldsSection } from './ConditionFieldsSection';
import { DocRequestsSection } from './DocRequestsSection';
import { ExceptionRequestSection } from './ExceptionRequestSection';
import { DatesSection } from './DatesSection';
import { NotesSection } from './NotesSection';
import type {
  ConditionStatus,
  Stage,
  ConditionClass,
  SourceType,
  FlagColor,
} from '../../types/conditions';

interface EditConditionModalProps {
  conditionId: string;
  loanId: string;
  flagColor: FlagColor | null;
  onClose: () => void;
  onUpdate: () => void;
  onFlagChange: (color: FlagColor | null) => void;
}

interface FormState {
  title: string;
  description: string;
  status: ConditionStatus;
  stage: Stage;
  condition_class: ConditionClass;
  source_type: SourceType;
  follow_up_flag: boolean;
  expiration_date: string;
  follow_up_date: string;
}

export function EditConditionModal({
  conditionId,
  loanId,
  flagColor,
  onClose,
  onUpdate,
  onFlagChange,
}: EditConditionModalProps) {
  const {
    condition,
    loading,
    saving,
    updateCondition,
    addDocRequest,
    updateDocRequest,
    deleteDocRequest,
    addNote,
  } = useConditionDetail(conditionId);

  const { parties } = useLoanParties(loanId);

  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
    status: 'New',
    stage: 'Prior to Docs',
    condition_class: 'UW',
    source_type: 'BRW',
    follow_up_flag: false,
    expiration_date: '',
    follow_up_date: '',
  });

  useEffect(() => {
    if (condition) {
      setFormState({
        title: condition.title,
        description: condition.description,
        status: condition.status,
        stage: condition.stage,
        condition_class: condition.condition_class,
        source_type: condition.source_type,
        follow_up_flag: condition.follow_up_flag || false,
        expiration_date: condition.expiration_date?.split('T')[0] || '',
        follow_up_date: condition.follow_up_date?.split('T')[0] || '',
      });
    }
  }, [condition]);

  function handleFieldChange<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  async function handleUpdate() {
    const success = await updateCondition({
      title: formState.title,
      description: formState.description,
      status: formState.status,
      stage: formState.stage,
      condition_class: formState.condition_class,
      source_type: formState.source_type,
      follow_up_flag: formState.follow_up_flag,
      expiration_date: formState.expiration_date || null,
      follow_up_date: formState.follow_up_date || null,
    });

    if (success) {
      onUpdate();
      onClose();
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-gray-500">Loading condition...</div>
        </div>
      </div>
    );
  }

  if (!condition) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-[540px] max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Edit Condition</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <ConditionFieldsSection
            condition={condition}
            formState={formState}
            flagColor={flagColor}
            onFieldChange={handleFieldChange}
            onFlagChange={onFlagChange}
          />

          <div className="mt-8">
            <DocRequestsSection
              docRequests={condition.doc_requests}
              parties={parties}
              onAdd={addDocRequest}
              onUpdate={updateDocRequest}
              onDelete={deleteDocRequest}
            />
          </div>

          <ExceptionRequestSection
            requestedDate={condition.exception_requested_date}
            status={condition.exception_status}
          />

          <DatesSection
            expirationDate={formState.expiration_date}
            followUpDate={formState.follow_up_date}
            onExpirationDateChange={(date) =>
              handleFieldChange('expiration_date', date)
            }
            onFollowUpDateChange={(date) =>
              handleFieldChange('follow_up_date', date)
            }
            condition={condition}
          />

          <NotesSection
            notes={condition.notes}
            onAddNote={addNote}
          />
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
            onClick={handleUpdate}
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>
    </div>
  );
}
