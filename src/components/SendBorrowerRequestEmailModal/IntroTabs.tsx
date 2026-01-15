import { useRef } from 'react';
import { Plus } from 'lucide-react';
import { TextButton } from '../TextButton';
import { NewIntroPopover } from './NewIntroPopover';
import type { IntroVersion, IntroParams } from '../../services/mockIntroService';

interface IntroTabsProps {
  versions: IntroVersion[];
  activeIndex: number;
  onTabSelect: (index: number) => void;
  onCreateVersion: (params: IntroParams) => void;
  isPopoverOpen: boolean;
  onPopoverOpen: () => void;
  onPopoverClose: () => void;
  maxVersions?: number;
}

export function IntroTabs({
  versions,
  activeIndex,
  onTabSelect,
  onCreateVersion,
  isPopoverOpen,
  onPopoverOpen,
  onPopoverClose,
  maxVersions = 5,
}: IntroTabsProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canAddMore = versions.length < maxVersions;

  return (
    <div className="relative flex items-center border-b border-gray-200 mb-4">
      <div className="flex items-center overflow-x-auto">
        {versions.map((version, index) => (
          <button
            key={version.id}
            onClick={() => onTabSelect(index)}
            className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              index === activeIndex
                ? 'text-cmg-teal border-b-2 border-cmg-teal'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
            }`}
          >
            {version.label}
          </button>
        ))}
      </div>

      <div className="relative ml-4">
        <TextButton
          ref={buttonRef}
          size="xs"
          icon={<Plus className="w-3 h-3" />}
          onClick={canAddMore ? onPopoverOpen : undefined}
          disabled={!canAddMore}
          className={!canAddMore ? 'opacity-50 cursor-not-allowed' : ''}
        >
          New Intro with AI
        </TextButton>

        <NewIntroPopover
          isOpen={isPopoverOpen}
          onClose={onPopoverClose}
          onCreateVersion={onCreateVersion}
          anchorRef={buttonRef}
          disabled={!canAddMore}
        />
      </div>
    </div>
  );
}
