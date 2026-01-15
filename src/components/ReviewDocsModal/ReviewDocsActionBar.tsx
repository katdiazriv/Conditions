import { useState } from 'react';
import { Trash2, Save } from 'lucide-react';
import { Button } from '../Button';
import { ActionMenu } from '../ActionMenu';

interface ReviewDocsActionBarProps {
  onDeleteDocument: () => void;
  onSaveChanges: () => void;
  onRejectWithReRequest: () => void;
  onRejectWithoutReRequest: () => void;
  onAcceptDoc: () => void;
  currentIndex: number;
  totalDocs: number;
  saving: boolean;
  currentConditionId: string | null;
  isProcessor: boolean;
}

export function ReviewDocsActionBar({
  onDeleteDocument,
  onSaveChanges,
  onRejectWithReRequest,
  onRejectWithoutReRequest,
  onAcceptDoc,
  currentIndex,
  totalDocs,
  saving,
  currentConditionId,
  isProcessor,
}: ReviewDocsActionBarProps) {
  const [showRejectMenu, setShowRejectMenu] = useState(false);
  const acceptLabel = totalDocs > 1 ? `Accept Doc ${currentIndex} of ${totalDocs}` : 'Accept Doc';

  const hasCondition = currentConditionId !== null && currentConditionId !== 'unassigned';

  const rejectMenuItems = [
    {
      id: 're-request',
      label: 'Re-request Document',
      onClick: () => {
        onRejectWithReRequest();
        setShowRejectMenu(false);
      },
      disabled: !hasCondition,
    },
    {
      id: 'dont-re-request',
      label: "Don't Re-request Document",
      onClick: () => {
        onRejectWithoutReRequest();
        setShowRejectMenu(false);
      },
    },
  ];

  return (
    <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <button
          onClick={onDeleteDocument}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-700" />
          <span className="text-gray-900">Delete Document</span>
        </button>

        <button
          onClick={onSaveChanges}
          disabled={saving}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5 text-cmg-teal" />
          <span className="text-gray-900">{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>

        {isProcessor ? (
          <div className="relative">
            <Button
              variant="danger"
              size="md"
              onClick={() => setShowRejectMenu(!showRejectMenu)}
            >
              Reject...
            </Button>
            <ActionMenu
              items={rejectMenuItems}
              isOpen={showRejectMenu}
              onClose={() => setShowRejectMenu(false)}
              horizontalAlign="right"
              verticalAlign="top"
            />
          </div>
        ) : (
          <Button
            variant="danger"
            size="md"
            onClick={onRejectWithoutReRequest}
          >
            Reject...
          </Button>
        )}

        <Button
          variant="primary"
          size="md"
          onClick={onAcceptDoc}
        >
          {acceptLabel}
        </Button>
      </div>
    </div>
  );
}
