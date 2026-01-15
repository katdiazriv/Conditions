import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronLeft, Paperclip } from 'lucide-react';
import { Button } from '../Button';
import { TextButton } from '../TextButton';
import { Dropdown } from '../Dropdown';
import { InputText } from '../InputText';
import { EmailChipInput } from './EmailChipInput';
import { RichTextEditor } from './RichTextEditor';
import { IntroTabs } from './IntroTabs';
import { supabase } from '../../lib/supabase';
import {
  createIntroVersion,
  getTomorrowDate,
  type IntroVersion,
  type IntroParams,
} from '../../services/mockIntroService';
import type { DocRequestWithParty } from '../../hooks/useDocRequestsByParty';

interface SendBorrowerRequestEmailModalProps {
  loanId: string;
  selectedDocRequests: DocRequestWithParty[];
  descriptions: Map<string, string>;
  propertyAddress?: string;
  onBack: () => void;
  onClose: () => void;
  onSend: () => void;
}

const DUMMY_SENDER = {
  name: 'Patrick Processor',
  email: 'patrick.processor@cmghomeloans.com',
  title: 'Loan Processor',
  phone: '(555) 123-4567',
  address: '123 Main Street, San Francisco, CA 94102',
  nmls: '123456',
  companyNmls: '654321',
};

const DUMMY_CC_EMAILS = [
  'pollyproductionassistant@cmgfi.com',
  'patrick.processor@cmghomeloans.com',
];

const TEMPLATE_OPTIONS = [
  { value: 'cmg-ai-intro', label: 'CMG AI Intro Writer' },
  { value: 'standard', label: 'Standard Template' },
  { value: 'friendly', label: 'Friendly Reminder' },
];

function isApplicationParty(partyName: string): boolean {
  return partyName.toLowerCase().includes('application');
}

function generateGreeting(docRequests: DocRequestWithParty[]): string {
  const uniqueNames = new Set<string>();
  docRequests.forEach(dr => {
    if (dr.party_name && !isApplicationParty(dr.party_name)) {
      uniqueNames.add(dr.party_name);
    }
  });
  const names = Array.from(uniqueNames);
  if (names.length === 0) return 'Hello,';
  if (names.length === 1) return `Hello ${names[0]},`;
  return `Hello ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]},`;
}

function generateDocumentList(
  docRequests: DocRequestWithParty[],
  descriptions: Map<string, string>
): string {
  const items = docRequests.map(dr => {
    const description = descriptions.get(dr.id) || dr.description_for_borrower || '';
    return `<li style="margin-bottom: 8px;"><strong>${dr.document_type}</strong>${description ? `: ${description}` : ''}</li>`;
  });
  return `<ul style="list-style-type: disc; padding-left: 24px; margin: 16px 0;">${items.join('')}</ul>`;
}

interface SenderInfo {
  name: string;
  email: string;
  title: string;
  phone: string;
  address: string;
  nmls: string;
  companyNmls: string;
  photoUrl?: string;
}

function generateSignatureHtml(sender: SenderInfo): string {
  const photoUrl = sender.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face';

  return `
<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
  <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif;">
    <tr>
      <td style="vertical-align: top; padding-right: 16px;">
        <img src="${photoUrl}" alt="${sender.name}" width="80" height="80" style="border-radius: 50%; object-fit: cover;" />
      </td>
      <td style="vertical-align: top;">
        <div style="font-size: 16px; font-weight: bold; color: #0D9488; margin-bottom: 4px;">${sender.name}</div>
        <div style="font-size: 14px; color: #4b5563; margin-bottom: 8px;">${sender.title}</div>
        <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;">
          <span style="color: #0D9488;">&#9993;</span> <a href="mailto:${sender.email}" style="color: #0D9488; text-decoration: none;">${sender.email}</a>
        </div>
        <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;">
          <span style="color: #0D9488;">&#9742;</span> ${sender.phone}
        </div>
        <div style="font-size: 12px; color: #4b5563;">
          <span style="color: #0D9488;">&#9906;</span> ${sender.address}
        </div>
      </td>
    </tr>
  </table>
  <div style="margin-top: 12px; font-size: 12px;">
    <a href="#" style="color: #0D9488; font-weight: 500; text-decoration: none; text-transform: uppercase;">APPLY NOW</a>
    <span style="color: #d1d5db; margin: 0 8px;">|</span>
    <a href="#" style="color: #0D9488; font-weight: 500; text-decoration: none; text-transform: uppercase;">MYSITE</a>
    <span style="color: #d1d5db; margin: 0 8px;">|</span>
    <a href="#" style="color: #0D9488; font-weight: 500; text-decoration: none; text-transform: uppercase;">DOC UPLOAD</a>
  </div>
  <div style="margin-top: 12px;">
    <a href="#" style="color: #9ca3af; text-decoration: none; margin-right: 12px; font-size: 14px;">in</a>
    <a href="#" style="color: #9ca3af; text-decoration: none; margin-right: 12px; font-size: 14px;">f</a>
    <a href="#" style="color: #9ca3af; text-decoration: none; margin-right: 12px; font-size: 14px;">&#9675;</a>
    <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px;">&#120143;</a>
  </div>
  <div style="margin-top: 12px; font-size: 10px; color: #6b7280;">
    NMLS# ${sender.nmls} | CMG Financial NMLS# ${sender.companyNmls}
  </div>
</div>`;
}

