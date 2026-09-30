import AsyncStorage from '@react-native-async-storage/async-storage';
import { Collection } from '../types/kural';

const STORAGE_KEY = '@thirukkural_collections_v1';

// Starter collections if the user has none
const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'favorites',
    name: '❤️ My Favorite Kurals',
    description: 'Personal favorite Thirukkurals',
    kuralNumbers: [1, 2, 3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: '#FF7C0A',
    icon: 'heart',
  },
  {
    id: 'morning-reading',
    name: '🌅 Morning Reading',
    description: 'Kurals for daily morning reflection',
    kuralNumbers: [31, 32, 33],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: '#D97706',
    icon: 'book-open',
  },
];

export const CollectionStorage = {
  /**
   * Retrieves all saved collections from AsyncStorage
   */
  async getAllCollections(): Promise<Collection[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initialize with default collections
        await this.saveAllCollections(INITIAL_COLLECTIONS);
        return INITIAL_COLLECTIONS;
      }
      const parsed: Collection[] = JSON.parse(data);
      return parsed;
    } catch (error) {
      console.error('Failed to load collections from storage:', error);
      return INITIAL_COLLECTIONS;
    }
  },

  /**
   * Saves the entire collections array to AsyncStorage
   */
  async saveAllCollections(collections: Collection[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch (error) {
      console.error('Failed to save collections to storage:', error);
      throw error;
    }
  },

  /**
   * Creates a new custom collection
   */
  async createCollection(name: string, description?: string, icon?: string, color?: string): Promise<Collection> {
    const collections = await this.getAllCollections();
    const newCollection: Collection = {
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      description: description?.trim() || '',
      kuralNumbers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      icon: icon || 'bookmark',
      color: color || '#FF7C0A',
    };

    collections.unshift(newCollection);
    await this.saveAllCollections(collections);
    return newCollection;
  },

  /**
   * Renames/updates metadata of an existing collection
   */
  async updateCollection(id: string, updates: Partial<Pick<Collection, 'name' | 'description' | 'icon' | 'color'>>): Promise<Collection | null> {
    const collections = await this.getAllCollections();
    const index = collections.findIndex((c) => c.id === id);
    if (index === -1) return null;

    collections[index] = {
      ...collections[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveAllCollections(collections);
    return collections[index];
  },

  /**
   * Deletes a collection by ID
   */
  async deleteCollection(id: string): Promise<boolean> {
    const collections = await this.getAllCollections();
    const filtered = collections.filter((c) => c.id !== id);
    if (filtered.length === collections.length) return false;

    await this.saveAllCollections(filtered);
    return true;
  },

  /**
   * Adds a Kural to a collection (preventing duplicates)
   */
  async addKuralToCollection(collectionId: string, kuralNumber: number): Promise<boolean> {
    const collections = await this.getAllCollections();
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return false;

    if (!col.kuralNumbers.includes(kuralNumber)) {
      col.kuralNumbers.push(kuralNumber);
      col.updatedAt = new Date().toISOString();
      await this.saveAllCollections(collections);
      return true;
    }
    return false;
  },

  /**
   * Removes a Kural from a collection
   */
  async removeKuralFromCollection(collectionId: string, kuralNumber: number): Promise<boolean> {
    const collections = await this.getAllCollections();
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return false;

    const initialLen = col.kuralNumbers.length;
    col.kuralNumbers = col.kuralNumbers.filter((n) => n !== kuralNumber);
    if (col.kuralNumbers.length !== initialLen) {
      col.updatedAt = new Date().toISOString();
      await this.saveAllCollections(collections);
      return true;
    }
    return false;
  },

  /**
   * Reorders the kurals in a collection (e.g. move up/down or drag)
   */
  async reorderKurals(collectionId: string, newKuralNumbers: number[]): Promise<boolean> {
    const collections = await this.getAllCollections();
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return false;

    col.kuralNumbers = newKuralNumbers;
    col.updatedAt = new Date().toISOString();
    await this.saveAllCollections(collections);
    return true;
  },

  /**
   * Moves a Kural up or down in the collection order
   */
  async moveKural(collectionId: string, kuralNumber: number, direction: 'up' | 'down'): Promise<boolean> {
    const collections = await this.getAllCollections();
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return false;

    const idx = col.kuralNumbers.indexOf(kuralNumber);
    if (idx === -1) return false;

    if (direction === 'up' && idx > 0) {
      const temp = col.kuralNumbers[idx];
      col.kuralNumbers[idx] = col.kuralNumbers[idx - 1];
      col.kuralNumbers[idx - 1] = temp;
      col.updatedAt = new Date().toISOString();
      await this.saveAllCollections(collections);
      return true;
    }

    if (direction === 'down' && idx < col.kuralNumbers.length - 1) {
      const temp = col.kuralNumbers[idx];
      col.kuralNumbers[idx] = col.kuralNumbers[idx + 1];
      col.kuralNumbers[idx + 1] = temp;
      col.updatedAt = new Date().toISOString();
      await this.saveAllCollections(collections);
      return true;
    }

    return false;
  },
};
