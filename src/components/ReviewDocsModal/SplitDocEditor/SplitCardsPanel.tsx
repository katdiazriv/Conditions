import { useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { SplitDocumentState } from '../../../hooks/useSplitDocumentEditor';
import type { ConditionWithRelations } from '../../../types/conditions';
import { SplitDocumentCard } from './SplitDocumentCard';

interface SplitCardsPanelProps {
  splits: SplitDocumentState[];
  pdfUrl: string;
  loanConditions: ConditionWithRelations[];
  onAddSplit: () => void;
  onRemoveSplit: (id: string) => void;
  onUpdateSplit: (id: string, updates: { documentName?: string; documentType?: string | null }) => void;
  onDropPage: (splitId: string, pageNum: number) => void;
  onRemovePage: (pageNum: number) => void;
  onReorderPages: (splitId: string, newPages: number[]) => void;
  onAddCondition: (splitId: string) => void;
  onUpdateCondition: (splitId: string, tempId: string, conditionId: string) => void;
  onRemoveCondition: (splitId: string, tempId: string) => void;
  getPagesDisplay: (pages: number[]) => string;
  onPreviewClick: (splitId: string) => void;
}

export function SplitCardsPanel({
  splits,
  pdfUrl,
  loanConditions,
  onAddSplit,
  onRemoveSplit,
  onUpdateSplit,
  onDropPage,
  onRemovePage,
  onReorderPages,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  getPagesDisplay,
  onPreviewClick,
}: SplitCardsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevSplitsCountRef = useRef(splits.length);

  useEffect(() => {
    if (splits.length > prevSplitsCountRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    prevSplitsCountRef.current = splits.length;
  }, [splits.length]);

  return (
    <div className="h-full flex flex-col bg-gray-200">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        <div className="space-y-4">
          {splits.map((split, index) => (
            <SplitDocumentCard
              key={split.id}
              split={split}
              index={index}
              pdfUrl={pdfUrl}
              loanConditions={loanConditions}
              pagesDisplay={getPagesDisplay(split.pages)}
              onUpdateName={(name) => onUpdateSplit(split.id, { documentName: name })}
              onUpdateType={(type) => onUpdateSplit(split.id, { documentType: type })}
              onRemove={() => onRemoveSplit(split.id)}
              onDropPage={(pageNum) => onDropPage(split.id, pageNum)}
              onRemovePage={onRemovePage}
              onReorderPages={(newPages) => onReorderPages(split.id, newPages)}
              onAddCondition={() => onAddCondition(split.id)}
              onUpdateCondition={(tempId, conditionId) => onUpdateCondition(split.id, tempId, conditionId)}
              onRemoveCondition={(tempId) => onRemoveCondition(split.id, tempId)}
              onPreviewClick={() => onPreviewClick(split.id)}
            />
          ))}

          <button
            onClick={onAddSplit}
            className="w-full py-3 bg-gray-100 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 text-cmg-teal text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Document Split
          </button>
        </div>
      </div>
    </div>
  );
}
