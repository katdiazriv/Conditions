import { useState, useCallback, useMemo } from 'react';
import type { DocumentForReview } from './useReviewDocsWizard';
import { processSplitDocuments, formatPagesDisplay, type SplitDocumentData } from '../services/pdfSplitService';

export interface SplitDocument {
  id: string;
  documentName: string;
  documentType: string | null;
  pages: number[];
  conditionIds: string[];
}

interface ConditionAssociation {
  tempId: string;
  conditionId: string;
}

export interface SplitDocumentState extends SplitDocument {
  conditionAssociations: ConditionAssociation[];
}

interface UseSplitDocumentEditorResult {
  splits: SplitDocumentState[];
  keepOriginalDocument: boolean;
  assignedPages: Set<number>;
  processing: boolean;
  error: string | null;
  addSplit: () => void;
  removeSplit: (id: string) => void;
  updateSplit: (id: string, updates: Partial<Pick<SplitDocument, 'documentName' | 'documentType'>>) => void;
  assignPageToSplit: (pageNum: number, splitId: string) => void;
  removePageFromSplit: (pageNum: number) => void;
  reorderPagesInSplit: (splitId: string, newPages: number[]) => void;
  setKeepOriginalDocument: (keep: boolean) => void;
  addConditionToSplit: (splitId: string) => void;
  updateConditionInSplit: (splitId: string, tempId: string, conditionId: string) => void;
  removeConditionFromSplit: (splitId: string, tempId: string) => void;
  getUnassignedPages: (totalPages: number) => number[];
  getPagesDisplay: (pages: number[]) => string;
  validateSplits: () => { valid: boolean; errors: string[] };
  finishSplit: (sourceDocument: DocumentForReview) => Promise<{ success: boolean; errors: string[] }>;
  reset: () => void;
}

