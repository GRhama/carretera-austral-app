// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock básico do Airtable
vi.mock('../config/airtable', () => ({
  tables: {
    roteiro: () => ({
      select: vi.fn(() => ({
        firstPage: vi.fn(() => Promise.resolve([]))
      }))
    }),
    gasolina: () => ({
      select: vi.fn(() => ({
        firstPage: vi.fn(() => Promise.resolve([]))
      }))
    })
  },
  validateConfig: vi.fn(() => true)
}));