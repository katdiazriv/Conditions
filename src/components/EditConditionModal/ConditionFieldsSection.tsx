import { useState, useRef, useCallback } from 'react';
import { Info, Flag } from 'lucide-react';
import { RadioButton } from '../RadioButton';
import { InputText } from '../InputText';
import { TextArea } from '../TextArea';
import { Dropdown } from '../Dropdown';
import { FlagSelectPopover } from '../FlagSelectPopover';
import type {
  Condition,
  ConditionStatus,
  Stage,
  ConditionClass,
  SourceType,
  FlagColor,
} from '../../types/conditions';
import {
  STATUS_OPTIONS,
  STAGE_ORDER,
  CLASS_OPTIONS,
  STAGE_DISPLAY_MAP,
  FLAG_COLORS,
} from '../../types/conditions';

interface FormState {
  title: string;
  description: string;
  status: ConditionStatus;
  stage: Stage;
  condition_class: ConditionClass;
  source_type: SourceType;
  follow_up_flag: boolean;
  expiration_date: string;
  follow_up_date: string;
}

interface ConditionFieldsSectionProps {
  condition: Condition;
  formState: FormState;
  flagColor: FlagColor | null;
  onFieldChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  onFlagChange: (color: FlagColor | null) => void;
}

export function ConditionFieldsSection({
  condition,
  formState,
  flagColor,
  onFieldChange,
  onFlagChange,
}: ConditionFieldsSectionProps) {
  const [showFlagPopover, setShowFlagPopover] = useState(false);
  const [popoverVerticalAlign, setPopoverVerticalAlign] = useState<'top' | 'bottom'>('bottom');
  const flagButtonRef = useRef<HTMLButtonElement>(null);

  const handleOpenPopover = useCallback(() => {
    if (flagButtonRef.current) {
      const rect = flagButtonRef.current.getBoundingClientRect();
      const popoverHeight = 320;
      const spaceBelow = window.innerHeight - rect.bottom;
      setPopoverVerticalAlign(spaceBelow < popoverHeight ? 'top' : 'bottom');
    }
    setShowFlagPopover(true);
  }, []);

  return (
    <div className="space-y-4">
      <InputText
        label="Condition Name"
        value={formState.title}
        onChange={(e) => onFieldChange('title', e.target.value)}
      />

      <TextArea
        label="Condition Description"
        value={formState.description}
        onChange={(e) => onFieldChange('description', e.target.value)}
        rows={4}
        resize="none"
      />

      <div className="grid grid-cols-2 gap-4">
        <InputText
          label="Condition Category"
          value={condition.category}
          disabled
        />
        <InputText
          label="Condition Number"
          value={condition.condition_id.split('-')[1] || condition.condition_id}
          disabled
        />
      </div>

      <Dropdown
        label="Condition Status"
        icon={<Info className="w-3.5 h-3.5 text-cmg-teal" />}
        value={formState.status}
        onChange={(e) => onFieldChange('status', e.target.value as ConditionStatus)}
        options={STATUS_OPTIONS.map((status) => ({ value: status, label: status }))}
      />

      <div className="border-t border-gray-100 pt-4">
        <Dropdown
          label="Stage"
          value={formState.stage}
          onChange={(e) => onFieldChange('stage', e.target.value as Stage)}
          options={STAGE_ORDER.map((stage) => ({
            value: stage,
            label: STAGE_DISPLAY_MAP[stage] || stage
          }))}
        />
      </div>

      <Dropdown
        label="Class"
        value={formState.condition_class}
        onChange={(e) => onFieldChange('condition_class', e.target.value as ConditionClass)}
        options={CLASS_OPTIONS.map((cls) => ({ value: cls, label: cls }))}
      />

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <RadioButton
            name="source_type"
            checked={formState.source_type === 'INT'}
            onChange={() => onFieldChange('source_type', 'INT')}
            label="INT"
            labelClassName="text-2xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
          />
          <RadioButton
            name="source_type"
            checked={formState.source_type === 'BRW'}
            onChange={() => onFieldChange('source_type', 'BRW')}
            label="BRW"
            labelClassName="text-2xs font-medium text-cmg-teal bg-cmg-teal/10 px-2 py-0.5 rounded"
          />
        </div>

        <div className="relative flex items-center gap-2">
          <button
            ref={flagButtonRef}
            type="button"
            onClick={handleOpenPopover}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            <Flag
              className={`w-4 h-4 ${
                flagColor ? FLAG_COLORS[flagColor].text : 'text-gray-400'
              }`}
              fill={flagColor ? 'currentColor' : 'none'}
            />
            <span className="text-2xs font-medium text-gray-700">
              {flagColor ? `${flagColor.charAt(0).toUpperCase() + flagColor.slice(1)} Flag` : 'Set Flag'}
            </span>
          </button>
          {showFlagPopover && (
            <FlagSelectPopover
              currentColor={flagColor}
              onApply={(color) => {
                onFlagChange(color);
                setShowFlagPopover(false);
              }}
              onClose={() => setShowFlagPopover(false)}
              horizontalAlign="right"
              verticalAlign={popoverVerticalAlign}
            />
          )}
        </div>
      </div>
    </div>
  );
}
