import { useRef, useEffect, useCallback } from 'react';

interface StackedEditFieldProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
}

export function StackedEditField({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  disabled = false,
}: StackedEditFieldProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback((textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight(titleRef.current);
  }, [title, adjustHeight]);

  useEffect(() => {
    adjustHeight(descriptionRef.current);
  }, [description, adjustHeight]);

  return (
    <div
      className={`
        rounded-xl border border-gray-300 bg-white
        focus-within:ring-2 focus-within:ring-cmg-teal focus-within:border-transparent
        transition-all duration-150
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => {
          onTitleChange(e.target.value);
          adjustHeight(e.target);
        }}
        disabled={disabled}
        rows={1}
        className="
          w-full px-4 pt-3 pb-1 text-xs font-semibold text-gray-900
          bg-transparent border-none outline-none resize-none
          placeholder:text-gray-400
          disabled:cursor-not-allowed
        "
        placeholder="Condition Name"
      />
      <textarea
        ref={descriptionRef}
        value={description}
        onChange={(e) => {
          onDescriptionChange(e.target.value);
          adjustHeight(e.target);
        }}
        disabled={disabled}
        rows={1}
        className="
          w-full px-4 pt-0 pb-3 text-xs text-gray-600
          bg-transparent border-none outline-none resize-none
          placeholder:text-gray-400
          disabled:cursor-not-allowed
        "
        placeholder="Description"
      />
    </div>
  );
}
