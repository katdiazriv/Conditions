import { useState, useRef, useEffect } from 'react';
import { PlusCircle, Paperclip, Flag, Trash2 } from 'lucide-react';
import type { ConditionWithRelations, ConditionStatus, FlagColor, LoanParty, DocRequest } from '../types/conditions';
import { FLAG_COLORS } from '../types/conditions';
import type { UserRole } from '../types/roles';
import { StatusDropdown } from './StatusDropdown';
import { Button } from './Button';
import { TextButton } from './TextButton';
import { Checkbox } from './Checkbox';
import { Tag } from './Tag';
import { FlagSelectPopover } from './FlagSelectPopover';
import { DocRequestPopover } from './DocRequestPopover';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ActionMenu } from './ActionMenu';
import type { ActionMenuItem } from './ActionMenu';
import { ALLOWED_MIME_TYPES } from '../services/fileUploadService';
import { NoteEditor } from './NoteEditor';
import { StackedEditField } from './StackedEditField';

interface DocRequestFormData {
  document_type: string;
  fulfillment_party: string;
  description_for_borrower: string;
}

interface ConditionRowProps {
  condition: ConditionWithRelations;
  isSelected: boolean;
  flagColor: FlagColor | null;
  loanId: string;
  parties: LoanParty[];
  userRole: UserRole;
  onSelect: () => void;
  onStatusChange: (status: ConditionStatus) => void;
  onAddNote: (content: string) => void;
  onEdit: () => void;
  onFlagChange: (color: FlagColor | null) => void;
  onOpenUploadModal: (conditionId: string, files?: File[]) => void;
  onOpenNotesModal: (conditionId: string) => void;
  onOpenReviewDocs: (conditionId: string) => void;
  onUpdateDetails: (conditionId: string, title: string, description: string) => Promise<{ success: boolean; error?: string }>;
  onAddDocRequest: (data: DocRequestFormData) => Promise<boolean>;
  onUpdateDocRequest: (docRequestId: string, data: Partial<DocRequest>) => Promise<boolean>;
  onDeleteDocRequest: (docRequestId: string) => Promise<boolean>;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

function formatNoteTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `Today, ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;
  }

  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function ConditionRow({
  condition,
  isSelected,
  flagColor,
  loanId,
  parties,
  userRole,
  onSelect,
  onStatusChange,
  onAddNote,
  onEdit,
  onFlagChange,
  onOpenUploadModal,
  onOpenNotesModal,
  onOpenReviewDocs,
  onUpdateDetails,
  onAddDocRequest,
  onUpdateDocRequest,
  onDeleteDocRequest,
}: ConditionRowProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showFlagPopover, setShowFlagPopover] = useState(false);
  const [showDocsMenu, setShowDocsMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAddDocRequestPopover, setShowAddDocRequestPopover] = useState(false);
  const [editingDocRequest, setEditingDocRequest] = useState<DocRequest | null>(null);
  const [hoveredDocRequestId, setHoveredDocRequestId] = useState<string | null>(null);
  const [deleteConfirmDocRequestId, setDeleteConfirmDocRequestId] = useState<string | null>(null);
  const [addDocRequestAnchorRect, setAddDocRequestAnchorRect] = useState<DOMRect | null>(null);
  const [editDocRequestAnchorRect, setEditDocRequestAnchorRect] = useState<DOMRect | null>(null);
  const addDocRequestButtonRef = useRef<HTMLButtonElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  function handleStartEditing() {
    setEditedTitle(condition.title);
    setEditedDescription(condition.description);
    setOriginalTitle(condition.title);
    setOriginalDescription(condition.description);
    setIsEditing(true);
    setSaveStatus('idle');
    setErrorMessage('');
  }

  function handleCancelEditing() {
    setEditedTitle(originalTitle);
    setEditedDescription(originalDescription);
    setIsEditing(false);
    setSaveStatus('idle');
    setErrorMessage('');
  }

  async function handleSave() {
    if (editedTitle === originalTitle && editedDescription === originalDescription) {
      setIsEditing(false);
      return;
    }

    setSaveStatus('saving');
    const result = await onUpdateDetails(condition.id, editedTitle, editedDescription);

    if (result.success) {
      setSaveStatus('saved');
      setIsEditing(false);
    } else {
      setSaveStatus('error');
      setErrorMessage(result.error || 'Failed to save changes');
    }
  }

  function handleEditContainerBlur(e: React.FocusEvent<HTMLDivElement>) {
    const relatedTarget = e.relatedTarget as Node | null;
    if (editContainerRef.current && relatedTarget && editContainerRef.current.contains(relatedTarget)) {
      return;
    }
    if (isEditing && saveStatus !== 'saving') {
      handleSave();
    }
  }

  function handleEditContainerKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && isEditing) {
      e.preventDefault();
      handleCancelEditing();
    }
  }

  function handleUploadClick() {
    setShowDocsMenu(false);
    fileInputRef.current?.click();
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      onOpenUploadModal(condition.id, Array.from(files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const docsMenuItems: ActionMenuItem[] = [
    { id: 'clear-docs', label: 'Browse and add docs from CLEAR Docs', onClick: () => setShowDocsMenu(false) },
    { id: 'upload', label: 'Upload from your computer', onClick: handleUploadClick },
  ];

  const notes = condition.notes ?? [];
  const documents = condition.documents ?? [];
  const docRequests = condition.doc_requests ?? [];

  const latestNote = notes[0];
  const hasUnreadNotes = notes.some((n) => !n.is_read);
  const docsToReviewStatus = userRole === 'Underwriter' ? 'Reviewed' : 'Need to Review';
  const docsNeedingReview = documents.filter((d) => d.status === docsToReviewStatus);
  const totalDocs = documents.length;
  const activeDocRequests = docRequests.filter((dr) => dr.status !== 'Complete');
  const isSuspended = condition.stage === 'Suspend';

  const reviewedApprovedDocs = documents.filter((d) => {
    if (userRole === 'Underwriter') {
      return d.status === 'Approved';
    }
    return d.status === 'Reviewed' || d.status === 'Approved';
  });
  const reviewedApprovedCount = reviewedApprovedDocs.length;

  const earliestExpirationDate = reviewedApprovedDocs
    .filter((d) => d.expiration_date)
    .map((d) => new Date(d.expiration_date!))
    .sort((a, b) => a.getTime() - b.getTime())[0] || null;

  const isExpirationWithin7Days = earliestExpirationDate
    ? (earliestExpirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 7
    : false;

  function handleAddNote() {
    const plainText = noteContent.replace(/<[^>]*>/g, '').trim();
    if (plainText) {
      onAddNote(noteContent);
      setNoteContent('');
      setShowNoteInput(false);
    }
  }

  function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function handleOpenAddDocRequestPopover() {
    if (addDocRequestButtonRef.current) {
      setAddDocRequestAnchorRect(addDocRequestButtonRef.current.getBoundingClientRect());
    }
    setShowAddDocRequestPopover(true);
  }

  function handleOpenEditDocRequestPopover(docRequest: DocRequest, event: React.MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    setEditDocRequestAnchorRect(target.getBoundingClientRect());
    setEditingDocRequest(docRequest);
  }

  async function handleAddDocRequestSave(data: DocRequestFormData) {
    const success = await onAddDocRequest(data);
    if (success) {
      setShowAddDocRequestPopover(false);
    }
    return success;
  }

  async function handleEditDocRequestSave(data: DocRequestFormData) {
    if (!editingDocRequest) return false;
    const success = await onUpdateDocRequest(editingDocRequest.id, {
      document_type: data.document_type,
      fulfillment_party: data.fulfillment_party as DocRequest['fulfillment_party'],
      description_for_borrower: data.description_for_borrower,
    });
    if (success) {
      setEditingDocRequest(null);
    }
    return success;
  }

  async function handleDeleteDocRequestConfirm() {
    if (!deleteConfirmDocRequestId) return;
    await onDeleteDocRequest(deleteConfirmDocRequestId);
    setDeleteConfirmDocRequestId(null);
  }

  const notesCount = notes.length;

  return (
    <div
      className={`border-b border-gray-100 px-4 py-3 transition-colors ${
        isSuspended
          ? 'bg-[#FFF5F5] hover:bg-red-100'
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_MIME_TYPES.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
      <div className="grid grid-cols-[40px_140px_1fr_160px_400px_180px_120px_100px] gap-2 items-start">
        <div className="flex items-center justify-center pt-1">
          <Checkbox
            checked={isSelected}
            onChange={onSelect}
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onEdit}
              className="text-xs font-semibold text-cmg-teal hover:text-cmg-teal-dark hover:underline text-left"
            >
              {condition.condition_id}
            </button>
            <button
              onClick={() => setShowFlagPopover(true)}
              className="p-0.5 rounded hover:bg-gray-100 transition-colors"
            >
              <Flag
                className={`w-3.5 h-3.5 ${
                  flagColor ? FLAG_COLORS[flagColor].text : 'text-gray-300'
                }`}
                fill={flagColor ? 'currentColor' : 'none'}
              />
            </button>
          </div>
          <div className="text-2xs text-gray-500">Added By System</div>
          {showFlagPopover && (
            <div className="absolute top-6 left-0 z-50">
              <FlagSelectPopover
                currentColor={flagColor}
                onApply={(color) => {
                  onFlagChange(color);
                  setShowFlagPopover(false);
                }}
                onClose={() => setShowFlagPopover(false)}
              />
            </div>
          )}
        </div>

        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <div
              ref={editContainerRef}
              onBlur={handleEditContainerBlur}
              onKeyDown={handleEditContainerKeyDown}
            >
              <StackedEditField
                title={editedTitle}
                description={editedDescription}
                onTitleChange={setEditedTitle}
                onDescriptionChange={setEditedDescription}
                disabled={saveStatus === 'saving'}
              />
              {saveStatus === 'error' && (
                <div className="text-xs text-red-600 mt-1">{errorMessage}</div>
              )}
            </div>
          ) : (
            <>
              <div className="text-xs text-gray-900">
                <span className="font-semibold">{condition.title}:</span>{' '}
                {condition.description}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <Tag variant={condition.source_type === 'BRW' ? 'green' : 'grey'} size="sm">
                  {condition.source_type}
                </Tag>
                <span className="text-2xs text-gray-500">
                  Class: {condition.condition_class}
                </span>
                {saveStatus === 'saving' && (
                  <span className="text-xs text-gray-400">Saving...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-xs text-green-600">Saved</span>
                )}
                {isHovered && saveStatus === 'idle' && (
                  <TextButton size="xs" onClick={handleStartEditing}>
                    Edit Description
                  </TextButton>
                )}
              </div>
            </>
          )}
        </div>

        <div>
          <StatusDropdown
            status={condition.status}
            onStatusChange={onStatusChange}
          />
          <div className="text-2xs text-gray-500 mt-1">
            {formatDate(condition.status_date)}
          </div>
          <div className="text-2xs text-gray-400">
            Set by {condition.status_set_by}
          </div>
        </div>

        <div>
          {showNoteInput ? (
            <div className="space-y-2">
              <NoteEditor
                value={noteContent}
                onChange={setNoteContent}
                placeholder={`Add a note for ${condition.condition_id}...`}
                compact
                onSubmit={handleAddNote}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddNote}
                  variant="primary"
                  size="sm"
                >
                  Save
                </Button>
                <button
                  onClick={() => {
                    setShowNoteInput(false);
                    setNoteContent('');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : latestNote ? (
            <div>
              <div className="flex items-center gap-1.5">
                {hasUnreadNotes && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
                <span className="text-xs font-medium text-gray-900">
                  {latestNote.author_name}
                </span>
                <span className="text-2xs text-gray-400">
                  {formatNoteTime(latestNote.created_at)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                {stripHtml(latestNote.content)}
              </p>
              {notesCount >= 2 ? (
                <TextButton
                  size="sm"
                  className="mt-1"
                  onClick={() => onOpenNotesModal(condition.id)}
                >
                  Show all notes
                </TextButton>
              ) : (
                <TextButton
                  size="sm"
                  className="mt-1"
                  onClick={() => setShowNoteInput(true)}
                >
                  Add a note
                </TextButton>
              )}
            </div>
          ) : (
            <TextButton
              onClick={() => setShowNoteInput(true)}
              icon={<PlusCircle className="w-3 h-3" />}
              size="md"
            >
              Add a note
            </TextButton>
          )}
        </div>

        <div className="relative">
          {activeDocRequests.length > 0 ? (
            <div className="space-y-1">
              {activeDocRequests.slice(0, 2).map((dr) => (
                <div
                  key={dr.id}
                  className="text-xs flex items-center group"
                  onMouseEnter={() => setHoveredDocRequestId(dr.id)}
                  onMouseLeave={() => setHoveredDocRequestId(null)}
                >
                  <span className="text-gray-500">{dr.fulfillment_party}:</span>{' '}
                  <button
                    className="font-semibold text-cmg-teal hover:text-cmg-teal-dark hover:underline"
                    onClick={(e) => handleOpenEditDocRequestPopover(dr, e)}
                  >
                    {truncateText(dr.document_type, 18)}
                  </button>
                  {hoveredDocRequestId === dr.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmDocRequestId(dr.id);
                      }}
                      className="ml-1 p-0.5 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {activeDocRequests.length > 2 && (
                <div className="text-xs text-gray-400">
                  +{activeDocRequests.length - 2} more
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">No requests</span>
          )}
          <TextButton
            ref={addDocRequestButtonRef}
            onClick={handleOpenAddDocRequestPopover}
            icon={<PlusCircle className="w-3 h-3" />}
            size="xs"
            className="mt-1.5"
          >
            <span className="sr-only">Add request</span>
          </TextButton>

          {showAddDocRequestPopover && (
            <DocRequestPopover
              mode="add"
              parties={parties}
              anchorRect={addDocRequestAnchorRect}
              onSave={handleAddDocRequestSave}
              onClose={() => setShowAddDocRequestPopover(false)}
            />
          )}

          {editingDocRequest && (
            <DocRequestPopover
              mode="edit"
              parties={parties}
              initialData={editingDocRequest}
              anchorRect={editDocRequestAnchorRect}
              onSave={handleEditDocRequestSave}
              onClose={() => setEditingDocRequest(null)}
            />
          )}
        </div>

        <div className="relative">
          <div className="flex items-start gap-2">
            <div>
              {docsNeedingReview.length > 0 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenReviewDocs(condition.id)}
                >
                  ({docsNeedingReview.length}) Docs to Review
                </Button>
              ) : (
                <TextButton
                  onClick={() => setShowDocsMenu(!showDocsMenu)}
                  icon={<PlusCircle className="w-3 h-3" />}
                  size="md"
                  className="whitespace-nowrap"
                >
                  Add Docs
                </TextButton>
              )}
            </div>
            {reviewedApprovedCount > 0 && (
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onOpenReviewDocs(condition.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{reviewedApprovedCount}</span>
                </button>
                {earliestExpirationDate && (
                  <span className={`text-2xs mt-1 ${isExpirationWithin7Days ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    Exp. {formatDate(earliestExpirationDate.toISOString())}
                  </span>
                )}
              </div>
            )}
          </div>
          {docsNeedingReview.length > 0 && (
            <div className="mt-1.5">
              <TextButton
                onClick={() => setShowDocsMenu(!showDocsMenu)}
                icon={<PlusCircle className="w-3 h-3" />}
                size="xs"
              >
                <span className="sr-only">Add docs</span>
              </TextButton>
            </div>
          )}
          <ActionMenu
            items={docsMenuItems}
            isOpen={showDocsMenu}
            onClose={() => setShowDocsMenu(false)}
          />
        </div>

        <div />
      </div>

      {deleteConfirmDocRequestId && (
        <ConfirmationDialog
          title="Delete Document Request"
          message="Are you sure you want to delete this document request? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          confirmVariant="danger"
          onConfirm={handleDeleteDocRequestConfirm}
          onCancel={() => setDeleteConfirmDocRequestId(null)}
        />
      )}
    </div>
  );
}