function createEmptySplit(index: number): SplitDocumentState {
  return {
    id: `split-${Date.now()}-${index}`,
    documentName: '',
    documentType: null,
    pages: [],
    conditionIds: [],
    conditionAssociations: [
      {
        tempId: `cond-initial-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conditionId: '',
      },
    ],
  };
}

export function useSplitDocumentEditor(): UseSplitDocumentEditorResult {
  const [splits, setSplits] = useState<SplitDocumentState[]>(() => [createEmptySplit(1)]);
  const [keepOriginalDocument, setKeepOriginalDocument] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignedPages = useMemo(() => {
    const pages = new Set<number>();
    splits.forEach((split) => {
      split.pages.forEach((page) => pages.add(page));
    });
    return pages;
  }, [splits]);

  const addSplit = useCallback(() => {
    setSplits((prev) => [...prev, createEmptySplit(prev.length + 1)]);
  }, []);

  const removeSplit = useCallback((id: string) => {
    setSplits((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSplit = useCallback((id: string, updates: Partial<Pick<SplitDocument, 'documentName' | 'documentType'>>) => {
    setSplits((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const assignPageToSplit = useCallback((pageNum: number, splitId: string) => {
    setSplits((prev) =>
      prev.map((s) => {
        if (s.id === splitId) {
          if (s.pages.includes(pageNum)) return s;
          return { ...s, pages: [...s.pages, pageNum] };
        }
        return { ...s, pages: s.pages.filter((p) => p !== pageNum) };
      })
    );
  }, []);

  const removePageFromSplit = useCallback((pageNum: number) => {
    setSplits((prev) =>
      prev.map((s) => ({
        ...s,
        pages: s.pages.filter((p) => p !== pageNum),
      }))
    );
  }, []);

  const reorderPagesInSplit = useCallback((splitId: string, newPages: number[]) => {
    setSplits((prev) =>
      prev.map((s) => (s.id === splitId ? { ...s, pages: newPages } : s))
    );
  }, []);

  const addConditionToSplit = useCallback((splitId: string) => {
    setSplits((prev) =>
      prev.map((s) => {
        if (s.id !== splitId) return s;
        const newAssoc: ConditionAssociation = {
          tempId: `cond-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          conditionId: '',
        };
        return { ...s, conditionAssociations: [...s.conditionAssociations, newAssoc] };
      })
    );
  }, []);

  const updateConditionInSplit = useCallback((splitId: string, tempId: string, conditionId: string) => {
    setSplits((prev) =>
      prev.map((s) => {
        if (s.id !== splitId) return s;
        const updatedAssociations = s.conditionAssociations.map((a) =>
          a.tempId === tempId ? { ...a, conditionId } : a
        );
        const conditionIds = updatedAssociations
          .map((a) => a.conditionId)
          .filter(Boolean);
        return { ...s, conditionAssociations: updatedAssociations, conditionIds };
      })
    );
  }, []);

  const removeConditionFromSplit = useCallback((splitId: string, tempId: string) => {
    setSplits((prev) =>
      prev.map((s) => {
        if (s.id !== splitId) return s;
        const updatedAssociations = s.conditionAssociations.filter((a) => a.tempId !== tempId);
        const conditionIds = updatedAssociations
          .map((a) => a.conditionId)
          .filter(Boolean);
        return { ...s, conditionAssociations: updatedAssociations, conditionIds };
      })
    );
  }, []);

  const getUnassignedPages = useCallback((totalPages: number): number[] => {
    const unassigned: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (!assignedPages.has(i)) {
        unassigned.push(i);
      }
    }
    return unassigned;
  }, [assignedPages]);

  const getPagesDisplay = useCallback((pages: number[]): string => {
    return formatPagesDisplay(pages);
  }, []);

  const validateSplits = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    const splitsWithPages = splits.filter((s) => s.pages.length > 0);
    if (splitsWithPages.length === 0) {
      errors.push('At least one document split must have pages assigned');
    }

    splits.forEach((split, index) => {
      if (split.pages.length > 0 && !split.documentName.trim()) {
        errors.push(`Document ${index + 1} requires a name`);
      }
    });

    return { valid: errors.length === 0, errors };
  }, [splits]);

  const finishSplit = useCallback(async (sourceDocument: DocumentForReview): Promise<{ success: boolean; errors: string[] }> => {
    const validation = validateSplits();
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    if (!sourceDocument.file_url || !sourceDocument.loan_id) {
      return { success: false, errors: ['Source document is missing required data'] };
    }

    setProcessing(true);
    setError(null);

    try {
      const splitsWithPages = splits.filter((s) => s.pages.length > 0);
      const splitData: SplitDocumentData[] = splitsWithPages.map((s) => ({
        id: s.id,
        documentName: s.documentName,
        documentType: s.documentType,
        pages: s.pages,
        conditionIds: s.conditionIds,
      }));

      const result = await processSplitDocuments(
        {
          id: sourceDocument.id,
          file_url: sourceDocument.file_url,
          loan_id: sourceDocument.loan_id,
          document_name: sourceDocument.document_name,
          document_type: sourceDocument.document_type,
        },
        splitData,
        keepOriginalDocument
      );

      setProcessing(false);

      if (!result.success) {
        setError(result.errors.join(', '));
        return { success: false, errors: result.errors };
      }

      return { success: true, errors: [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during split processing';
      setProcessing(false);
      setError(message);
      return { success: false, errors: [message] };
    }
  }, [splits, keepOriginalDocument, validateSplits]);

  const reset = useCallback(() => {
    setSplits([createEmptySplit(1)]);
    setKeepOriginalDocument(true);
    setProcessing(false);
    setError(null);
  }, []);

  return {
    splits,
    keepOriginalDocument,
    assignedPages,
    processing,
    error,
    addSplit,
    removeSplit,
    updateSplit,
    assignPageToSplit,
    removePageFromSplit,
    reorderPagesInSplit,
    setKeepOriginalDocument,
    addConditionToSplit,
    updateConditionInSplit,
    removeConditionFromSplit,
    getUnassignedPages,
    getPagesDisplay,
    validateSplits,
    finishSplit,
    reset,
  };
}
