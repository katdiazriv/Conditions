import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button';
import { Dropdown } from '../Dropdown';
import { SearchableDropdown } from '../SearchableDropdown';
import { SimpleRichTextEditor } from '../SimpleRichTextEditor';
import { DOCUMENT_TYPE_OPTIONS } from '../../types/conditions';
import type { LoanParty, DocRequest } from '../../types/conditions';

interface ReRequestDocumentModalProps {
  documentType: string | null;
  existingDocRequest: DocRequest | null;
  parties: LoanParty[];
  onSave: (data: {
    isNew: boolean;
    docRequestId?: string;
    document_type: string;
    fulfillment_party: string;
    description_for_borrower: string;
  }) => Promise<boolean>;
  onClose: () => void;
}

export function ReRequestDocumentModal({
  documentType,
  existingDocRequest,
  parties,
  onSave,
  onClose,
}: ReRequestDocumentModalProps) {
  const [saving, setSaving] = useState(false);
  const isUpdateMode = existingDocRequest !== null;

  const [formData, setFormData] = useState({
    document_type: existingDocRequest?.document_type || documentType || '',
    fulfillment_party: existingDocRequest?.fulfillment_party || parties[0]?.party_type || '',
    description_for_borrower: existingDocRequest?.description_for_borrower || '',
  });

  useEffect(() => {
    if (existingDocRequest) {
      setFormData({
        document_type: existingDocRequest.document_type || documentType || '',
        fulfillment_party: existingDocRequest.fulfillment_party || parties[0]?.party_type || '',
        description_for_borrower: existingDocRequest.description_for_borrower || '',
      });
    }
  }, [existingDocRequest, documentType, parties]);

  async function handleSubmit() {
    if (!formData.document_type) return;

    setSaving(true);
    const success = await onSave({
      isNew: !isUpdateMode,
      docRequestId: existingDocRequest?.id,
      document_type: formData.document_type,
      fulfillment_party: formData.fulfillment_party,
      description_for_borrower: formData.description_for_borrower,
    });
    setSaving(false);

    if (success) {
      onClose();
    }
  }

  const isValid = formData.document_type !== '';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Re-request Document</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <p className="text-xs text-gray-600">
            You can update the borrower description which will immediately update in the
            Borrower Home Portal. The borrower will not be informed of this update{' '}
            <span className="font-semibold">until you Send the borrower request</span>.
          </p>

          {isUpdateMode ? (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-2">
                  {formData.document_type || 'Document'}
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!isValid || saving}
          >
            {saving ? 'Saving...' : isUpdateMode ? 'Update Request Description' : 'Add Request'}
          </Button>
        </div>
      </div>
    </div>
  );
}
