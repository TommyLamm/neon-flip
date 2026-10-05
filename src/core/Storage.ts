import { SaveData, ZoneType } from '../types';
import { CONSTANTS } from './Constants';

export class StorageManager {
  public static load(): SaveData {
    try {
      const raw = localStorage.getItem(CONSTANTS.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.highScore === 'number' && !isNaN(parsed.highScore)) {
          const validZone = (['CYBER_STRIP', 'NEON_SPIRE', 'QUANTUM_VOID'] as ZoneType[]).includes(parsed.bestZone)
            ? parsed.bestZone
            : 'CYBER_STRIP';

          return {
            version: 2,
            highScore: Math.max(0, Math.floor(parsed.highScore)),
            highestCombo: Math.max(0, Math.floor(parsed.highestCombo ?? 0)),
            totalRuns: Math.max(0, Math.floor(parsed.totalRuns ?? 0)),
            isMuted: !!parsed.isMuted,
            bestZone: validZone,
          };
        }
      }
    } catch (e) {
      console.warn('StorageManager: Failed to read from localStorage', e);
    }
    return {
      version: 2,
      highScore: 0,
      highestCombo: 0,
      totalRuns: 0,
      isMuted: false,
      bestZone: 'CYBER_STRIP',
    };
  }

  public static save(data: SaveData): void {
    try {
      localStorage.setItem(CONSTANTS.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('StorageManager: Failed to write to localStorage', e);
    }
  }
}

