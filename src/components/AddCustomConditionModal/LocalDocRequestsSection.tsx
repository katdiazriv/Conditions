import { useState } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { ExpansionPanel } from '../ExpansionPanel';
import { Dropdown } from '../Dropdown';
import { SearchableDropdown } from '../SearchableDropdown';
import { TextArea } from '../TextArea';
import type { LoanParty } from '../../types/conditions';
import { DOCUMENT_TYPE_OPTIONS } from '../../types/conditions';

export interface LocalDocRequest {
  temp_id: string;
  document_type: string;
  fulfillment_party: string;
  description_for_borrower: string;
}

interface LocalDocRequestsSectionProps {
  docRequests: LocalDocRequest[];
  parties: LoanParty[];
  onAdd: (docRequest: Omit<LocalDocRequest, 'temp_id'>) => void;
  onUpdate: (tempId: string, data: Partial<LocalDocRequest>) => void;
  onDelete: (tempId: string) => void;
}

interface DocRequestFormState {
  document_type: string;
  fulfillment_party: string;
  description_for_borrower: string;
}

export function LocalDocRequestsSection({
  docRequests,
  parties,
  onAdd,
  onUpdate,
  onDelete,
}: LocalDocRequestsSectionProps) {
  const [newRequest, setNewRequest] = useState<DocRequestFormState>({
    document_type: DOCUMENT_TYPE_OPTIONS[0],
    fulfillment_party: parties[0]?.id || '',
    description_for_borrower: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  function handleAddRequest() {
    if (!newRequest.document_type || !newRequest.fulfillment_party) return;

    const party = parties.find((p) => p.id === newRequest.fulfillment_party);
    onAdd({
      document_type: newRequest.document_type,
      fulfillment_party: party?.party_type || 'B1',
      description_for_borrower: newRequest.description_for_borrower,
    });

    setNewRequest({
      document_type: DOCUMENT_TYPE_OPTIONS[0],
      fulfillment_party: parties[0]?.id || '',
      description_for_borrower: '',
    });
    setShowAddForm(false);
  }

  return (
    <ExpansionPanel title="Document Requests">
      <div className="space-y-4">
        {docRequests.map((dr) => (
          <LocalDocRequestItem
            key={dr.temp_id}
            docRequest={dr}
            parties={parties}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}

        {showAddForm && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div>
                  <label className="text-xs font-medium text-gray-900 mb-2 block">
                    Document Type
                  </label>
                  <SearchableDropdown
                    value={newRequest.document_type}
                    onChange={(value) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        document_type: value,
                      }))
                    }
                    options={DOCUMENT_TYPE_OPTIONS.map((type) => ({ value: type, label: type }))}
                    placeholder="Select"
                  />
                </div>
                <Dropdown
                  label="Request for"
                  value={newRequest.fulfillment_party}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      fulfillment_party: e.target.value,
                    }))
                  }
                  options={parties.map((party) => ({
                    value: party.id,
                    label: `${party.party_type}: ${party.party_name}`
                  }))}
                />
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="ml-2 p-1 text-red-500 hover:text-red-600 transition-colors"
              >
                <MinusCircle className="w-5 h-5" />
              </button>
            </div>
            <div>
              <TextArea
                value={newRequest.description_for_borrower}
                onChange={(e) =>
                  setNewRequest((prev) => ({
                    ...prev,
                    description_for_borrower: e.target.value,
                  }))
                }
                placeholder="Enter a description for the borrower related to the Doc Request"
                maxLength={1000}
                rows={2}
                resize="none"
              />
              <div className="flex justify-between mt-1">
                <span className="text-2xs text-gray-500">
                  Description for Borrower
                </span>
                <span className="text-2xs text-gray-400">
                  {newRequest.description_for_borrower.length}/1000
                </span>
              </div>
            </div>
            <button
              onClick={handleAddRequest}
              className="px-4 py-2 text-xs font-medium text-white bg-cmg-teal hover:bg-cmg-teal-dark rounded transition-colors"
            >
              Add Request
            </button>
          </div>
        )}

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-cmg-teal hover:text-cmg-teal-dark transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add a Doc Request
        </button>
      </div>
    </ExpansionPanel>
  );
}

interface LocalDocRequestItemProps {
  docRequest: LocalDocRequest;
  parties: LoanParty[];
  onUpdate: (tempId: string, data: Partial<LocalDocRequest>) => void;
  onDelete: (tempId: string) => void;
}

function LocalDocRequestItem({
  docRequest,
  parties,
  onUpdate,
  onDelete,
}: LocalDocRequestItemProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="grid grid-cols-2 gap-3 flex-1">
          <div>
            <label className="text-xs font-medium text-gray-900 mb-2 block">
              Document Type
            </label>
            <SearchableDropdown
              value={docRequest.document_type}
              onChange={(value) => onUpdate(docRequest.temp_id, { document_type: value })}
              options={DOCUMENT_TYPE_OPTIONS.map((type) => ({ value: type, label: type }))}
              placeholder="Select"
            />
          </div>
          <Dropdown
            label="Request for"
            value={docRequest.fulfillment_party}
            onChange={(e) => onUpdate(docRequest.temp_id, { fulfillment_party: e.target.value })}
            options={parties.map((party) => ({
              value: party.party_type,
              label: `${party.party_type}: ${party.party_name}`
            }))}
          />
        </div>
        <button
          onClick={() => onDelete(docRequest.temp_id)}
          className="ml-2 p-1 text-red-500 hover:text-red-600 transition-colors"
        >
          <MinusCircle className="w-5 h-5" />
        </button>
      </div>
      <div>
        <TextArea
          value={docRequest.description_for_borrower}
          onChange={(e) => onUpdate(docRequest.temp_id, { description_for_borrower: e.target.value })}
          placeholder="Enter a description for the borrower related to the Doc Request"
          maxLength={1000}
          rows={2}
          resize="none"
        />
        <div className="flex justify-between mt-1">
          <span className="text-2xs text-gray-500">Description for Borrower</span>
          <span className="text-2xs text-gray-400">
            {docRequest.description_for_borrower.length}/1000
          </span>
        </div>
      </div>
    </div>
  );
}
