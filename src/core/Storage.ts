import { SaveData } from '../types';
import { CONSTANTS } from './Constants';

export class StorageManager {
  public static load(): SaveData {
    try {
      const raw = localStorage.getItem(CONSTANTS.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.highScore === 'number') {
          return {
            version: 1,
            highScore: parsed.highScore,
            highestCombo: parsed.highestCombo ?? 0,
            totalRuns: parsed.totalRuns ?? 0,
            isMuted: !!parsed.isMuted,
          };
        }
      }
    } catch (e) {
      console.warn('StorageManager: Failed to read from localStorage', e);
    }
    return {
      version: 1,
      highScore: 0,
      highestCombo: 0,
      totalRuns: 0,
      isMuted: false,
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
