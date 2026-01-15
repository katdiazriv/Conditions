import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dropdown } from './Dropdown';
import { SearchableDropdown } from './SearchableDropdown';
import { Button } from './Button';
import { SimpleRichTextEditor } from './SimpleRichTextEditor';
import { DOCUMENT_TYPE_OPTIONS } from '../types/conditions';
import type { LoanParty, DocRequest } from '../types/conditions';

interface DocRequestFormData {
  document_type: string;
  fulfillment_party: string;
  description_for_borrower: string;
}

interface DocRequestPopoverProps {
  mode: 'add' | 'edit';
  parties: LoanParty[];
  initialData?: Partial<DocRequest>;
  anchorRect: DOMRect | null;
  onSave: (data: DocRequestFormData) => Promise<boolean>;
  onClose: () => void;
}

const POPOVER_HEIGHT = 380;

export function DocRequestPopover({
  mode,
  parties,
  initialData,
  anchorRect,
  onSave,
  onClose,
}: DocRequestPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [verticalAlign, setVerticalAlign] = useState<'top' | 'bottom'>('bottom');

  const [formData, setFormData] = useState<DocRequestFormData>({
    document_type: initialData?.document_type || '',
    fulfillment_party: initialData?.fulfillment_party || parties[0]?.party_type || '',
    description_for_borrower: initialData?.description_for_borrower || '',
  });

  useEffect(() => {
    if (anchorRect) {
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      setVerticalAlign(spaceBelow < POPOVER_HEIGHT && spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
  }, [anchorRect]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const isInsidePopover = popoverRef.current?.contains(target);
      const isInsidePortaledDropdown = target.closest('[data-dropdown-portal]');
      if (!isInsidePopover && !isInsidePortaledDropdown) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  async function handleSubmit() {
    if (!formData.document_type) return;

    setSaving(true);
    const success = await onSave(formData);
    setSaving(false);

    if (success) {
      onClose();
    }
  }

  const isValid = formData.document_type !== '';

  const popoverStyle: React.CSSProperties = {};
  if (anchorRect) {
    popoverStyle.position = 'fixed';
    popoverStyle.left = Math.max(16, anchorRect.left + anchorRect.width / 2 - 200);
    if (verticalAlign === 'top') {
      popoverStyle.bottom = window.innerHeight - anchorRect.top + 8;
    } else {
      popoverStyle.top = anchorRect.bottom + 8;
    }
  }

  const arrowLeft = anchorRect ? Math.min(anchorRect.width / 2 + (anchorRect.left - (popoverStyle.left as number)) - 8, 380) : 20;

  return (
    <div
      ref={popoverRef}
      className="z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-[400px]"
      style={popoverStyle}
    >
      {verticalAlign === 'bottom' ? (
        <div
          className="absolute -top-2 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"
          style={{ left: arrowLeft }}
        />
      ) : (
        <div
          className="absolute -bottom-2 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"
          style={{ left: arrowLeft }}
        />
      )}

      <div className="relative bg-white rounded-lg">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'add' ? 'Add Document Request' : 'Edit Document Request'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-900 mb-2 block">
                Document Type <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                value={formData.document_type}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    document_type: value,
                  }))
                }
                options={DOCUMENT_TYPE_OPTIONS.map((type) => ({ value: type, label: type }))}
                placeholder="Select"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-2 block">
                Request For
              </label>
              <Dropdown
                value={formData.fulfillment_party}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fulfillment_party: e.target.value,
                  }))
                }
                options={parties.map((party) => ({
                  value: party.party_type,
                  label: `${party.party_type}: ${party.party_name}`,
                }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-900 mb-2 block">
              Description for Borrower
            </label>
            <SimpleRichTextEditor
              content={formData.description_for_borrower}
              onChange={(html) =>
                setFormData((prev) => ({
                  ...prev,
                  description_for_borrower: html,
                }))
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-cmg-teal hover:text-cmg-teal-dark transition-colors"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!isValid || saving}
          >
            {saving ? 'Saving...' : mode === 'add' ? 'Add' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
