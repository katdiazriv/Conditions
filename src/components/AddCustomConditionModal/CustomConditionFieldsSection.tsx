import { useState, useRef, useCallback } from 'react';
import { Flag } from 'lucide-react';
import { RadioButton } from '../RadioButton';
import { Checkbox } from '../Checkbox';
import { InputText } from '../InputText';
import { TextArea } from '../TextArea';
import { Dropdown } from '../Dropdown';
import { FlagSelectPopover } from '../FlagSelectPopover';
import type {
  Stage,
  ConditionClass,
  SourceType,
  CustomConditionFormState,
  FlagColor,
} from '../../types/conditions';
import {
  STAGE_ORDER,
  CLASS_OPTIONS,
  STAGE_DISPLAY_MAP,
  CATEGORY_OPTIONS,
  FLAG_COLORS,
  FLAG_COLOR_OPTIONS,
} from '../../types/conditions';

interface CustomConditionFieldsSectionProps {
  formState: CustomConditionFormState;
  conditionNumber: number;
  flagColor: FlagColor | null;
  onFieldChange: <K extends keyof CustomConditionFormState>(field: K, value: CustomConditionFormState[K]) => void;
  onFlagChange: (color: FlagColor | null) => void;
}

export function CustomConditionFieldsSection({
  formState,
  conditionNumber,
  flagColor,
  onFieldChange,
  onFlagChange,
}: CustomConditionFieldsSectionProps) {
  const [showFlagPopover, setShowFlagPopover] = useState(false);
  const [popoverVerticalAlign, setPopoverVerticalAlign] = useState<'top' | 'bottom'>('bottom');
  const flagButtonRef = useRef<HTMLButtonElement>(null);

  const handleOpenPopover = useCallback(() => {
    if (flagButtonRef.current) {
      const rect = flagButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setPopoverVerticalAlign(spaceBelow < 300 && spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
    setShowFlagPopover(true);
  }, []);

  const handleFlagApply = useCallback((color: FlagColor | null) => {
    onFlagChange(color);
    setShowFlagPopover(false);
  }, [onFlagChange]);

  const flagLabel = flagColor
    ? FLAG_COLOR_OPTIONS.find(o => o.value === flagColor)?.label || 'Flag'
    : 'Set Flag';
  return (
    <div className="space-y-4">
      <InputText
        label="Condition Name"
        value={formState.title}
        onChange={(e) => onFieldChange('title', e.target.value)}
        placeholder="Enter condition name"
      />

      <TextArea
        label="Condition Description"
        value={formState.description}
        onChange={(e) => onFieldChange('description', e.target.value)}
        placeholder="Enter condition description"
        rows={4}
        resize="none"
      />

      <div className="grid grid-cols-2 gap-4">
        <Dropdown
          label="Condition Category"
          value={formState.category}
          onChange={(e) => onFieldChange('category', e.target.value)}
          options={CATEGORY_OPTIONS.map((cat) => ({ value: cat, label: cat }))}
        />
        <InputText
          label="Condition Number"
          value={conditionNumber.toString()}
          disabled
        />
      </div>

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
            onChange={() => onFieldChange('source_type', 'INT' as SourceType)}
            label="INT"
            labelClassName="text-2xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
          />
          <RadioButton
            name="source_type"
            checked={formState.source_type === 'BRW'}
            onChange={() => onFieldChange('source_type', 'BRW' as SourceType)}
            label="BRW"
            labelClassName="text-2xs font-medium text-cmg-teal bg-cmg-teal/10 px-2 py-0.5 rounded"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-medium text-gray-700">Save as Template</span>
            <Checkbox
              checked={formState.save_as_template}
              onChange={(e) => onFieldChange('save_as_template', e.target.checked)}
            />
          </div>
          <div className="relative">
            <button
              ref={flagButtonRef}
              type="button"
              onClick={handleOpenPopover}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Flag className={`w-4 h-4 ${flagColor ? FLAG_COLORS[flagColor].text : 'text-gray-400'}`} />
              <span className="text-2xs font-medium text-gray-700">{flagLabel}</span>
            </button>
            {showFlagPopover && (
              <FlagSelectPopover
                currentColor={flagColor}
                onApply={handleFlagApply}
                onClose={() => setShowFlagPopover(false)}
                horizontalAlign="right"
                verticalAlign={popoverVerticalAlign}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
