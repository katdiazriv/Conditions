export type NoteType = 'condition' | 'update';

export type NotesFilter = 'all' | 'conditions' | 'updates';

export type NotesModalEntryPoint = 'bell' | 'condition';

export interface Note {
  id: string;
  loan_id: string | null;
  condition_id: string | null;
  author_name: string;
  author_role: string;
  content: string;
  note_type: NoteType;
  is_read: boolean;
  is_pinned: boolean;
  created_at: string;
}

export interface NoteWithCondition extends Note {
  condition?: {
    condition_id: string;
    title: string;
  } | null;
}
