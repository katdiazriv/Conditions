import { ExpansionPanel, ExpansionPanelRow } from '../ExpansionPanel';

interface ExceptionRequestSectionProps {
  requestedDate: string | null;
  status: string | null;
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

export function ExceptionRequestSection({
  requestedDate,
  status,
}: ExceptionRequestSectionProps) {
  const hasException = requestedDate || status;

  return (
    <ExpansionPanel title="Exception Request" defaultExpanded={true}>
      {hasException ? (
        <div className="space-y-1">
          <ExpansionPanelRow label="Requested" value={formatDateTime(requestedDate)} />
          <ExpansionPanelRow label="Status" value={status || '\u2014'} />
        </div>
      ) : (
        <div className="text-sm text-gray-400">There currently is not an exception request</div>
      )}
    </ExpansionPanel>
  );
}
