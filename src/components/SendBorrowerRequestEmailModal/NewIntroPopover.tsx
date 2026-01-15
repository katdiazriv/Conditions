import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dropdown } from '../Dropdown';
import { Datepicker } from '../Datepicker';
import { Checkbox } from '../Checkbox';
import { Button } from '../Button';
import type { Tone, Sophistication, IntroParams } from '../../services/mockIntroService';
import { getTomorrowDate } from '../../services/mockIntroService';

interface NewIntroPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVersion: (params: IntroParams) => void;
  anchorRef: React.RefObject<HTMLElement>;
  disabled?: boolean;
}

const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'warm', label: 'Warm' },
  { value: 'serious', label: 'Serious' },
  { value: 'humorous', label: 'Humorous' },
];

const SOPHISTICATION_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function NewIntroPopover({
  isOpen,
  onClose,
  onCreateVersion,
  anchorRef,
  disabled,
}: NewIntroPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [tone, setTone] = useState<Tone>('formal');
  const [sophistication, setSophistication] = useState<Sophistication>('high');
  const [needByDate, setNeedByDate] = useState<Date | null>(() => {
    const tomorrow = getTomorrowDate();
    return new Date(tomorrow + 'T12:00:00');
  });
  const [leftVoicemail, setLeftVoicemail] = useState(false);
  const [phoneCallSummary, setPhoneCallSummary] = useState(false);
  const [reminderEmail, setReminderEmail] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const tomorrow = getTomorrowDate();
      setNeedByDate(new Date(tomorrow + 'T12:00:00'));
      setTone('formal');
      setSophistication('high');
      setLeftVoicemail(false);
      setPhoneCallSummary(false);
      setReminderEmail(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  const handleCreateVersion = () => {
    const params: IntroParams = {
      tone,
      sophistication,
      needByDate: needByDate ? needByDate.toISOString().split('T')[0] : getTomorrowDate(),
      leftVoicemail,
      phoneCallSummary,
      reminderEmail,
    };
    onCreateVersion(params);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-[340px]"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="w-6" />
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <Dropdown
          label="Tone"
          options={TONE_OPTIONS}
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
        />

        <Dropdown
          label="Sophistication"
          options={SOPHISTICATION_OPTIONS}
          value={sophistication}
          onChange={(e) => setSophistication(e.target.value as Sophistication)}
        />

        <Datepicker
          label="Need By"
          value={needByDate}
          onChange={setNeedByDate}
          showClearButton={false}
        />

        <div className="border-t border-gray-200 pt-5 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={leftVoicemail}
              onChange={(e) => setLeftVoicemail(e.target.checked)}
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 block">Left Voicemail</span>
              <span className="text-xs text-gray-500">Email will reference that a voicemail was left for the borrower</span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={phoneCallSummary}
              onChange={(e) => setPhoneCallSummary(e.target.checked)}
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 block">Phone Call Summary</span>
              <span className="text-xs text-gray-500">Email will summarize a phone call</span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={reminderEmail}
              onChange={(e) => setReminderEmail(e.target.checked)}
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 block">Reminder Email</span>
              <span className="text-xs text-gray-500">This email is a reminder</span>
            </div>
          </label>
        </div>
      </div>

      <div className="p-4 pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={handleCreateVersion}
          disabled={disabled}
          className="w-full justify-center"
        >
          Create New Version
        </Button>
      </div>
    </div>
  );
}
