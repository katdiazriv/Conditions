import { Trash2, MinusCircle, PlusCircle } from 'lucide-react';
import type { SplitDocumentState } from '../../../hooks/useSplitDocumentEditor';
import type { ConditionWithRelations } from '../../../types/conditions';
import { InputText } from '../../InputText';
import { SearchableDropdown } from '../../SearchableDropdown';
import { TextButton } from '../../TextButton';
import { Button } from '../../Button';
import { PageDropZone } from './PageDropZone';
import { DOCUMENT_TYPE_OPTIONS } from '../../../types/conditions';

interface SplitDocumentCardProps {
  split: SplitDocumentState;
  index: number;
  pdfUrl: string;
  loanConditions: ConditionWithRelations[];
  pagesDisplay: string;
  onUpdateName: (name: string) => void;
  onUpdateType: (type: string | null) => void;
  onRemove: () => void;
  onDropPage: (pageNum: number) => void;
  onRemovePage: (pageNum: number) => void;
  onReorderPages: (newPages: number[]) => void;
  onAddCondition: () => void;
  onUpdateCondition: (tempId: string, conditionId: string) => void;
  onRemoveCondition: (tempId: string) => void;
  onPreviewClick: () => void;
}

export function SplitDocumentCard({
  split,
  index,
  pdfUrl,
  loanConditions,
  pagesDisplay,
  onUpdateName,
  onUpdateType,
  onRemove,
  onDropPage,
  onRemovePage,
  onReorderPages,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  onPreviewClick,
}: SplitDocumentCardProps) {
  const activeConditions = loanConditions.filter((c) => c.status !== 'Cleared');
  const selectedConditionIds = split.conditionAssociations
    .map((a) => a.conditionId)
    .filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-900">Document {index + 1}</span>
        <button
          onClick={onRemove}
          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Remove split"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <SearchableDropdown
              value={split.documentType || ''}
              onChange={(value) => onUpdateType(value || null)}
              options={DOCUMENT_TYPE_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
              placeholder="Select"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Document Name
            </label>
            <InputText
              value={split.documentName}
              onChange={(e) => onUpdateName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Pages
            </label>
            <InputText
              value={pagesDisplay}
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Associated Conditions
          </label>
          <div className="space-y-2">
            {split.conditionAssociations.map((assoc) => (
              <div key={assoc.tempId} className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchableDropdown
                    value={assoc.conditionId}
                    onChange={(value) => onUpdateCondition(assoc.tempId, value)}
                    options={activeConditions
                      .filter(
                        (c) =>
                          c.id === assoc.conditionId ||
                          !selectedConditionIds.includes(c.id)
                      )
                      .map((c) => ({
                        value: c.id,
                        label: `${c.condition_id} - ${c.title}`,
                      }))}
                    placeholder="Select Condition"
                  />
                </div>
                <button
                  onClick={() => onRemoveCondition(assoc.tempId)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Remove condition"
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
              </div>
            ))}

            <TextButton
              icon={<PlusCircle />}
              size="sm"
              onClick={onAddCondition}
            >
              Associate Condition
            </TextButton>
          </div>
        </div>

        <PageDropZone
          pages={split.pages}
          pdfUrl={pdfUrl}
          onDrop={onDropPage}
          onRemovePage={onRemovePage}
          onReorder={onReorderPages}
        />

        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="md"
            onClick={onPreviewClick}
            disabled={split.pages.length === 0}
          >
            Preview Document
          </Button>
        </div>
      </div>
    </div>
  );
}
