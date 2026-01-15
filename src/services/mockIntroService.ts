export type Tone = 'formal' | 'casual' | 'warm' | 'serious' | 'humorous';
export type Sophistication = 'high' | 'medium' | 'low';

export interface IntroParams {
  tone: Tone;
  sophistication: Sophistication;
  needByDate: string;
  leftVoicemail: boolean;
  phoneCallSummary: boolean;
  reminderEmail: boolean;
}

export interface IntroVersion {
  id: string;
  label: string;
  params: IntroParams;
  introHtml: string;
}

const TONE_LABELS: Record<Tone, string> = {
  formal: 'Formal',
  casual: 'Casual',
  warm: 'Warm',
  serious: 'Serious',
  humorous: 'Humorous',
};

const SOPHISTICATION_LABELS: Record<Sophistication, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const INTRO_TEMPLATES: Record<Tone, Record<Sophistication, string>> = {
  formal: {
    high: `<p>We appreciate your decision to entrust CMG Financial with your home financing needs. Our team is committed to providing you with exceptional service throughout this transaction.</p>`,
    medium: `<p>Thank you for selecting CMG Financial for your home loan. We are dedicated to making this process as efficient as possible for you.</p>`,
    low: `<p>Thank you for choosing CMG Financial. We are here to help with your home loan.</p>`,
  },
  casual: {
    high: `<p>Hey there! Thanks for choosing CMG Financial for your home loan. We're genuinely excited to help you reach your homeownership goals and will be with you every step of the way.</p>`,
    medium: `<p>Hey! Thanks for going with CMG Financial. We're here to make your home loan process as smooth as possible.</p>`,
    low: `<p>Hi! Thanks for choosing us. Let's get your home loan sorted out.</p>`,
  },
  warm: {
    high: `<p>We're truly honored that you've chosen CMG Financial to help with such an important milestone in your life. Our dedicated team is here to support you with care and attention throughout your entire home loan journey.</p>`,
    medium: `<p>It means a lot to us that you've chosen CMG Financial for your home loan. We're here to help make this experience as pleasant as possible for you.</p>`,
    low: `<p>We're so glad you chose CMG Financial. We're here to help you every step of the way.</p>`,
  },
  serious: {
    high: `<p>CMG Financial acknowledges the significance of your home financing decision. Our team is prepared to execute this transaction with the utmost professionalism and attention to detail that such an important matter demands.</p>`,
    medium: `<p>Your home loan is an important matter. CMG Financial is committed to handling it with the attention and care it deserves.</p>`,
    low: `<p>We understand how important your home loan is. CMG Financial is ready to help.</p>`,
  },
  humorous: {
    high: `<p>Congratulations on taking the plunge into homeownership! Don't worry, we promise the paperwork is only slightly less exciting than watching paint dry. But seriously, the CMG Financial team is here to make this journey as painless as possible!</p>`,
    medium: `<p>Welcome aboard! We know mortgage paperwork isn't exactly a beach vacation, but we'll do our best to make it as smooth as possible. CMG Financial has your back!</p>`,
    low: `<p>Ready to tackle some paperwork? Don't worry, we'll make it quick. CMG Financial is here to help!</p>`,
  },
};

const VOICEMAIL_ADDITIONS: Record<Tone, string> = {
  formal: `<p>As referenced in the voicemail message we left for you, we require additional documentation to proceed with your loan application.</p>`,
  casual: `<p>Hey, I gave you a ring earlier and left a message. Just following up on some docs we need!</p>`,
  warm: `<p>I tried reaching you by phone and left a voicemail. I wanted to make sure you received my message about some documents we need.</p>`,
  serious: `<p>This is a follow-up to the voicemail we left regarding required documentation for your loan application.</p>`,
  humorous: `<p>I tried calling earlier but you were probably busy doing something more exciting than talking about mortgages! Left you a voicemail about some documents we need.</p>`,
};

const PHONE_CALL_ADDITIONS: Record<Tone, string> = {
  formal: `<p>As discussed during our telephone conversation, please find below the documentation requirements we reviewed together.</p>`,
  casual: `<p>Good talking to you! Here's what we went over on the call.</p>`,
  warm: `<p>It was lovely speaking with you! As we discussed, here are the documents we talked about.</p>`,
  serious: `<p>Per our phone conversation, the following documentation is required to proceed with your application.</p>`,
  humorous: `<p>Great chat! Now for the thrilling part you've been waiting for - the document list we discussed!</p>`,
};

const REMINDER_ADDITIONS: Record<Tone, string> = {
  formal: `<p>This communication serves as a courteous reminder regarding the outstanding documentation requirements for your loan application.</p>`,
  casual: `<p>Quick reminder about some docs we still need from you!</p>`,
  warm: `<p>Just a gentle reminder about some documents we're still waiting on. We want to keep things moving smoothly for you!</p>`,
  serious: `<p>This is an important reminder regarding pending documentation required to proceed with your loan application.</p>`,
  humorous: `<p>Remember those documents we talked about? They're starting to feel a bit lonely without their friends! Just a friendly nudge to send them our way.</p>`,
};

const URGENCY_TEMPLATES: Record<Sophistication, (date: string) => string> = {
  high: (date) => `<p>To ensure the timely processing of your application and maintain our projected closing schedule, we kindly request that all documentation be submitted by <strong>${date}</strong>.</p>`,
  medium: (date) => `<p>Please submit the requested documents by <strong>${date}</strong> to keep your loan on track.</p>`,
  low: (date) => `<p>We need these by <strong>${date}</strong>.</p>`,
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function generateIntroHtml(params: IntroParams): string {
  const { tone, sophistication, needByDate, leftVoicemail, phoneCallSummary, reminderEmail } = params;

  let html = INTRO_TEMPLATES[tone][sophistication];

  if (reminderEmail) {
    html += REMINDER_ADDITIONS[tone];
  }

  if (leftVoicemail) {
    html += VOICEMAIL_ADDITIONS[tone];
  }

  if (phoneCallSummary) {
    html += PHONE_CALL_ADDITIONS[tone];
  }

  html += URGENCY_TEMPLATES[sophistication](formatDate(needByDate));

  return html;
}

export function createIntroVersion(
  introNumber: number,
  params: IntroParams
): IntroVersion {
  const toneLabel = TONE_LABELS[params.tone];
  const sophLabel = SOPHISTICATION_LABELS[params.sophistication];

  return {
    id: `intro-${introNumber}-${Date.now()}`,
    label: `Intro ${introNumber} - ${toneLabel}/${sophLabel}`,
    params,
    introHtml: generateIntroHtml(params),
  };
}

export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}
