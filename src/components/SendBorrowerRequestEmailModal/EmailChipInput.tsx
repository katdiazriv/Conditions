import { useState, useRef, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { EmailChip } from './EmailChip';

interface EmailChipInputProps {
  label: string;
  emails: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
}

export function EmailChipInput({ label, emails, onChange, placeholder = 'Add email' }: EmailChipInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRemove = (index: number) => {
    const updated = emails.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !emails.includes(trimmed)) {
      onChange([...emails, trimmed]);
    }
    setInputValue('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setInputValue('');
      setIsAdding(false);
    }
  };

  const handlePlusClick = () => {
    setIsAdding(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="flex items-start gap-3">
      <label className="text-xs font-medium text-gray-700 w-20 pt-1.5 flex-shrink-0">{label}</label>
      <div className="flex-1 flex flex-wrap items-center gap-2 min-h-[36px] px-3 py-1.5 bg-white border border-gray-300 rounded-lg">
        {emails.map((email, index) => (
          <EmailChip key={email} email={email} onRemove={() => handleRemove(index)} />
        ))}
        {isAdding ? (
          <input
            ref={inputRef}
            type="email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleAdd}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 min-w-[150px] text-xs outline-none bg-transparent"
          />
        ) : (
          <button
            type="button"
            onClick={handlePlusClick}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Plus className="w-4 h-4 text-cmg-teal" />
          </button>
        )}
      </div>
    </div>
  );
}
