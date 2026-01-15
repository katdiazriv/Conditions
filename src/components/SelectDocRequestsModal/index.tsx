import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useDocRequestsByParty } from '../../hooks/useDocRequestsByParty';
import { Button } from '../Button';
import { PartyFilterDropdown } from './PartyFilterDropdown';
import { ParentSection } from './ParentSection';
import { SendBorrowerRequestEmailModal } from '../SendBorrowerRequestEmailModal';

type ModalMode = 'request' | 'reminder';
type ModalStep = 1 | 2;

interface SelectDocRequestsModalProps {
  loanId: string;
  mode: ModalMode;
  onClose: () => void;
  onSave: () => void;
}

export function SelectDocRequestsModal({
  loanId,
  mode,
  onClose,
  onSave,
}: SelectDocRequestsModalProps) {
  const {
    docRequests,
    groupedByParent,
    parties,
    loading,
    selectedPartyIds,
    togglePartyFilter,
    selectAllParties,
    clearAllParties,
    updateDocRequestDescriptions,
  } = useDocRequestsByParty(loanId, mode);

  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<ModalStep>(1);
  const [selectedDocRequestIds, setSelectedDocRequestIds] = useState<Set<string>>(new Set());
  const [descriptions, setDescriptions] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  useEffect(() => {
    if (docRequests.length > 0 && selectedDocRequestIds.size === 0) {
      setSelectedDocRequestIds(new Set(docRequests.map(dr => dr.id)));
    }
  }, [docRequests]);

  useEffect(() => {
    const initialDescriptions = new Map<string, string>();
    docRequests.forEach(dr => {
      initialDescriptions.set(dr.id, dr.description_for_borrower || '');
    });
    setDescriptions(initialDescriptions);
  }, [docRequests]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedDocRequestIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedDocRequestIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  }, []);

  const handleDescriptionChange = useCallback((id: string, value: string) => {
    setDescriptions(prev => {
      const next = new Map(prev);
      next.set(id, value);
      return next;
    });
  }, []);

  const dirtyDescriptions = useMemo(() => {
    const updates: Array<{ id: string; description_for_borrower: string }> = [];
    docRequests.forEach(dr => {
      const currentValue = descriptions.get(dr.id);
      const originalValue = dr.description_for_borrower || '';
      if (currentValue !== undefined && currentValue !== originalValue) {
        updates.push({ id: dr.id, description_for_borrower: currentValue });
      }
    });
    return updates;
  }, [docRequests, descriptions]);

  const handleSaveAndClose = useCallback(async () => {
    if (dirtyDescriptions.length > 0) {
      setSaving(true);
      await updateDocRequestDescriptions(dirtyDescriptions);
      setSaving(false);
    }
    onSave();
    handleClose();
  }, [dirtyDescriptions, updateDocRequestDescriptions, onSave, handleClose]);

  const handleSaveAndEditEmail = useCallback(async () => {
    if (dirtyDescriptions.length > 0) {
      setSaving(true);
      await updateDocRequestDescriptions(dirtyDescriptions);
      setSaving(false);
    }
    setCurrentStep(2);
  }, [dirtyDescriptions, updateDocRequestDescriptions]);

  const handleBackToStep1 = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const selectedDocRequestsForEmail = useMemo(() => {
    return docRequests.filter(dr => selectedDocRequestIds.has(dr.id));
  }, [docRequests, selectedDocRequestIds]);

  const totalCount = docRequests.length;
  const selectedCount = Array.from(selectedDocRequestIds).filter(id =>
    docRequests.some(dr => dr.id === id)
  ).length;

  const title = mode === 'request'
    ? 'Step 1 of 2: Select and Edit Document Requests to include in Email'
    : 'Step 1 of 2: Select and Edit Document Requests for Reminder Email';

  if (currentStep === 2) {
    return (
      <SendBorrowerRequestEmailModal
        loanId={loanId}
        selectedDocRequests={selectedDocRequestsForEmail}
        descriptions={descriptions}
        onBack={handleBackToStep1}
        onClose={onClose}
        onSend={onSave}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      <div
        className={`absolute top-0 right-0 h-full w-full max-w-[1408px] bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900 pr-4">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading document requests...</div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <p className="text-xs text-gray-600 mb-3">
                  Please select at least one document request to add to the email.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Filter List</label>
                  <PartyFilterDropdown
                    parties={parties}
                    selectedPartyIds={selectedPartyIds}
                    onToggle={togglePartyFilter}
                    onSelectAll={selectAllParties}
                    onClearAll={clearAllParties}
                  />
                </div>
              </div>

              <div className="p-4 space-y-4">
                {groupedByParent.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 text-sm">
                    No document requests match the current filters.
                  </div>
                ) : (
                  groupedByParent.map(parentGroup => (
                    <ParentSection
                      key={parentGroup.parent}
                      parentGroup={parentGroup}
                      selectedIds={selectedDocRequestIds}
                      onToggleSelect={handleToggleSelect}
                      onSelectAll={handleSelectAll}
                      descriptions={descriptions}
                      onDescriptionChange={handleDescriptionChange}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <span className="text-xs text-gray-600">
            Selected {selectedCount} of {totalCount} Doc Requests
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleSaveAndClose}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save & Close'}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveAndEditEmail}
              disabled={saving || selectedCount === 0}
            >
              Add {selectedCount} to Email
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
