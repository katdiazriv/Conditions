import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { NoteEditorWithMentions } from './NoteEditorWithMentions';
import { useLoanTeamMembers } from '../hooks/useLoanTeamMembers';
import { useLoanContext } from '../contexts/LoanContext';
import { useRoleContext } from '../contexts/RoleContext';
import { getAuthorNameForRole } from '../types/roles';
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
  const [submitting, setSubmitting] = useState(false);

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
    }
  }, [isOpen]);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);

    const statusUpdated = await updateLoanStatus('UW Received');
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
          <p className="text-sm text-gray-700">
            An Initial Submission will update the loan status to <span className="font-semibold">'UW Received'</span>.
          </p>

          <p className="text-sm text-gray-600">
            Please add any relevant loan notes for the underwriter prior to submission.
          </p>

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
