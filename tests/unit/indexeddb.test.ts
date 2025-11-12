import {
  cachePutTask,
  cacheGetTask,
  cacheGetAllTasks,
  cacheDeleteTask,
  cachePutNotification,
  cacheGetAllNotifications,
  cacheDeleteNotification,
  enqueueForm,
  getQueuedForms,
  updateForm,
  deleteForm,
  enqueueImage,
  getQueuedImages,
  deleteImage,
  enqueueSignature,
  getQueuedSignatures,
  deleteSignature,
} from '@/lib/indexeddb';

type AnyReq = { result?: any; onsuccess?: ((ev: any) => void) | null; onerror?: ((ev: any) => void) | null };

function makeRequest(result: any): AnyReq {
  const req: AnyReq = { result };
  // fire asynchronously like IDB
  setTimeout(() => req.onsuccess && req.onsuccess({ type: 'success' }), 0);
  return req;
}

class FakeObjectStore {
  private data = new Map<any, any>();
  private keyPath: string | undefined;
  private autoIncrement: boolean;
  private autoId = 0;
  constructor(opts?: { keyPath?: string; autoIncrement?: boolean }) {
    this.keyPath = opts?.keyPath;
    this.autoIncrement = !!opts?.autoIncrement;
  }
  put(value: any) {
    const key = this.keyPath ? value[this.keyPath] : undefined;
    if (key === undefined && !this.autoIncrement) {
      throw new Error('Key required');
    }
    if (key === undefined && this.autoIncrement) {
      this.autoId += 1;
      value.id = this.autoId;
      this.data.set(this.autoId, value);
      return makeRequest(this.autoId);
    }
    this.data.set(key, value);
    return makeRequest(undefined);
  }
  add(value: any) {
    return this.put(value);
  }
  get(key: any) {
    return makeRequest(this.data.get(key));
  }
  getAll() {
    return makeRequest(Array.from(this.data.values()));
  }
  delete(key: any) {
    this.data.delete(key);
    return makeRequest(undefined);
  }
  createIndex() {
    // no-op for tests
    return {};
  }
}

class FakeDB {
  public stores = new Map<string, FakeObjectStore>();
  public objectStoreNames = {
    contains: (name: string) => this.stores.has(name),
  };
  createObjectStore(name: string, opts?: { keyPath?: string; autoIncrement?: boolean }) {
    const store = new FakeObjectStore(opts);
    this.stores.set(name, store);
    return store;
  }
  transaction(name: string, _mode: IDBTransactionMode) {
    const store = this.stores.get(name);
    if (!store) throw new Error('Store not found: ' + name);
    return {
      objectStore: (_n: string) => store,
      oncomplete: null as any,
      onerror: null as any,
      onabort: null as any,
    };
  }
  close() {
    // no-op
  }
}

function installFakeIndexedDB() {
  const dbCache = new Map<string, any>();
  (globalThis as any).indexedDB = {
    open: (name: string, version: number) => {
      const req: AnyReq & { result?: any; onupgradeneeded?: (ev: any) => void } = {};
      setTimeout(() => {
        const key = `${name}::${version}`;
        let db = dbCache.get(key);
        if (!db) {
          db = new FakeDB();
          dbCache.set(key, db);
          // first time: trigger upgrade so stores get created
          req.result = db as any;
          if (req.onupgradeneeded) req.onupgradeneeded({ type: 'upgradeneeded' });
        } else {
          req.result = db as any;
        }
        if (req.onsuccess) req.onsuccess({ type: 'success' });
      }, 0);
      return req as any;
    },
  };
}

function uninstallFakeIndexedDB() {
  delete (globalThis as any).indexedDB;
}

describe('indexeddb wrapper - no IndexedDB available', () => {
  beforeEach(() => {
    uninstallFakeIndexedDB();
  });
  it('returns safe fallbacks when indexedDB is unavailable', async () => {
    const all = await cacheGetAllTasks();
    expect(all).toEqual([]);
    const id = await enqueueForm({ foo: 1 });
    expect(id).toBeNull();
  });
});

describe('indexeddb wrapper - basic CRUD/queue flows', () => {
  beforeEach(() => {
    installFakeIndexedDB();
  });
  afterEach(() => {
    uninstallFakeIndexedDB();
  });

  it('stores and retrieves tasks', async () => {
    const ok = await cachePutTask({ id: 't1', title: 'Task 1' });
    expect(ok).toBe(true);
    const t = await cacheGetTask('t1');
    expect(t?.title).toBe('Task 1');
    const all = await cacheGetAllTasks();
    expect(all.find((x) => x.id === 't1')).toBeTruthy();
    const del = await cacheDeleteTask('t1');
    expect(del).toBe(true);
  });

  it('queues forms and updates/deletes', async () => {
    const id = await enqueueForm({ a: 1 });
    expect(typeof id).toBe('number');
    const forms = await getQueuedForms();
    expect(forms.length).toBeGreaterThan(0);
    const upd = await updateForm(id as number, { status: 'sending' });
    expect(upd).toBe(true);
    const del = await deleteForm(id as number);
    expect(del).toBe(true);
  });

  it('queues images and signatures with blobs', async () => {
    const imgId = await enqueueImage(new Blob(['img']), { name: 'test' });
    const imgs = await getQueuedImages();
    expect(imgs.length).toBeGreaterThan(0);
    await expect(deleteImage(imgId as number)).resolves.toBe(true);

    const sigId = await enqueueSignature(new Blob(['sig']), { task: 't1' });
    const sigs = await getQueuedSignatures();
    expect(sigs.length).toBeGreaterThan(0);
    await expect(deleteSignature(sigId as number)).resolves.toBe(true);
  });

  it('stores and retrieves notifications', async () => {
    await cachePutNotification({ id: 'n1', title: 'Ping' });
    const notes = await cacheGetAllNotifications();
    expect(notes.find((n) => n.id === 'n1')).toBeTruthy();
    await expect(cacheDeleteNotification('n1')).resolves.toBe(true);
  });
});


