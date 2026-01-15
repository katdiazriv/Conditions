import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
} from 'lucide-react';

interface NoteEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  compact?: boolean;
  onSubmit?: () => void;
  autoFocus?: boolean;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
  compact,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${compact ? 'p-1' : 'p-1.5'} rounded transition-colors ${
        isActive
          ? 'bg-cmg-teal/20 text-cmg-teal'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider({ compact }: { compact?: boolean }) {
  return <div className={`w-px ${compact ? 'h-4' : 'h-5'} bg-gray-200 mx-0.5`} />;
}

interface NoteEditorToolbarProps {
  editor: ReturnType<typeof useEditor>;
  compact?: boolean;
}

function NoteEditorToolbar({ editor, compact }: NoteEditorToolbarProps) {
  if (!editor) return null;

  const handleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const iconSize = 'w-3.5 h-3.5';

  return (
    <div className={`flex items-center gap-0.5 ${compact ? 'p-1.5' : 'p-2'} bg-gray-50 border-b border-gray-200`}>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
        compact={compact}
      >
        <Bold className={iconSize} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
        compact={compact}
      >
        <Italic className={iconSize} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
        compact={compact}
      >
        <UnderlineIcon className={iconSize} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
        compact={compact}
      >
        <Strikethrough className={iconSize} />
      </ToolbarButton>

      <ToolbarDivider compact={compact} />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
        compact={compact}
      >
        <List className={iconSize} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
        compact={compact}
      >
        <ListOrdered className={iconSize} />
      </ToolbarButton>

      <ToolbarDivider compact={compact} />

      <ToolbarButton
        onClick={handleLink}
        isActive={editor.isActive('link')}
        title="Link"
        compact={compact}
      >
        <LinkIcon className={iconSize} />
      </ToolbarButton>
    </div>
  );
}

export function NoteEditor({
  value,
  onChange,
  placeholder = 'Add a note...',
  compact = false,
  onSubmit,
  autoFocus = false,
}: NoteEditorProps) {
  const isExternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    autofocus: autoFocus,
    onUpdate: ({ editor }) => {
      if (!isExternalUpdate.current) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && onSubmit) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      isExternalUpdate.current = true;
      editor.commands.setContent(value, false);
      isExternalUpdate.current = false;
    }
  }, [value, editor]);

  const editorHeight = compact ? 'min-h-[80px]' : 'min-h-[120px]';
  const editorPadding = compact ? 'p-2' : 'p-3';

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-cmg-teal focus-within:border-cmg-teal">
      <NoteEditorToolbar editor={editor} compact={compact} />
      <EditorContent
        editor={editor}
        className={`text-xs prose prose-sm max-w-none ${editorPadding} ${editorHeight} focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-full [&_.ProseMirror]:text-xs [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:my-2 [&_.ProseMirror_li]:mb-1 [&_.ProseMirror_p]:my-1 [&_.ProseMirror.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror.is-editor-empty:first-child::before]:float-left [&_.ProseMirror.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror.is-editor-empty:first-child::before]:pointer-events-none`}
      />
    </div>
  );
}
