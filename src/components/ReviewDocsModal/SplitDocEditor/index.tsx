import { useState, useCallback, useEffect } from 'react';
import { Scissors, Plus } from 'lucide-react';
import type { DocumentForReview } from '../../../hooks/useReviewDocsWizard';
import type { SplitDocumentState } from '../../../hooks/useSplitDocumentEditor';
import type { ConditionWithRelations } from '../../../types/conditions';
import { SourcePagesPanel } from './SourcePagesPanel';
import { SplitCardsPanel } from './SplitCardsPanel';
import { DocumentViewer } from '../DocumentViewer';
import { Checkbox } from '../../Checkbox';
import { Button } from '../../Button';
import { TextButton } from '../../TextButton';

interface SplitDocEditorProps {
  sourceDocument: DocumentForReview;
  splits: SplitDocumentState[];
  assignedPages: Set<number>;
  keepOriginalDocument: boolean;
  processing: boolean;
  loanConditions: ConditionWithRelations[];
  onAddSplit: () => void;
  onRemoveSplit: (id: string) => void;
  onUpdateSplit: (id: string, updates: { documentName?: string; documentType?: string | null }) => void;
  onAssignPageToSplit: (pageNum: number, splitId: string) => void;
  onRemovePageFromSplit: (pageNum: number) => void;
  onReorderPagesInSplit: (splitId: string, newPages: number[]) => void;
  onSetKeepOriginalDocument: (keep: boolean) => void;
  onAddConditionToSplit: (splitId: string) => void;
  onUpdateConditionInSplit: (splitId: string, tempId: string, conditionId: string) => void;
  onRemoveConditionFromSplit: (splitId: string, tempId: string) => void;
  getPagesDisplay: (pages: number[]) => string;
  onCancel: () => void;
  onFinish: () => void;
}

export function SplitDocEditor({
  sourceDocument,
  splits,
  assignedPages,
  keepOriginalDocument,
  processing,
  loanConditions,
  onAddSplit,
  onRemoveSplit,
  onUpdateSplit,
  onAssignPageToSplit,
  onRemovePageFromSplit,
  onReorderPagesInSplit,
  onSetKeepOriginalDocument,
  onAddConditionToSplit,
  onUpdateConditionInSplit,
  onRemoveConditionFromSplit,
  getPagesDisplay,
  onCancel,
  onFinish,
}: SplitDocEditorProps) {
  const totalPages = sourceDocument.page_count || 1;
  const pdfUrl = sourceDocument.file_url || '';

  const [previewingSplitId, setPreviewingSplitId] = useState<string | null>(null);
  const [previewCurrentPage, setPreviewCurrentPage] = useState(1);

  const previewingSplit = previewingSplitId
    ? splits.find((s) => s.id === previewingSplitId)
    : null;

  useEffect(() => {
    if (previewingSplit && previewingSplit.pages.length === 0) {
      setPreviewingSplitId(null);
    }
  }, [previewingSplit]);

  const handlePreviewClick = useCallback((splitId: string) => {
    const split = splits.find((s) => s.id === splitId);
    if (split && split.pages.length > 0) {
      setPreviewingSplitId(splitId);
      setPreviewCurrentPage(1);
    }
  }, [splits]);

  const handlePreviewBack = useCallback(() => {
    setPreviewingSplitId(null);
  }, []);

  const handlePreviewPageChange = useCallback((page: number) => {
    setPreviewCurrentPage(page);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="px-4 py-3 bg-white">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">Document Split</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[200px] border-r border-gray-200">
          <SourcePagesPanel
            pdfUrl={pdfUrl}
            totalPages={totalPages}
            assignedPages={assignedPages}
          />
        </div>

        <div className="flex-1">
          {previewingSplit ? (
            <DocumentViewer
              document={sourceDocument}
              currentPage={previewCurrentPage}
              totalPages={previewingSplit.pages.length}
              onPageChange={handlePreviewPageChange}
              isPreviewMode
              onBackClick={handlePreviewBack}
              previewPages={previewingSplit.pages}
            />
          ) : (
            <SplitCardsPanel
              splits={splits}
              pdfUrl={pdfUrl}
              loanConditions={loanConditions}
              onAddSplit={onAddSplit}
              onRemoveSplit={onRemoveSplit}
              onUpdateSplit={onUpdateSplit}
              onDropPage={(splitId, pageNum) => onAssignPageToSplit(pageNum, splitId)}
              onRemovePage={onRemovePageFromSplit}
              onReorderPages={onReorderPagesInSplit}
              onAddCondition={onAddConditionToSplit}
              onUpdateCondition={onUpdateConditionInSplit}
              onRemoveCondition={onRemoveConditionFromSplit}
              getPagesDisplay={getPagesDisplay}
              onPreviewClick={handlePreviewClick}
            />
          )}
        </div>
      </div>

      <div className="px-4 py-5 border-t border-gray-200 bg-white flex items-center justify-between">
        <TextButton
          icon={<Plus className="w-4 h-4" />}
          size="md"
          onClick={onAddSplit}
        >
          Add Document Split
        </TextButton>

        <div className="flex items-center gap-4">
          <Checkbox
            checked={keepOriginalDocument}
            onChange={(e) => onSetKeepOriginalDocument(e.target.checked)}
            label="Keep Original Document"
          />
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel Split
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onFinish}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Finish Split'}
          </Button>
        </div>
      </div>
    </div>
  );
}
