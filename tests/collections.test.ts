import { CollectionStorage } from '../src/storage/collectionStorage';

describe('User Collections Persistence & Operations', () => {
  beforeEach(async () => {
    // Reset collections
    const defaults = await CollectionStorage.getAllCollections();
    // clear all custom ones
    for (const c of defaults) {
      await CollectionStorage.deleteCollection(c.id);
    }
  });

  test('creates a new custom collection', async () => {
    const created = await CollectionStorage.createCollection(
      'School Kurals',
      'Kurals learned in school',
      'book',
      '#2563EB'
    );

    expect(created.name).toBe('School Kurals');
    expect(created.description).toBe('Kurals learned in school');
    expect(created.kuralNumbers).toEqual([]);

    const all = await CollectionStorage.getAllCollections();
    expect(all.some((c) => c.id === created.id)).toBe(true);
  });

  test('adds and removes Kurals from a collection', async () => {
    const col = await CollectionStorage.createCollection('Test Set');

    // Add Kural 1
    const added1 = await CollectionStorage.addKuralToCollection(col.id, 1);
    expect(added1).toBe(true);

    // Add Kural 2
    const added2 = await CollectionStorage.addKuralToCollection(col.id, 2);
    expect(added2).toBe(true);

    // Prevent duplicate
    const addedDuplicate = await CollectionStorage.addKuralToCollection(col.id, 1);
    expect(addedDuplicate).toBe(false);

    let all = await CollectionStorage.getAllCollections();
    let current = all.find((c) => c.id === col.id);
    expect(current?.kuralNumbers).toEqual([1, 2]);

    // Remove Kural 1
    const removed = await CollectionStorage.removeKuralFromCollection(col.id, 1);
    expect(removed).toBe(true);

    all = await CollectionStorage.getAllCollections();
    current = all.find((c) => c.id === col.id);
    expect(current?.kuralNumbers).toEqual([2]);
  });

  test('reorders Kurals in a collection (move up/down)', async () => {
    const col = await CollectionStorage.createCollection('Order Test');
    await CollectionStorage.addKuralToCollection(col.id, 10);
    await CollectionStorage.addKuralToCollection(col.id, 20);
    await CollectionStorage.addKuralToCollection(col.id, 30);

    // Move Kural 20 up
    await CollectionStorage.moveKural(col.id, 20, 'up');

    let all = await CollectionStorage.getAllCollections();
    let current = all.find((c) => c.id === col.id);
    expect(current?.kuralNumbers).toEqual([20, 10, 30]);

    // Move Kural 20 down
    await CollectionStorage.moveKural(col.id, 20, 'down');

    all = await CollectionStorage.getAllCollections();
    current = all.find((c) => c.id === col.id);
    expect(current?.kuralNumbers).toEqual([10, 20, 30]);
  });

  test('renames a collection', async () => {
    const col = await CollectionStorage.createCollection('Old Name');
    await CollectionStorage.updateCollection(col.id, { name: 'New Name' });

    const all = await CollectionStorage.getAllCollections();
    const updated = all.find((c) => c.id === col.id);
    expect(updated?.name).toBe('New Name');
  });

  test('deletes a collection', async () => {
    const col = await CollectionStorage.createCollection('To Delete');
    const deleted = await CollectionStorage.deleteCollection(col.id);
    expect(deleted).toBe(true);

    const all = await CollectionStorage.getAllCollections();
    expect(all.some((c) => c.id === col.id)).toBe(false);
  });
});
