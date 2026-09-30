import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Collection } from '../types/kural';
import { CollectionStorage } from '../storage/collectionStorage';

interface CollectionContextType {
  collections: Collection[];
  isLoading: boolean;
  createCollection: (name: string, description?: string, icon?: string, color?: string) => Promise<Collection>;
  updateCollection: (id: string, updates: Partial<Pick<Collection, 'name' | 'description' | 'icon' | 'color'>>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addKuralToCollection: (collectionId: string, kuralNumber: number) => Promise<boolean>;
  removeKuralFromCollection: (collectionId: string, kuralNumber: number) => Promise<boolean>;
  reorderKurals: (collectionId: string, newOrder: number[]) => Promise<boolean>;
  moveKural: (collectionId: string, kuralNumber: number, direction: 'up' | 'down') => Promise<boolean>;
  isKuralInCollection: (collectionId: string, kuralNumber: number) => boolean;
  getCollectionsWithKural: (kuralNumber: number) => Collection[];
  refreshCollections: () => Promise<void>;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await CollectionStorage.getAllCollections();
      setCollections(data);
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createCollection = async (name: string, description?: string, icon?: string, color?: string) => {
    const created = await CollectionStorage.createCollection(name, description, icon, color);
    await load();
    return created;
  };

  const updateCollection = async (id: string, updates: Partial<Pick<Collection, 'name' | 'description' | 'icon' | 'color'>>) => {
    await CollectionStorage.updateCollection(id, updates);
    await load();
  };

  const deleteCollection = async (id: string) => {
    await CollectionStorage.deleteCollection(id);
    await load();
  };

  const addKuralToCollection = async (collectionId: string, kuralNumber: number) => {
    const success = await CollectionStorage.addKuralToCollection(collectionId, kuralNumber);
    if (success) {
      await load();
    }
    return success;
  };

  const removeKuralFromCollection = async (collectionId: string, kuralNumber: number) => {
    const success = await CollectionStorage.removeKuralFromCollection(collectionId, kuralNumber);
    if (success) {
      await load();
    }
    return success;
  };

  const reorderKurals = async (collectionId: string, newOrder: number[]) => {
    const success = await CollectionStorage.reorderKurals(collectionId, newOrder);
    if (success) {
      await load();
    }
    return success;
  };

  const moveKural = async (collectionId: string, kuralNumber: number, direction: 'up' | 'down') => {
    const success = await CollectionStorage.moveKural(collectionId, kuralNumber, direction);
    if (success) {
      await load();
    }
    return success;
  };

  const isKuralInCollection = (collectionId: string, kuralNumber: number): boolean => {
    const col = collections.find((c) => c.id === collectionId);
    return col ? col.kuralNumbers.includes(kuralNumber) : false;
  };

  const getCollectionsWithKural = (kuralNumber: number): Collection[] => {
    return collections.filter((c) => c.kuralNumbers.includes(kuralNumber));
  };

  return (
    <CollectionContext.Provider
      value={{
        collections,
        isLoading,
        createCollection,
        updateCollection,
        deleteCollection,
        addKuralToCollection,
        removeKuralFromCollection,
        reorderKurals,
        moveKural,
        isKuralInCollection,
        getCollectionsWithKural,
        refreshCollections: load,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollections must be used within a CollectionProvider');
  }
  return context;
}
