// Fix: Import React to use React.Dispatch and React.SetStateAction types.
import React, { useState, useEffect } from 'react';

export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (!item) return initialValue;

            const parsedItem = JSON.parse(item);
            // For objects, merge with initial value to provide defaults for new keys
            if (typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) && typeof parsedItem === 'object' && parsedItem !== null && !Array.isArray(parsedItem)) {
                return { ...initialValue, ...parsedItem };
            }
            
            return parsedItem;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            const valueToStore =
                typeof storedValue === 'function'
                    ? storedValue(storedValue)
                    : storedValue;
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}