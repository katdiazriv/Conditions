import { useState } from 'react';
import { X, Check, Pencil, Database, Loader2 } from 'lucide-react';
import { useLoanContext } from '../contexts/LoanContext';
import { useLoans } from '../hooks/useLoans';
import { Button } from './Button';
import { ConfirmationDialog } from './ConfirmationDialog';
import { runSeedWithReset } from '../services/seedDataService';
import { LOAN_STATUS_COLORS } from '../types/conditions';
import type { Loan, LoanStatus } from '../types/conditions';

interface LoanSelectorModalProps {
  onClose: () => void;
}

export function LoanSelectorModal({ onClose }: LoanSelectorModalProps) {
  const { selectedLoanId, setSelectedLoanId } = useLoanContext();
  const { loans, loading, updateLoanDescription, refetch } = useLoans();
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  function handleSelectLoan(loan: Loan) {
    if (editingLoanId) return;
    setSelectedLoanId(loan.id);
    onClose();
  }

  function handleStartEdit(loan: Loan, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingLoanId(loan.id);
    setEditingDescription(loan.description);
  }

  async function handleSaveEdit(e: React.MouseEvent) {
    e.stopPropagation();
    if (!editingLoanId) return;

    setSaving(true);
    await updateLoanDescription(editingLoanId, editingDescription);
    setSaving(false);
    setEditingLoanId(null);
  }

  function handleCancelEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingLoanId(null);
    setEditingDescription('');
  }

  async function handleSeedData() {
    setSeeding(true);
    setSeedError(null);

    const result = await runSeedWithReset();

    if (result.success) {
      setSelectedLoanId(null);
      await refetch();
    } else {
      setSeedError(result.error || 'Failed to seed data');
    }

    setSeeding(false);
    setShowSeedConfirm(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-2xl m-4 bg-white rounded-lg shadow-xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Select Loan</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No loans found
            </div>
          ) : (
            <div className="space-y-2">
              {loans.map(loan => {
                const isSelected = loan.id === selectedLoanId;
                const isEditing = loan.id === editingLoanId;
                const statusColors = LOAN_STATUS_COLORS[loan.status as LoanStatus];

                return (
                  <div
                    key={loan.id}
                    onClick={() => handleSelectLoan(loan)}
                    className={`
                      relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          {loan.loan_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                          {loan.status}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="mt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingDescription}
                            onChange={e => setEditingDescription(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit(e as unknown as React.MouseEvent);
                              if (e.key === 'Escape') handleCancelEdit(e as unknown as React.MouseEvent);
                            }}
                          />
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm text-gray-600 truncate">
                            {loan.description || 'No description'}
                          </span>
                          <button
                            onClick={(e) => handleStartEdit(loan, e)}
                            className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                            title="Edit Description"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isSelected && !isEditing && (
                      <div className="flex-shrink-0">
                        <Check className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {seedError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {seedError}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={() => setShowSeedConfirm(true)}
            disabled={seeding}
            className="flex items-center gap-2"
          >
            {seeding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            {seeding ? 'Seeding...' : 'Seed Demo Data'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {showSeedConfirm && (
        <ConfirmationDialog
          title="Reset & Seed Demo Data"
          message="This will replace all existing data with fresh demo data. This action cannot be undone. Are you sure you want to continue?"
          confirmLabel="Reset & Seed"
          cancelLabel="Cancel"
          onConfirm={handleSeedData}
          onCancel={() => setShowSeedConfirm(false)}
          variant="danger"
        />
      )}
    </div>
  );
}
