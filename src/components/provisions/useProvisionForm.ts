import { useState, useCallback, useEffect } from "react";
import type { Provision, OldMapping, ComplianceItem } from "@/types/provision";
import { createBlankOldMapping } from "@/lib/utils";

export function useProvisionForm(initialData: Provision | null) {
  const [form, setForm] = useState<Provision | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm(JSON.parse(JSON.stringify(initialData)));
    } else {
      setForm(null);
    }
  }, [initialData]);

  const update = useCallback(<K extends keyof Provision>(key: K, val: Provision[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: val } : null));
  }, []);

  const toggleInArray = useCallback((key: "changeTags" | "workflowTags", val: string) => {
    setForm((prev) => {
      if (!prev) return null;
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      };
    });
  }, []);

  const updateOldMapping = useCallback(<K extends keyof OldMapping>(idx: number, key: K, val: OldMapping[K]) => {
    setForm((prev) => {
      if (!prev) return null;
      const mappings = [...prev.oldMappings];
      mappings[idx] = { ...mappings[idx], [key]: val };
      return { ...prev, oldMappings: mappings };
    });
  }, []);

  const toggleOldMappingTag = useCallback((idx: number, tag: string) => {
    setForm((prev) => {
      if (!prev) return null;
      const mappings = [...prev.oldMappings];
      const tags = mappings[idx].changeTags || [];
      mappings[idx] = {
        ...mappings[idx],
        changeTags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
      };
      return { ...prev, oldMappings: mappings };
    });
  }, []);

  const addOldMapping = useCallback(() => {
    setForm((prev) => {
      if (!prev) return null;
      return { ...prev, oldMappings: [...prev.oldMappings, createBlankOldMapping()] };
    });
  }, []);

  const removeOldMapping = useCallback((idx: number) => {
    setForm((prev) => {
      if (!prev) return null;
      return { ...prev, oldMappings: prev.oldMappings.filter((_, i) => i !== idx) };
    });
  }, []);

  const addArrayItem = useCallback((key: "draftRules" | "repealedRules" | "forms") => {
    setForm((prev) => {
      if (!prev) return null;
      return { ...prev, [key]: [...(prev[key] || []), { ref: "", summary: "" }] };
    });
  }, []);

  const removeArrayItem = useCallback((key: "draftRules" | "repealedRules" | "forms", idx: number) => {
    setForm((prev) => {
      if (!prev) return null;
      return { ...prev, [key]: (prev[key] || []).filter((_, i) => i !== idx) };
    });
  }, []);

  const updateArrayItem = useCallback(
    (key: "draftRules" | "repealedRules" | "forms", idx: number, field: string, val: string) => {
      setForm((prev) => {
        if (!prev) return null;
        const arr = [...(prev[key] || [])];
        arr[idx] = { ...arr[idx], [field]: val };
        return { ...prev, [key]: arr };
      });
    },
    []
  );

  const addCompItem = useCallback(() => {
    setForm((prev) => {
      if (!prev) return null;
      return { ...prev, compItems: [...(prev.compItems || []), { task: "", assignee: "", due: "" }] };
    });
  }, []);

  const removeCompItem = useCallback((idx: number) => {
    setForm((prev) => {
      if (!prev) return null;
      return { ...prev, compItems: (prev.compItems || []).filter((_, i) => i !== idx) };
    });
  }, []);

  const updateCompItem = useCallback((idx: number, field: keyof ComplianceItem, val: string) => {
    setForm((prev) => {
      if (!prev) return null;
      const arr = [...(prev.compItems || [])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, compItems: arr };
    });
  }, []);

  return {
    form,
    setForm,
    update,
    toggleInArray,
    updateOldMapping,
    toggleOldMappingTag,
    addOldMapping,
    removeOldMapping,
    addArrayItem,
    removeArrayItem,
    updateArrayItem,
    addCompItem,
    removeCompItem,
    updateCompItem,
  };
}
