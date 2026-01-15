import { PlusCircle, Info } from 'lucide-react';
import type { CustomList } from '../../types/conditions';
import { CATEGORY_OPTIONS } from '../../types/conditions';
import { TextButton } from '../TextButton';

interface CategorySidebarProps {
  lists: CustomList[];
  selectedCategory: string | null;
  selectedListId: string | null;
  showCustomTemplates: boolean;
  onSelectCategory: (category: string | null) => void;
  onSelectList: (listId: string | null) => void;
  onSelectCustomTemplates: () => void;
}

export function CategorySidebar({
  lists,
  selectedCategory,
  selectedListId,
  showCustomTemplates,
  onSelectCategory,
  onSelectList,
  onSelectCustomTemplates,
}: CategorySidebarProps) {
  const isSelected = (category: string) =>
    !selectedListId && !showCustomTemplates && selectedCategory === category;

  const isListSelected = (listId: string) => selectedListId === listId;

  const selectedStyles = 'bg-[#EAF6F7] text-cmg-teal font-medium';
  const unselectedStyles = 'text-gray-700 hover:bg-gray-100';

  return (
    <div className="w-56 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
      <div className="p-3">
        <h3 className="text-xs font-bold text-gray-900 mb-2">
          My Lists
        </h3>
        <div>
          {lists.map(list => (
            <button
              key={list.id}
              onClick={() => onSelectList(list.id)}
              className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
                isListSelected(list.id) ? selectedStyles : unselectedStyles
              }`}
            >
              {list.name}
            </button>
          ))}
          <div className="px-3 py-1.5">
            <TextButton
              icon={<PlusCircle />}
              size="md"
              onClick={() => {}}
            >
              Add New List
            </TextButton>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-gray-200">
        <h3 className="text-xs font-bold text-gray-900 mb-2">
          Categories
        </h3>
        <div>
          <button
            onClick={() => onSelectCategory('All')}
            className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
              isSelected('All') ? selectedStyles : unselectedStyles
            }`}
          >
            All
          </button>

          <button
            onClick={() => onSelectCategory('Standard')}
            className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
              isSelected('Standard') ? selectedStyles : unselectedStyles
            }`}
          >
            Standard
          </button>

          <div className="border-b border-gray-200 my-2" />

          <button
            onClick={onSelectCustomTemplates}
            className={`w-full text-left px-3 py-1.5 text-xs rounded-md flex items-center justify-between transition-colors ${
              showCustomTemplates ? selectedStyles : unselectedStyles
            }`}
          >
            <span>My Custom Templates</span>
            <Info className="w-4 h-4 text-gray-400" />
          </button>

          {CATEGORY_OPTIONS.map(category => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
                isSelected(category) ? selectedStyles : unselectedStyles
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
