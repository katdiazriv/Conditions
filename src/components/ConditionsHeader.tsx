import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  Upload,
  Bell,
  PlusCircle,
} from 'lucide-react';
import type { ViewFilter, PageFilter } from '../types/conditions';
import { useRoleContext } from '../contexts/RoleContext';
import { FilterButton } from './FilterButton';
import { IconButton } from './IconButton';
import { Button } from './Button';
import { InputText } from './InputText';
import { ActionMenu, type ActionMenuItem } from './ActionMenu';
import { ALLOWED_MIME_TYPES } from '../services/fileUploadService';

interface ConditionsHeaderProps {
  viewFilter: ViewFilter;
  setViewFilter: (filter: ViewFilter) => void;
  pageFilter: PageFilter;
  setPageFilter: (filter: PageFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  counts: {
    active: number;
    needToRequest: number;
    requested: number;
    newDocRequests: number;
    sendBrwReminder: number;
    reviewDocs: number;
  };
  onAddConditions: () => void;
  onSendBrwRequests: () => void;
  onSendBrwReminder: () => void;
  onReviewDocs: () => void;
  onBulkUpload: (files: File[]) => void;
  onOpenNotesModal: () => void;
  unreadNotesCount: number;
}

const VIEW_OPTIONS: { value: ViewFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Cleared', label: 'Cleared' },
  { value: 'Ready for UW', label: 'Ready for UW' },
];

export function ConditionsHeader({
  viewFilter,
  setViewFilter,
  pageFilter,
  setPageFilter,
  searchQuery,
  setSearchQuery,
  counts,
  onAddConditions,
  onSendBrwRequests,
  onSendBrwReminder,
  onReviewDocs,
  onBulkUpload,
  onOpenNotesModal,
  unreadNotesCount,
}: ConditionsHeaderProps) {
  const { permissions } = useRoleContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleUploadClick() {
    setShowUploadMenu(false);
    fileInputRef.current?.click();
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      onBulkUpload(Array.from(files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const uploadMenuItems: ActionMenuItem[] = [
    { id: 'clear-docs', label: 'Browse and add docs from CLEAR Docs', onClick: () => setShowUploadMenu(false) },
    { id: 'upload', label: 'Upload from your computer', onClick: handleUploadClick },
  ];

  function handleViewSelect(view: ViewFilter) {
    setViewFilter(view);
    setPageFilter('none');
    setDropdownOpen(false);
  }

  function handlePageFilterClick(filter: PageFilter) {
    if (pageFilter === filter) {
      setPageFilter('none');
    } else {
      setPageFilter(filter);
    }
  }

  const isViewSelected = pageFilter === 'none';

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <FilterButton
              onClick={() => setDropdownOpen(!dropdownOpen)}
              isSelected={isViewSelected}
              badge={counts.active}
              showChevron
            >
              {viewFilter}
            </FilterButton>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {VIEW_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleViewSelect(option.value)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                      viewFilter === option.value
                        ? 'bg-gray-50 text-cmg-teal font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {permissions.showNeedToRequestFilter && (
            <FilterButton
              onClick={() => handlePageFilterClick('need_to_request')}
              isSelected={pageFilter === 'need_to_request'}
              badge={counts.needToRequest}
              badgeVariant="danger"
            >
              Need to Request
            </FilterButton>
          )}

          {permissions.showRequestedFilter && (
            <FilterButton
              onClick={() => handlePageFilterClick('requested')}
              isSelected={pageFilter === 'requested'}
              badge={counts.requested}
            >
              Requested
            </FilterButton>
          )}

          {permissions.showSendBrwButton && (
            counts.newDocRequests > 0 ? (
              <Button
                variant="secondary"
                badge={counts.newDocRequests}
                badgeVariant="danger"
                onClick={onSendBrwRequests}
              >
                Send Brw Requests
              </Button>
            ) : counts.sendBrwReminder > 0 ? (
              <Button
                variant="secondary"
                badge={counts.sendBrwReminder}
                badgeVariant="info"
                onClick={onSendBrwReminder}
              >
                Send Brw Reminder
              </Button>
            ) : null
          )}

          <Button
            variant="secondary"
            badge={counts.reviewDocs}
            badgeVariant="danger"
            onClick={onReviewDocs}
          >
            Review Docs
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <InputText
              placeholder="Search Conditions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_MIME_TYPES.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="relative">
            <IconButton
              icon={<Upload className="w-5 h-5" />}
              onClick={() => setShowUploadMenu(!showUploadMenu)}
            />
            <ActionMenu
              items={uploadMenuItems}
              isOpen={showUploadMenu}
              onClose={() => setShowUploadMenu(false)}
              horizontalAlign="right"
            />
          </div>

          <div className="relative">
            <IconButton icon={<Bell className="w-5 h-5" />} onClick={onOpenNotesModal} />
            {unreadNotesCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-semibold bg-red-500 text-white rounded-full">
                {unreadNotesCount > 99 ? '99+' : unreadNotesCount}
              </span>
            )}
          </div>

          <Button variant="secondary" onClick={onAddConditions}>
            <PlusCircle className="w-4 h-4" />
            Add Conditions
          </Button>

          <Button variant="primary">
            <span>Submit to UW</span>
            <ChevronDown className="w-4 h-4 inline-block ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
