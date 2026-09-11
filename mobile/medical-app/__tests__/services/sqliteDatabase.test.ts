/**
 * Tests for lib/services/sqliteDatabase (Capacitor SQLite wrapper + in-memory fallback).
 *
 * The native @capacitor-community/sqlite plugin is not available in the jsdom
 * environment, so the module transparently falls back to an in-memory Map.
 * These tests exercise the in-memory branch end-to-end, which mirrors the
 * shape of the SQL path (same public API, same guarantees).
 */

import type { OfflineOperation } from '@/lib/services/offlineQueue'
import { sqliteDatabase } from '@/lib/services/sqliteDatabase'

const op = (over: Partial<OfflineOperation> = {}): OfflineOperation => ({
  id: 'op-1',
  type: 'acknowledge_alert',
  payload: { alertId: 'a1' },
  timestamp: 1_000,
  retries: 0,
  status: 'pending',
  ...over,
})

beforeEach(async () => {
  await sqliteDatabase.deleteAll()
})

describe('sqliteDatabase (in-memory fallback)', () => {
  describe('upsertOperation / getAllOperations', () => {
    it('stores a new operation and returns it via getAll', async () => {
      await sqliteDatabase.upsertOperation(op())
      const rows = await sqliteDatabase.getAllOperations()
      expect(rows).toHaveLength(1)
      expect(rows[0].id).toBe('op-1')
      expect(rows[0].payload).toEqual({ alertId: 'a1' })
    })

    it('overwrites an existing operation with the same id', async () => {
      await sqliteDatabase.upsertOperation(op({ retries: 0 }))
      await sqliteDatabase.upsertOperation(op({ retries: 3, status: 'failed', error: 'x' }))
      const rows = await sqliteDatabase.getAllOperations()
      expect(rows).toHaveLength(1)
      expect(rows[0].retries).toBe(3)
      expect(rows[0].status).toBe('failed')
      expect(rows[0].error).toBe('x')
    })

    it('returns operations ordered by timestamp DESC', async () => {
      await sqliteDatabase.upsertOperation(op({ id: 'old', timestamp: 100 }))
      await sqliteDatabase.upsertOperation(op({ id: 'mid', timestamp: 500 }))
      await sqliteDatabase.upsertOperation(op({ id: 'new', timestamp: 900 }))
      const rows = await sqliteDatabase.getAllOperations()
      expect(rows.map((r) => r.id)).toEqual(['new', 'mid', 'old'])
    })
  })

  describe('updateStatus', () => {
    it('updates status without touching retries when not provided', async () => {
      await sqliteDatabase.upsertOperation(op({ retries: 2 }))
      await sqliteDatabase.updateStatus('op-1', 'processing')
      const [row] = await sqliteDatabase.getAllOperations()
      expect(row.status).toBe('processing')
      expect(row.retries).toBe(2)
    })

    it('updates retries and error when provided', async () => {
      await sqliteDatabase.upsertOperation(op())
      await sqliteDatabase.updateStatus('op-1', 'pending', 5, 'net-err')
      const [row] = await sqliteDatabase.getAllOperations()
      expect(row.retries).toBe(5)
      expect(row.error).toBe('net-err')
    })

    it('is a no-op for unknown ids', async () => {
      await sqliteDatabase.updateStatus('nope', 'completed')
      expect(await sqliteDatabase.getAllOperations()).toEqual([])
    })
  })

  describe('deleteOperation', () => {
    it('removes a single row by id', async () => {
      await sqliteDatabase.upsertOperation(op({ id: 'a' }))
      await sqliteDatabase.upsertOperation(op({ id: 'b' }))
      await sqliteDatabase.deleteOperation('a')
      const rows = await sqliteDatabase.getAllOperations()
      expect(rows.map((r) => r.id)).toEqual(['b'])
    })
  })

  describe('deleteCompleted', () => {
    it('drops only completed rows', async () => {
      await sqliteDatabase.upsertOperation(op({ id: 'a', status: 'completed' }))
      await sqliteDatabase.upsertOperation(op({ id: 'b', status: 'pending' }))
      await sqliteDatabase.upsertOperation(op({ id: 'c', status: 'completed' }))
      await sqliteDatabase.deleteCompleted()
      const ids = (await sqliteDatabase.getAllOperations()).map((r) => r.id)
      expect(ids).toEqual(['b'])
    })
  })

  describe('deleteAll', () => {
    it('clears the whole store', async () => {
      await sqliteDatabase.upsertOperation(op({ id: 'a' }))
      await sqliteDatabase.upsertOperation(op({ id: 'b' }))
      await sqliteDatabase.deleteAll()
      expect(await sqliteDatabase.getAllOperations()).toEqual([])
    })
  })

  describe('deleteOldCompleted', () => {
    it('drops completed rows older than the cutoff and keeps the rest', async () => {
      const now = Date.now()
      // Old + completed → deleted
      await sqliteDatabase.upsertOperation(op({
        id: 'old-completed', status: 'completed', timestamp: now - 10 * 60_000,
      }))
      // Old but pending → kept
      await sqliteDatabase.upsertOperation(op({
        id: 'old-pending', status: 'pending', timestamp: now - 10 * 60_000,
      }))
      // Recent completed → kept
      await sqliteDatabase.upsertOperation(op({
        id: 'new-completed', status: 'completed', timestamp: now,
      }))
      await sqliteDatabase.deleteOldCompleted(5 * 60_000) // 5 minutes
      const ids = (await sqliteDatabase.getAllOperations()).map((r) => r.id).sort()
      expect(ids).toEqual(['new-completed', 'old-pending'])
    })
  })

  describe('close', () => {
    it('is safe to call when the native connection was never opened', async () => {
      await expect(sqliteDatabase.close()).resolves.toBeUndefined()
    })
  })
})
