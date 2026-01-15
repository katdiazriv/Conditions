import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { RemovableTag } from './RemovableTag';
import { Checkbox } from '../Checkbox';
import type { LoanParty } from '../../types/conditions';

interface PartyFilterDropdownProps {
  parties: LoanParty[];
  selectedPartyIds: Set<string>;
  onToggle: (partyId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function PartyFilterDropdown({
  parties,
  selectedPartyIds,
  onToggle,
  onSelectAll,
  onClearAll,
}: PartyFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedParties = parties.filter(p => selectedPartyIds.has(p.id));
  const allSelected = selectedParties.length === parties.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-gray-300 rounded-lg min-h-[42px]">
        {selectedParties.map(party => (
          <RemovableTag
            key={party.id}
            label={`${party.party_type}: ${party.party_name}`}
            onRemove={() => onToggle(party.id)}
          />
        ))}
        {selectedParties.length === 0 && (
          <span className="text-xs text-gray-400">No parties selected</span>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2 border-b border-gray-100 flex gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              className="text-xs text-cmg-teal hover:text-cmg-teal-dark font-medium"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-cmg-teal hover:text-cmg-teal-dark font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {parties.map(party => (
              <label
                key={party.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <Checkbox
                  checked={selectedPartyIds.has(party.id)}
                  onChange={() => onToggle(party.id)}
                />
                <span className="text-xs text-gray-700">
                  {party.party_type}: {party.party_name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
