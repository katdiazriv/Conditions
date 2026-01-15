import { useState } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { ExpansionPanel } from '../ExpansionPanel';
import { Dropdown } from '../Dropdown';
import { SearchableDropdown } from '../SearchableDropdown';
import { TextArea } from '../TextArea';
import type { DocRequest, LoanParty, FulfillmentParty } from '../../types/conditions';
import { DOCUMENT_TYPE_OPTIONS } from '../../types/conditions';

interface NewDocRequest {
  document_type: string;
  fulfillment_party: string;
  description_for_borrower: string;
}

interface DocRequestsSectionProps {
  docRequests: DocRequest[];
  parties: LoanParty[];
  onAdd: (docRequest: NewDocRequest) => Promise<boolean>;
  onUpdate: (id: string, data: Partial<DocRequest>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

interface DocRequestFormState {
  document_type: string;
  fulfillment_party: string;
  description_for_borrower: string;
}

export function DocRequestsSection({
  docRequests,
  parties,
  onAdd,
  onUpdate,
  onDelete,
}: DocRequestsSectionProps) {
  const [newRequest, setNewRequest] = useState<DocRequestFormState>({
    document_type: DOCUMENT_TYPE_OPTIONS[0],
    fulfillment_party: parties[0]?.id || '',
    description_for_borrower: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  async function handleAddRequest() {
    if (!newRequest.document_type || !newRequest.fulfillment_party) return;

    const party = parties.find((p) => p.id === newRequest.fulfillment_party);
    const success = await onAdd({
      document_type: newRequest.document_type,
      fulfillment_party: party?.party_type || 'B1',
      description_for_borrower: newRequest.description_for_borrower,
    });

    if (success) {
      setNewRequest({
        document_type: DOCUMENT_TYPE_OPTIONS[0],
        fulfillment_party: parties[0]?.id || '',
        description_for_borrower: '',
      });
      setShowAddForm(false);
    }
  }

  return (
    <ExpansionPanel title="Outstanding Document Requests">
      <div className="space-y-4">
        {docRequests.map((dr) => (
          <DocRequestItem
            key={dr.id}
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

interface DocRequestItemProps {
  docRequest: DocRequest;
  parties: LoanParty[];
  onUpdate: (id: string, data: Partial<DocRequest>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

function DocRequestItem({
  docRequest,
  parties,
  onUpdate,
  onDelete,
}: DocRequestItemProps) {
  const [localState, setLocalState] = useState({
    document_type: docRequest.document_type,
    fulfillment_party: docRequest.fulfillment_party,
    description_for_borrower: docRequest.description_for_borrower || '',
  });

  function handleBlur(field: string, value: string) {
    const currentValue =
      field === 'document_type'
        ? docRequest.document_type
        : field === 'description_for_borrower'
        ? docRequest.description_for_borrower || ''
        : docRequest.fulfillment_party;

    if (value !== currentValue) {
      onUpdate(docRequest.id, { [field]: value });
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="grid grid-cols-2 gap-3 flex-1">
          <div>
            <label className="text-xs font-medium text-gray-900 mb-2 block">
              Document Type
            </label>
            <SearchableDropdown
              value={localState.document_type}
              onChange={(value) => {
                setLocalState((prev) => ({
                  ...prev,
                  document_type: value,
                }));
                if (value !== docRequest.document_type) {
                  onUpdate(docRequest.id, { document_type: value });
                }
              }}
              options={DOCUMENT_TYPE_OPTIONS.map((type) => ({ value: type, label: type }))}
              placeholder="Select"
            />
          </div>
          <Dropdown
            label="Request for"
            value={localState.fulfillment_party}
            onChange={(e) => {
              setLocalState((prev) => ({
                ...prev,
                fulfillment_party: e.target.value as FulfillmentParty,
              }));
              onUpdate(docRequest.id, {
                fulfillment_party: e.target.value as DocRequest['fulfillment_party'],
              });
            }}
            options={parties.map((party) => ({
              value: party.party_type,
              label: `${party.party_type}: ${party.party_name}`
            }))}
          />
        </div>
        <button
          onClick={() => onDelete(docRequest.id)}
          className="ml-2 p-1 text-red-500 hover:text-red-600 transition-colors"
        >
          <MinusCircle className="w-5 h-5" />
        </button>
      </div>
      <div>
        <TextArea
          value={localState.description_for_borrower}
          onChange={(e) =>
            setLocalState((prev) => ({
              ...prev,
              description_for_borrower: e.target.value,
            }))
          }
          onBlur={() =>
            handleBlur('description_for_borrower', localState.description_for_borrower)
          }
          placeholder="Enter a description for the borrower related to the Doc Request"
          maxLength={1000}
          rows={2}
          resize="none"
        />
        <div className="flex justify-between mt-1">
          <span className="text-2xs text-gray-500">Description for Borrower</span>
          <span className="text-2xs text-gray-400">
            {localState.description_for_borrower.length}/1000
          </span>
        </div>
      </div>
    </div>
  );
}
