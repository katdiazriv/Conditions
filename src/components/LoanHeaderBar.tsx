import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { useLoanContext } from '../contexts/LoanContext';
import { useRoleContext } from '../contexts/RoleContext';
import { LOAN_STATUS_COLORS, type LoanStatus } from '../types/conditions';
import { ROLE_OPTIONS, type UserRole } from '../types/roles';

interface LoanHeaderBarProps {
  onOpenSelector: () => void;
}

export function LoanHeaderBar({ onOpenSelector }: LoanHeaderBarProps) {
  const { selectedLoan, loading } = useLoanContext();
  const { selectedRole, setSelectedRole } = useRoleContext();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleRoleSelect(role: UserRole) {
    setSelectedRole(role);
    setRoleDropdownOpen(false);
  }

  if (loading) {
    return (
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="h-5 w-48 bg-gray-600 rounded animate-pulse" />
        <div className="h-5 w-32 bg-gray-600 rounded animate-pulse" />
      </div>
    );
  }

  if (!selectedLoan) {
    return (
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <span className="text-gray-400">No loan selected</span>
        <RoleSelector
          selectedRole={selectedRole}
          isOpen={roleDropdownOpen}
          onToggle={() => setRoleDropdownOpen(!roleDropdownOpen)}
          onSelect={handleRoleSelect}
          dropdownRef={roleDropdownRef}
        />
      </div>
    );
  }

  const statusColors = LOAN_STATUS_COLORS[selectedLoan.status as LoanStatus];

  return (
    <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
      <button
        onClick={onOpenSelector}
        className="flex items-center gap-2 hover:bg-gray-700 rounded px-2 py-1 transition-colors"
      >
        <span className="font-medium">
          {selectedLoan.loan_number}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
        >
          {selectedLoan.status}
        </span>
        <span className="font-medium">
          - {selectedLoan.description}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      <RoleSelector
        selectedRole={selectedRole}
        isOpen={roleDropdownOpen}
        onToggle={() => setRoleDropdownOpen(!roleDropdownOpen)}
        onSelect={handleRoleSelect}
        dropdownRef={roleDropdownRef}
      />
    </div>
  );
}

interface RoleSelectorProps {
  selectedRole: UserRole;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (role: UserRole) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

function RoleSelector({ selectedRole, isOpen, onToggle, onSelect, dropdownRef }: RoleSelectorProps) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 hover:bg-gray-700 rounded px-2 py-1 transition-colors"
      >
        <User className="w-4 h-4 text-gray-400" />
        <span className="font-medium text-sm">{selectedRole}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              onClick={() => onSelect(role)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                selectedRole === role
                  ? 'bg-gray-50 text-cmg-teal font-medium'
                  : 'text-gray-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
