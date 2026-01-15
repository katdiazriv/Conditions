import { ChevronDown, Copy, Sparkles } from 'lucide-react';
import type { Condition, DocRequest, PendingCondition, PendingCustomCondition, LoanParty } from '../../types/conditions';
import { Checkbox } from '../Checkbox';
import { StackedEditField } from '../StackedEditField';
import { Tag } from '../Tag';

interface CommittedCondition extends Condition {
  doc_requests: DocRequest[];
}

interface CurrentConditionsPanelProps {
  committedConditions: CommittedCondition[];
  pendingConditions: PendingCondition[];
  pendingCustomConditions: PendingCustomCondition[];
  parties: LoanParty[];
  selectedPendingIds: Set<string>;
  onToggleSelectPending: (tempId: string) => void;
  onPartyChange: (tempId: string, partyId: string) => void;
  onTitleChange: (tempId: string, title: string) => void;
  onDescriptionChange: (tempId: string, description: string) => void;
  onCopyCondition: (condition: PendingCondition | CommittedCondition, isCommitted: boolean) => void;
  onEditCustomCondition: (condition: PendingCustomCondition) => void;
  onCustomPartyChange: (tempId: string, partyId: string) => void;
  onCustomTitleChange: (tempId: string, title: string) => void;
  onCustomDescriptionChange: (tempId: string, description: string) => void;
  getPartyDisplay: (partyId: string) => string;
}

export function CurrentConditionsPanel({
  committedConditions,
  pendingConditions,
  pendingCustomConditions,
  parties,
  selectedPendingIds,
  onToggleSelectPending,
  onPartyChange,
  onTitleChange,
  onDescriptionChange,
  onCopyCondition,
  onEditCustomCondition,
  onCustomPartyChange,
  onCustomTitleChange,
  onCustomDescriptionChange,
  getPartyDisplay,
}: CurrentConditionsPanelProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">
          Current Conditions
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="w-10 px-3 py-2"></th>
              <th className="w-28 px-3 py-2 text-left text-2xs font-medium text-gray-500 uppercase">
                No.
              </th>
              <th className="px-3 py-2 text-left text-2xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="w-48 px-3 py-2 text-left text-2xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-1">
                  Request for
                  <ChevronDown className="w-3 h-3" />
                </div>
              </th>
              <th className="w-10 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendingConditions.map(pending => {
              const currentTitle = pending.edited_title ?? pending.available_condition.title;
              const currentDescription = pending.edited_description ?? pending.available_condition.description;

              return (
                <tr
                  key={pending.temp_id}
                  className="hover:bg-gray-50 border-l-4 border-cmg-teal"
                >
                  <td className="px-3 py-3">
                    <Checkbox
                      checked={selectedPendingIds.has(pending.temp_id)}
                      onChange={() => onToggleSelectPending(pending.temp_id)}
                    />
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900 align-top">
                    {pending.available_condition.condition_id}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <StackedEditField
                      title={currentTitle}
                      description={currentDescription}
                      onTitleChange={(value) => onTitleChange(pending.temp_id, value)}
                      onDescriptionChange={(value) => onDescriptionChange(pending.temp_id, value)}
                    />
                  </td>
                  <td className="px-3 py-3 align-top">
                    {pending.available_condition.source_type === 'BRW' ? (
                      <select
                        value={pending.selected_party_id || ''}
                        onChange={(e) => onPartyChange(pending.temp_id, e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cmg-teal focus:border-transparent"
                      >
                        <option value="">Select party...</option>
                        {parties.map(party => (
                          <option key={party.id} value={party.id}>
                            {party.party_type}: {party.party_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <button
                      onClick={() => onCopyCondition(pending, false)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Duplicate condition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {pendingCustomConditions.map(customCondition => (
              <tr
                key={customCondition.temp_id}
                className="hover:bg-gray-50 border-l-4 border-amber-500 cursor-pointer"
                onClick={() => onEditCustomCondition(customCondition)}
              >
                <td className="px-3 py-3">
                  <Checkbox
                    checked={selectedPendingIds.has(customCondition.temp_id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleSelectPending(customCondition.temp_id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-3 py-3 text-xs text-gray-900 align-top">
                  <div className="flex items-center gap-2">
                    <span>{customCondition.condition_id}</span>
                    <Tag variant="amber">
                      <Sparkles className="w-3 h-3 mr-0.5" />
                      Custom
                    </Tag>
                  </div>
                </td>
                <td className="px-3 py-3 align-top" onClick={(e) => e.stopPropagation()}>
                  <StackedEditField
                    title={customCondition.title}
                    description={customCondition.description}
                    onTitleChange={(value) => onCustomTitleChange(customCondition.temp_id, value)}
                    onDescriptionChange={(value) => onCustomDescriptionChange(customCondition.temp_id, value)}
                  />
                </td>
                <td className="px-3 py-3 align-top" onClick={(e) => e.stopPropagation()}>
                  {customCondition.source_type === 'BRW' ? (
                    <select
                      value={customCondition.selected_party_id || ''}
                      onChange={(e) => onCustomPartyChange(customCondition.temp_id, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cmg-teal focus:border-transparent"
                    >
                      <option value="">Select party...</option>
                      {parties.map(party => (
                        <option key={party.id} value={party.id}>
                          {party.party_type}: {party.party_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-400 italic">N/A</span>
                  )}
                </td>
                <td className="px-3 py-3 align-top">
                  <span className="text-xs text-cmg-teal font-medium">Edit</span>
                </td>
              </tr>
            ))}

            {committedConditions.map(condition => {
              const docRequest = condition.doc_requests?.[0];
              const partyDisplay = docRequest
                ? getPartyDisplay(docRequest.fulfillment_party)
                : null;

              return (
                <tr key={condition.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <Checkbox checked={false} onChange={() => {}} disabled />
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900 align-top">
                    {condition.condition_id}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600 align-top">
                    <span className="font-medium text-gray-900">
                      {condition.title}
                    </span>
                    <br />
                    <span className="text-gray-600">{condition.description}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600 align-top">
                    {condition.source_type === 'BRW' && partyDisplay ? (
                      <span>{partyDisplay}</span>
                    ) : condition.source_type === 'INT' ? (
                      <span className="text-gray-400 italic">N/A</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <button
                      onClick={() => onCopyCondition(condition, true)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Duplicate condition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {pendingConditions.length === 0 && pendingCustomConditions.length === 0 && committedConditions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                  No conditions added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
