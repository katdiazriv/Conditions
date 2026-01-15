import { useState } from 'react';
import { Info } from 'lucide-react';
import { InputText } from './InputText';
import { TextArea } from './TextArea';
import { Dropdown } from './Dropdown';
import { Datepicker } from './Datepicker';

export function FormComponentsDemo() {
  const [conditionName, setConditionName] = useState('Hazard Insurance');
  const [conditionNumber, setConditionNumber] = useState('601');
  const [conditionDescription, setConditionDescription] = useState(
    'Proof of hazard insurance with coverage equal to 100% of the insurable value required. Coverage equal to the loan amount is acceptable if the loan amount is more than or equal to 80% of the insurable value. Maximum deductible of 5% or more if state required. Premiums renewing within 60 days of funding require proof of premium paid in full or pay through closing. Must state CMG as Mortgagee.'
  );
  const [conditionCategory, setConditionCategory] = useState('PROP');
  const [conditionStatus, setConditionStatus] = useState('New');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const categoryOptions = [
    { value: 'PROP', label: 'PROP' },
    { value: 'APPR', label: 'Appraisal' },
    { value: 'TITLE', label: 'Title' },
    { value: 'CREDIT', label: 'Credit' },
    { value: 'INCOME', label: 'Income' },
    { value: 'ASSETS', label: 'Assets' },
  ];

  const statusOptions = [
    { value: 'New', label: 'New' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Cleared', label: 'Cleared' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-8">Form Components Demo</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-6">Input Components</h2>

            <div className="space-y-6">
              <InputText
                label="Condition Name"
                value={conditionName}
                onChange={(e) => setConditionName(e.target.value)}
                placeholder="Enter condition name"
              />

              <TextArea
                label="Condition Description"
                value={conditionDescription}
                onChange={(e) => setConditionDescription(e.target.value)}
                rows={6}
                placeholder="Enter condition description"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Dropdown
                  label="Condition Category"
                  value={conditionCategory}
                  onChange={(e) => setConditionCategory(e.target.value)}
                  options={categoryOptions}
                />

                <InputText
                  label="Condition Number"
                  value={conditionNumber}
                  onChange={(e) => setConditionNumber(e.target.value)}
                  placeholder="Enter condition number"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Dropdown
                  label="Condition Status"
                  value={conditionStatus}
                  onChange={(e) => setConditionStatus(e.target.value)}
                  options={statusOptions}
                  icon={<Info size={16} className="text-cmg-teal" />}
                />

                <Datepicker
                  label="Due Date"
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="Select due date"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Current Values</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-xs font-mono">
              <div><span className="font-semibold">Condition Name:</span> {conditionName}</div>
              <div><span className="font-semibold">Condition Number:</span> {conditionNumber}</div>
              <div><span className="font-semibold">Category:</span> {conditionCategory}</div>
              <div><span className="font-semibold">Status:</span> {conditionStatus}</div>
              <div><span className="font-semibold">Due Date:</span> {dueDate ? dueDate.toLocaleDateString() : 'Not set'}</div>
              <div className="pt-2">
                <span className="font-semibold">Description:</span>
                <div className="mt-1 text-gray-600">{conditionDescription}</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Error State Examples</h3>
            <div className="space-y-6">
              <InputText
                label="Input with Error"
                value=""
                error={true}
                helperText="This field is required"
                placeholder="Enter value"
              />

              <TextArea
                label="TextArea with Error"
                value=""
                error={true}
                helperText="Description must be at least 10 characters"
                placeholder="Enter description"
              />

              <Dropdown
                label="Dropdown with Error"
                value=""
                options={categoryOptions}
                error={true}
                helperText="Please select a category"
                placeholder="Select category"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Disabled State Examples</h3>
            <div className="space-y-6">
              <InputText
                label="Disabled Input"
                value="Cannot edit this"
                disabled
              />

              <TextArea
                label="Disabled TextArea"
                value="Cannot edit this text area"
                disabled
              />

              <Dropdown
                label="Disabled Dropdown"
                value="PROP"
                options={categoryOptions}
                disabled
              />

              <Datepicker
                label="Disabled Datepicker"
                value={new Date()}
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
