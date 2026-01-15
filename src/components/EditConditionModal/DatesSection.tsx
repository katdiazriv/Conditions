import { ExpansionPanel } from '../ExpansionPanel';
import { Datepicker } from '../Datepicker';
import type { Condition } from '../../types/conditions';

interface DatesSectionProps {
  expirationDate: string;
  followUpDate: string;
  onExpirationDateChange: (date: string) => void;
  onFollowUpDateChange: (date: string) => void;
  condition: Condition;
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '\u2014';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }) + ' ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

interface StatusDateRow {
  label: string;
  dateKey: keyof Condition;
}

const STATUS_DATE_ROWS: StatusDateRow[] = [
  { label: 'New', dateKey: 'new_date' },
  { label: 'Need Brw Request', dateKey: 'need_brw_request_date' },
  { label: 'Requested', dateKey: 'requested_date' },
  { label: 'Processor to Review', dateKey: 'processor_to_review_date' },
  { label: 'Ready for UW', dateKey: 'ready_for_uw_date' },
  { label: 'Cleared', dateKey: 'cleared_date' },
  { label: 'Not Cleared', dateKey: 'not_cleared_date' },
];

export function DatesSection({
  expirationDate,
  followUpDate,
  onExpirationDateChange,
  onFollowUpDateChange,
  condition,
}: DatesSectionProps) {
  const stringToDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const dateToString = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <ExpansionPanel title="Dates">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Datepicker
          label="Expiration Date"
          value={stringToDate(expirationDate)}
          onChange={(date) => onExpirationDateChange(dateToString(date))}
          placeholder="—"
        />
        <Datepicker
          label="Follow Up Date"
          value={stringToDate(followUpDate)}
          onChange={(date) => onFollowUpDateChange(dateToString(date))}
          placeholder="—"
        />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-900 mb-3">
          Condition Status Dates
        </h3>
        <div className="space-y-2">
          {STATUS_DATE_ROWS.map((row) => (
            <div key={row.dateKey} className="flex items-baseline">
              <span className="text-xs font-medium text-gray-900 w-36">
                {row.label}
              </span>
              <span className="text-xs text-gray-600">
                {formatDateTime(condition[row.dateKey] as string | null)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ExpansionPanel>
  );
}
