class StorageManager {
  constructor() {
    this.dbName = 'HummingbirdERP';
    this.version = 1;
    this.db = null;
    this.initDB();
  }

  initDB() {
    const request = indexedDB.open(this.dbName, this.version);
    
    request.onerror = () => console.error('DB init failed');
    request.onsuccess = (e) => {
      this.db = e.target.result;
    };
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      const stores = [
        'subGarments', 'customers', 'suppliers', 'inventory',
        'productionCosting', 'expenses', 'staff', 'cheques', 'settings'
      ];
      stores.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
  }

  async create(storeName, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve(data.id);
      request.onerror = () => reject(request.error);
    });
  }

  async read(storeName, id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async readAll(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(data.id);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async backup() {
    const stores = [
      'subGarments', 'customers', 'suppliers', 'inventory',
      'productionCosting', 'expenses', 'staff', 'cheques', 'settings'
    ];
    const backup = {};
    
    for (const store of stores) {
      backup[store] = await this.readAll(store);
    }
    
    return JSON.stringify(backup);
  }

  async restore(backupData) {
    try {
      const data = JSON.parse(backupData);
      const stores = Object.keys(data);
      
      for (const store of stores) {
        const items = data[store];
        for (const item of items) {
          await this.update(store, item);
        }
      }
      return true;
    } catch (e) {
      console.error('Restore failed:', e);
      return false;
    }
  }

  async search(storeName, predicate) {
    const items = await this.readAll(storeName);
    return items.filter(predicate);
  }

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

const storage = new StorageManager();
