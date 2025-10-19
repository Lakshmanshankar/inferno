import { type IDBPDatabase, openDB } from 'idb'
import { create } from 'zustand'

const DB_NAME = 'formless-editor-store'

export const STORE_NAME = {
  FILE: 'FILE_STORE',
  IMAGE: 'IMAGE_STORE',
} as const

type StoreKey = keyof typeof STORE_NAME
type StoreName = (typeof STORE_NAME)[StoreKey]

export type File = {
  name: string
  content: string
}

type KV = Record<string, File>

type IDBStoreState = {
  filesByStore: Record<StoreName, KV>
}

type IDBStoreActions = {
  getDb(): Promise<IDBPDatabase<unknown>>
  initStore(store: StoreName): Promise<void>
  loadFiles(store: StoreName): Promise<void>
  setFile(store: StoreName, key: number, content: string): Promise<void>
  getFile(store: StoreName, key: number): Promise<File | undefined>
  removeFile(store: StoreName, key: number): Promise<void>
  updateFileName(store: StoreName, key: number, newName: string): Promise<void>
}

export const useIDBStore = create<IDBStoreState & IDBStoreActions>((set, get) => ({
  filesByStore: {} as Record<StoreName, KV>,

  getDb: async () => {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        Object.values(STORE_NAME).forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store)
          }
        })
      },
    })
  },

  initStore: async (store) => {
    const db = await get().getDb()
    if (!db.objectStoreNames.contains(store)) {
      await openDB(DB_NAME, 1, {
        upgrade(upgradedDb) {
          if (!upgradedDb.objectStoreNames.contains(store)) {
            upgradedDb.createObjectStore(store)
          }
        },
      })
    }
    // load default store
    await get().loadFiles(store)
  },

  loadFiles: async (store) => {
    const db = await get().getDb()
    const tx = db.transaction(store, 'readonly')
    const objectStore = tx.objectStore(store)

    const all: KV = {}
    let cursor = await objectStore.openCursor()

    while (cursor) {
      all[cursor.key.toString()] = cursor.value
      cursor = await cursor.continue()
    }

    set((state) => ({
      filesByStore: {
        ...state.filesByStore,
        [store]: all,
      },
    }))
  },

  setFile: async (store, key, content) => {
    const db = await get().getDb()
    const existing = await get().getFile(store, key)
    const data: File = {
      name: existing?.name || 'Untitled',
      content,
    }
    await db.put(store, data, key)
    await get().loadFiles(store)
  },

  getFile: async (store, key) => {
    const db = await get().getDb()
    return db.get(store, key)
  },

  removeFile: async (store, key) => {
    const db = await get().getDb()
    await db.delete(store, key)
    await get().loadFiles(store)
  },

  updateFileName: async (store, key, newName) => {
    const file = await get().getFile(store, key)
    if (!file) return
    const db = await get().getDb()
    const updated: File = {
      name: newName,
      content: file.content,
    }
    await db.put(store, updated, key)
    await get().loadFiles(store)
  },
}))
