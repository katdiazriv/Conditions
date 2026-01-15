import type {
  ConditionWithRelations,
  ConditionStatus,
  ViewFilter,
  PageFilter,
} from '../types/conditions';
import {
  PROCESSOR_STATUS_SORT_ORDER,
  UNDERWRITER_STATUS_SORT_ORDER,
} from '../types/conditions';
import type { UserRole } from '../types/roles';

type SortType = 'conditionId' | 'sourceType' | 'processorWorkflow' | 'underwriterWorkflow' | 'none';

interface SortConfig {
  primary: SortType;
  secondary: SortType;
}

function sortByConditionId(a: ConditionWithRelations, b: ConditionWithRelations): number {
  const aId = (a.condition_id || '').toLowerCase();
  const bId = (b.condition_id || '').toLowerCase();
  return aId.localeCompare(bId);
}

function sortBySourceType(a: ConditionWithRelations, b: ConditionWithRelations): number {
  const order: Record<string, number> = { BRW: 1, INT: 2 };
  const aOrder = order[a.source_type] || 99;
  const bOrder = order[b.source_type] || 99;
  return aOrder - bOrder;
}

function sortByProcessorWorkflow(a: ConditionWithRelations, b: ConditionWithRelations): number {
  const aOrder = PROCESSOR_STATUS_SORT_ORDER[a.status as ConditionStatus] || 99;
  const bOrder = PROCESSOR_STATUS_SORT_ORDER[b.status as ConditionStatus] || 99;
  return aOrder - bOrder;
}

function sortByUnderwriterWorkflow(a: ConditionWithRelations, b: ConditionWithRelations): number {
  const aOrder = UNDERWRITER_STATUS_SORT_ORDER[a.status as ConditionStatus] || 99;
  const bOrder = UNDERWRITER_STATUS_SORT_ORDER[b.status as ConditionStatus] || 99;
  return aOrder - bOrder;
}

function getComparator(sortType: SortType): ((a: ConditionWithRelations, b: ConditionWithRelations) => number) | null {
  switch (sortType) {
    case 'conditionId':
      return sortByConditionId;
    case 'sourceType':
      return sortBySourceType;
    case 'processorWorkflow':
      return sortByProcessorWorkflow;
    case 'underwriterWorkflow':
      return sortByUnderwriterWorkflow;
    case 'none':
    default:
      return null;
  }
}

function getSortConfig(
  userRole: UserRole,
  viewFilter: ViewFilter,
  pageFilter: PageFilter
): SortConfig {
  if (viewFilter === 'All') {
    return { primary: 'conditionId', secondary: 'none' };
  }

  if (userRole === 'Processor III') {
    if (viewFilter === 'Active') {
      if (pageFilter === 'requested') {
        return { primary: 'conditionId', secondary: 'sourceType' };
      }
      if (pageFilter === 'need_to_request') {
        return { primary: 'sourceType', secondary: 'processorWorkflow' };
      }
      return { primary: 'sourceType', secondary: 'processorWorkflow' };
    }
    if (viewFilter === 'Cleared') {
      return { primary: 'conditionId', secondary: 'sourceType' };
    }
    if (viewFilter === 'Ready for UW') {
      return { primary: 'conditionId', secondary: 'none' };
    }
  }

  if (userRole === 'Underwriter') {
    if (viewFilter === 'Active') {
      return { primary: 'underwriterWorkflow', secondary: 'conditionId' };
    }
    if (viewFilter === 'Cleared') {
      return { primary: 'conditionId', secondary: 'none' };
    }
  }

  return { primary: 'conditionId', secondary: 'none' };
}

export function sortConditions(
  conditions: ConditionWithRelations[],
  userRole: UserRole,
  viewFilter: ViewFilter,
  pageFilter: PageFilter
): ConditionWithRelations[] {
  const config = getSortConfig(userRole, viewFilter, pageFilter);
  const primaryComparator = getComparator(config.primary);
  const secondaryComparator = getComparator(config.secondary);

  if (!primaryComparator) {
    return conditions;
  }

  return [...conditions].sort((a, b) => {
    const primaryResult = primaryComparator(a, b);
    if (primaryResult !== 0 || !secondaryComparator) {
      return primaryResult;
    }
    return secondaryComparator(a, b);
  });
}
