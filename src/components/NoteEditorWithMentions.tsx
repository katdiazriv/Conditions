import { useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  AtSign,
} from 'lucide-react';
import { MentionList, type MentionListRef } from './MentionList';
import type { LoanTeamMember } from '../types/conditions';

interface NoteEditorWithMentionsProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  teamMembers: LoanTeamMember[];
}

function ToolbarButton({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? 'bg-cmg-teal/20 text-cmg-teal'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}

export function NoteEditorWithMentions({
  value,
  onChange,
  placeholder = 'Add a note...',
  teamMembers,
}: NoteEditorWithMentionsProps) {
  const isExternalUpdate = useRef(false);
  const teamMembersRef = useRef(teamMembers);

  useEffect(() => {
    teamMembersRef.current = teamMembers;
  }, [teamMembers]);

  const getSuggestionItems = useCallback(({ query }: { query: string }) => {
    const members = teamMembersRef.current;
    if (!query) return members.slice(0, 5);
    const lowerQuery = query.toLowerCase();
    return members
      .filter(
        (member) =>
          member.name.toLowerCase().includes(lowerQuery) ||
          member.role.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: getSuggestionItems,
          render: () => {
            let component: ReactRenderer<MentionListRef> | null = null;
            let popup: TippyInstance[] | null = null;

            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) return;

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },

              onUpdate: (props) => {
                component?.updateProps(props);

                if (!props.clientRect) return;

                popup?.[0]?.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              },

              onKeyDown: (props) => {
                if (props.event.key === 'Escape') {
                  popup?.[0]?.hide();
                  return true;
                }

                return component?.ref?.onKeyDown(props) ?? false;
              },

              onExit: () => {
                popup?.[0]?.destroy();
                component?.destroy();
              },
            };
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!isExternalUpdate.current) {
        onChange(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      isExternalUpdate.current = true;
      editor.commands.setContent(value, { emitUpdate: false });
      isExternalUpdate.current = false;
    }
  }, [value, editor]);

  const insertMention = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertContent('@').run();
    }
  }, [editor]);

  const iconSize = 'w-4 h-4';

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-cmg-teal focus-within:border-cmg-teal">
      <div className="flex items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive('bold')}
          title="Bold"
        >
          <Bold className={iconSize} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive('italic')}
          title="Italic"
        >
          <Italic className={iconSize} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          isActive={editor?.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive('bulletList')}
          title="Bullet List"
        >
          <List className={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={insertMention} title="Mention someone">
          <AtSign className={iconSize} />
        </ToolbarButton>
      </div>
      <EditorContent
        editor={editor}
        className="text-sm prose prose-sm max-w-none p-3 min-h-[150px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-full [&_.ProseMirror]:text-sm [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_p]:my-1 [&_.ProseMirror.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror.is-editor-empty:first-child::before]:float-left [&_.ProseMirror.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror.is-editor-empty:first-child::before]:pointer-events-none [&_.mention]:bg-blue-100 [&_.mention]:text-blue-700 [&_.mention]:px-1 [&_.mention]:py-0.5 [&_.mention]:rounded [&_.mention]:font-medium"
      />
    </div>
  );
}
