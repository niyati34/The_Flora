import { useState, useEffect } from "react";

export function useAutoSave(key, initialValue = "", delay = 1000) {
  const [value, setValue] = useState(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem(`autosave_${key}`);
    return saved || initialValue;
  });

  const [isSaving, setIsSaving] = useState(false);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    if (value === initialValue) return; // Don't save initial/empty values

    setIsSaving(true);
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`autosave_${key}`, value);
      setIsSaving(false);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [key, value, delay, initialValue]);

  const clearSaved = () => {
    localStorage.removeItem(`autosave_${key}`);
    setValue(initialValue);
  };

  const hasSavedData = () => {
    const saved = localStorage.getItem(`autosave_${key}`);
    return saved && saved !== initialValue;
  };

  return {
    value,
    setValue,
    isSaving,
    clearSaved,
    hasSavedData: hasSavedData(),
  };
}
