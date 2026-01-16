import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { NoteEditorWithMentions } from './NoteEditorWithMentions';
import { Dropdown } from './Dropdown';
import { useLoanTeamMembers } from '../hooks/useLoanTeamMembers';
import { useLoanContext } from '../contexts/LoanContext';
import { useRoleContext } from '../contexts/RoleContext';
import { getAuthorNameForRole } from '../types/roles';
import { LOAN_STATUS_OPTIONS, type LoanStatus } from '../types/conditions';
import { supabase } from '../lib/supabase';

interface SubmitToUWModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitComplete: () => void;
}

export function SubmitToUWModal({ isOpen, onClose, onSubmitComplete }: SubmitToUWModalProps) {
  const { selectedLoanId, updateLoanStatus } = useLoanContext();
  const { selectedRole } = useRoleContext();
  const { members } = useLoanTeamMembers(selectedLoanId);
  const [noteContent, setNoteContent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LoanStatus>('UW Received');
  const [submitting, setSubmitting] = useState(false);

  const statusOptions = LOAN_STATUS_OPTIONS.map((status) => ({
    value: status,
    label: status,
  }));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, submitting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setNoteContent('');
      setSelectedStatus('UW Received');
    }
  }, [isOpen]);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);

    const statusUpdated = await updateLoanStatus(selectedStatus);
    if (!statusUpdated) {
      setSubmitting(false);
      return;
    }

    const hasContent = noteContent.replace(/<[^>]*>/g, '').trim().length > 0;
    if (hasContent && selectedLoanId) {
      await supabase.from('condition_notes').insert({
        loan_id: selectedLoanId,
        condition_id: null,
        author_name: getAuthorNameForRole(selectedRole),
        author_role: selectedRole,
        content: noteContent,
        note_type: 'update',
        is_pinned: false,
      });
    }

    setSubmitting(false);
    onSubmitComplete();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Submit to UW</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Please select the loan status and add any relevant notes for the underwriter prior to submission.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Loan Status
            </label>
            <Dropdown
              options={statusOptions}
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value as LoanStatus)}
              placeholder="Select status"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Condition Portal Note
            </label>
            <NoteEditorWithMentions
              value={noteContent}
              onChange={setNoteContent}
              placeholder=""
              teamMembers={members}
            />
          </div>

          <p className="text-xs text-gray-500">
            This note will only be visible to members of the loan team.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 p-6 border-t border-gray-200">
          <Button
            variant="secondary"
            size="lg"
            onClick={onClose}
            disabled={submitting}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
            className="min-w-[100px]"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