function generateEmailContent(
  docRequests: DocRequestWithParty[],
  descriptions: Map<string, string>,
  sender: SenderInfo,
  introHtml?: string
): string {
  const greeting = generateGreeting(docRequests);
  const intro = introHtml || `<p>Thank you for choosing CMG Financial for your home loan needs. We are excited to help you through this process and make it as smooth as possible.</p>`;
  const transition = `<p>Below is a list of documents we need for your loan transaction. Please review each item carefully and provide the requested information at your earliest convenience.</p>`;
  const documentList = generateDocumentList(docRequests, descriptions);
  const security = `<p>Documents uploaded to the portal are secure and encrypted. Please use this URL to upload requested document(s): <a href="#" style="color: #0D9488;">https://portal.cmgfi.com/upload</a></p>`;
  const closing = `<p>Thank you,</p>`;
  const signature = generateSignatureHtml(sender);

  return `${greeting}
${intro}
${transition}
${documentList}
${security}
${closing}
${signature}`;
}

export function SendBorrowerRequestEmailModal({
  loanId,
  selectedDocRequests,
  descriptions,
  propertyAddress = '123 Sample Street, City, ST 12345',
  onBack,
  onClose,
  onSend,
}: SendBorrowerRequestEmailModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState('cmg-ai-intro');
  const [subject, setSubject] = useState(`Documents Requested for Your Loan on ${propertyAddress}`);
  const [isIntroPopoverOpen, setIsIntroPopoverOpen] = useState(false);
  const [activeIntroIndex, setActiveIntroIndex] = useState(0);

  const initialToEmails = useMemo(() => {
    const emails: string[] = [];
    selectedDocRequests.forEach(dr => {
      if (dr.party_name && !isApplicationParty(dr.party_name)) {
        const email = `${dr.party_name.toLowerCase().replace(/\s+/g, '.')}@email.com`;
        if (!emails.includes(email)) {
          emails.push(email);
        }
      }
    });
    return emails.length > 0 ? emails : ['ben.borrower@email.com', 'brianna.borrower@email.com'];
  }, [selectedDocRequests]);

  const [toEmails, setToEmails] = useState<string[]>(initialToEmails);
  const [ccEmails, setCcEmails] = useState<string[]>(DUMMY_CC_EMAILS);

  const defaultIntroVersion = useMemo((): IntroVersion => {
    return createIntroVersion(1, {
      tone: 'formal',
      sophistication: 'high',
      needByDate: getTomorrowDate(),
      leftVoicemail: false,
      phoneCallSummary: false,
      reminderEmail: false,
    });
  }, []);

  const [introVersions, setIntroVersions] = useState<IntroVersion[]>([defaultIntroVersion]);

  const generateContentForVersion = useCallback(
    (version: IntroVersion) => {
      return generateEmailContent(selectedDocRequests, descriptions, DUMMY_SENDER, version.introHtml);
    },
    [selectedDocRequests, descriptions]
  );

  const [bodyHtml, setBodyHtml] = useState(() =>
    generateContentForVersion(defaultIntroVersion)
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleBack = useCallback(() => {
    setIsVisible(false);
    setTimeout(onBack, 300);
  }, [onBack]);

  const handleCreateIntroVersion = useCallback(
    (params: IntroParams) => {
      if (introVersions.length >= 5) return;

      const newVersion = createIntroVersion(introVersions.length + 1, params);
      setIntroVersions((prev) => [...prev, newVersion]);
      setActiveIntroIndex(introVersions.length);
      setBodyHtml(generateEmailContent(selectedDocRequests, descriptions, DUMMY_SENDER, newVersion.introHtml));
      setIsIntroPopoverOpen(false);
    },
    [introVersions.length, selectedDocRequests, descriptions]
  );

  const handleTabSelect = useCallback(
    (index: number) => {
      setActiveIntroIndex(index);
      const version = introVersions[index];
      if (version) {
        setBodyHtml(generateContentForVersion(version));
      }
    },
    [introVersions, generateContentForVersion]
  );

  const handleSendRequest = useCallback(async () => {
    setSaving(true);
    try {
      const docRequestIds = selectedDocRequests.map(dr => dr.id);

      for (const id of docRequestIds) {
        await supabase
          .from('doc_requests')
          .update({
            status: 'Pending',
            requested_date: new Date().toISOString(),
          })
          .eq('id', id);
      }

      await supabase.from('email_history').insert({
        loan_id: loanId,
        email_type: 'doc_request',
        from_email: DUMMY_SENDER.email,
        from_name: DUMMY_SENDER.name,
        to_emails: toEmails,
        cc_emails: ccEmails,
        subject: subject,
        template_name: template,
        intro_content: '',
        body_html: bodyHtml,
        doc_request_ids: docRequestIds,
        sent_at: new Date().toISOString(),
      });

      onSend();
      handleClose();
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setSaving(false);
    }
  }, [
    selectedDocRequests,
    loanId,
    toEmails,
    ccEmails,
    subject,
    template,
    bodyHtml,
    onSend,
    handleClose,
  ]);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      <div
        className={`absolute top-0 right-0 h-full w-full max-w-4xl bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">
            Step 2 of 2: Send Borrower Request Email
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <label className="text-xs font-medium text-gray-700 w-20 pt-2.5 flex-shrink-0">
                From
              </label>
              <div className="flex-1 h-9 px-4 flex items-center bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                {DUMMY_SENDER.name} ({DUMMY_SENDER.email})
              </div>
            </div>

            <EmailChipInput
              label="To"
              emails={toEmails}
              onChange={setToEmails}
              placeholder="Add recipient email"
            />

            <EmailChipInput
              label="CC"
              emails={ccEmails}
              onChange={setCcEmails}
              placeholder="Add CC email"
            />

            <div className="flex items-start gap-3">
              <label className="text-xs font-medium text-gray-700 w-20 pt-2.5 flex-shrink-0">
                Template
              </label>
              <div className="flex-1 flex items-center gap-4">
                <div className="w-64">
                  <Dropdown
                    options={TEMPLATE_OPTIONS}
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                  />
                </div>
                <TextButton size="sm" onClick={() => {}}>
                  Manage Templates
                </TextButton>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <label className="text-xs font-medium text-gray-700 w-20 pt-2.5 flex-shrink-0">
                Subject
              </label>
              <div className="flex-1 flex items-center gap-2">
                <InputText
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  wrapperClassName="flex-1"
                />
                <button
                  type="button"
                  onClick={() => {}}
                  className="h-9 px-3 flex items-center gap-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach
                </button>
              </div>
            </div>

            <div className="pt-2">
              <IntroTabs
                versions={introVersions}
                activeIndex={activeIntroIndex}
                onTabSelect={handleTabSelect}
                onCreateVersion={handleCreateIntroVersion}
                isPopoverOpen={isIntroPopoverOpen}
                onPopoverOpen={() => setIsIntroPopoverOpen(true)}
                onPopoverClose={() => setIsIntroPopoverOpen(false)}
                maxVersions={5}
              />

              <RichTextEditor content={bodyHtml} onChange={setBodyHtml} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <TextButton icon={<ChevronLeft className="w-4 h-4" />} onClick={handleBack}>
            Back
          </TextButton>
          <div className="flex items-center gap-3">
            <TextButton onClick={() => {}}>Set Email Signature</TextButton>
            <Button variant="secondary" size="md" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSendRequest}
              disabled={saving || toEmails.length === 0}
            >
              {saving ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
