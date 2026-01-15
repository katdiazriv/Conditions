import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { DocRequest, LoanParty, PartyParent } from '../types/conditions';

export interface DocRequestWithParty extends DocRequest {
  party_name: string;
  party_type_display: string;
  parent: PartyParent;
  condition_code: string;
  condition_name: string;
  condition_description: string;
}

export interface PartyGroup {
  partyId: string;
  partyType: string;
  partyName: string;
  partyDisplay: string;
  parent: PartyParent;
  docRequests: DocRequestWithParty[];
}

export interface ParentGroup {
  parent: PartyParent;
  parentLabel: string;
  partyGroups: PartyGroup[];
}

type ModalMode = 'request' | 'reminder';

export function useDocRequestsByParty(loanId: string, mode: ModalMode) {
  const [docRequests, setDocRequests] = useState<DocRequestWithParty[]>([]);
  const [parties, setParties] = useState<LoanParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartyIds, setSelectedPartyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (loanId) {
      fetchData();
    }
  }, [loanId]);

  async function fetchData() {
    setLoading(true);

    const { data: partiesData } = await supabase
      .from('loan_parties')
      .select('*')
      .eq('loan_id', loanId)
      .order('party_type', { ascending: true });

    const { data: conditionsData } = await supabase
      .from('conditions')
      .select('id, condition_id, title, description')
      .eq('loan_id', loanId);

    if (!conditionsData || conditionsData.length === 0) {
      setParties(partiesData || []);
      setDocRequests([]);
      setLoading(false);
      return;
    }

    const conditionIds = conditionsData.map(c => c.id);

    const { data: docRequestsData } = await supabase
      .from('doc_requests')
      .select('*')
      .in('condition_id', conditionIds);

    const partyMap = new Map<string, LoanParty>();
    (partiesData || []).forEach(party => {
      partyMap.set(party.party_type, party);
    });

    const conditionMap = new Map<string, { condition_id: string; title: string; description: string }>();
    conditionsData.forEach(c => {
      conditionMap.set(c.id, {
        condition_id: c.condition_id || '',
        title: c.title || '',
        description: c.description || '',
      });
    });

    const enrichedDocRequests: DocRequestWithParty[] = (docRequestsData || []).map(dr => {
      const party = partyMap.get(dr.fulfillment_party);
      const condition = conditionMap.get(dr.condition_id);
      return {
        ...dr,
        party_name: party?.party_name || dr.fulfillment_party,
        party_type_display: `${dr.fulfillment_party}: ${party?.party_name || dr.fulfillment_party}`,
        parent: party?.parent || 'APP1',
        condition_code: condition?.condition_id || '',
        condition_name: condition?.title || '',
        condition_description: condition?.description || '',
      };
    });

    setParties(partiesData || []);
    setDocRequests(enrichedDocRequests);
    setSelectedPartyIds(new Set((partiesData || []).map(p => p.id)));
    setLoading(false);
  }

  const filteredDocRequests = useMemo(() => {
    let filtered = docRequests.filter(dr => dr.status !== 'Complete');

    const selectedPartyTypes = new Set(
      parties.filter(p => selectedPartyIds.has(p.id)).map(p => p.party_type)
    );
    filtered = filtered.filter(dr => selectedPartyTypes.has(dr.fulfillment_party));

    return filtered;
  }, [docRequests, selectedPartyIds, parties]);

  const groupedByParent = useMemo(() => {
    const parentOrder: PartyParent[] = ['APP1', 'APP2', 'EXT'];
    const parentLabels: Record<PartyParent, string> = {
      'APP1': 'APP 1',
      'APP2': 'APP 2',
      'EXT': 'EXT',
    };

    const groupMap = new Map<PartyParent, Map<string, DocRequestWithParty[]>>();

    filteredDocRequests.forEach(dr => {
      const parent = dr.parent;

      if (!groupMap.has(parent)) {
        groupMap.set(parent, new Map());
      }

      const partyMap = groupMap.get(parent)!;
      const key = `${dr.fulfillment_party}:${dr.party_name}`;

      if (!partyMap.has(key)) {
        partyMap.set(key, []);
      }
      partyMap.get(key)!.push(dr);
    });

    const result: ParentGroup[] = [];

    parentOrder.forEach(parent => {
      const partyMap = groupMap.get(parent);
      if (!partyMap || partyMap.size === 0) return;

      const partyGroups: PartyGroup[] = [];
      partyMap.forEach((requests, key) => {
        const [pType, pName] = key.split(':');
        const party = parties.find(p => p.party_type === pType);
        partyGroups.push({
          partyId: party?.id || pType,
          partyType: pType,
          partyName: pName,
          partyDisplay: pName,
          parent: parent,
          docRequests: requests,
        });
      });

      partyGroups.sort((a, b) => {
        const aIsPrimary = a.partyType === parent;
        const bIsPrimary = b.partyType === parent;
        if (aIsPrimary && !bIsPrimary) return -1;
        if (!aIsPrimary && bIsPrimary) return 1;
        return a.partyName.localeCompare(b.partyName);
      });

      result.push({
        parent,
        parentLabel: parentLabels[parent],
        partyGroups,
      });
    });

    return result;
  }, [filteredDocRequests, parties]);

  const togglePartyFilter = useCallback((partyId: string) => {
    setSelectedPartyIds(prev => {
      const next = new Set(prev);
      if (next.has(partyId)) {
        next.delete(partyId);
      } else {
        next.add(partyId);
      }
      return next;
    });
  }, []);

  const selectAllParties = useCallback(() => {
    setSelectedPartyIds(new Set(parties.map(p => p.id)));
  }, [parties]);

  const clearAllParties = useCallback(() => {
    setSelectedPartyIds(new Set());
  }, []);

  async function updateDocRequestDescriptions(
    updates: Array<{ id: string; description_for_borrower: string }>
  ): Promise<boolean> {
    try {
      for (const update of updates) {
        const { error } = await supabase
          .from('doc_requests')
          .update({ description_for_borrower: update.description_for_borrower })
          .eq('id', update.id);

        if (error) {
          console.error('Error updating doc request:', error);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('Error updating doc requests:', err);
      return false;
    }
  }

  return {
    docRequests: filteredDocRequests,
    allDocRequests: docRequests,
    groupedByParent,
    parties,
    loading,
    selectedPartyIds,
    togglePartyFilter,
    selectAllParties,
    clearAllParties,
    updateDocRequestDescriptions,
    refetch: fetchData,
  };
}
