import { VocabularyRecord, Sentence } from '../types';
import { VALID_SECTORS } from '../data/defaultVocabulary';
import { StorageService } from './storage';

export interface ParseResult {
  records: VocabularyRecord[];
  errors: string[];
  processed: number;
}

export interface MergeResult {
  processed: number;
  added: number;
  updated: number;
  failed: number;
  total: number;
}

export interface SentencePackResult {
  processed: number;
  updated: number;
  unknownIds: string[];
  failed: number;
  errors: string[];
}

export class VocabularyService {
  private static canonicalSector(value: string): string {
    const norm = String(value || '').replace(/^\uFEFF/, '').trim().toLowerCase();
    const found = VALID_SECTORS.find(s => s.toLowerCase() === norm);
    return found || 'General';
  }

  public static parsePipeImport(text: string): ParseResult {
    const raw = String(text || '').replace(/^\uFEFF/, '').trim();
    if (!raw) {
      return { records: [], errors: ['No data was pasted.'], processed: 0 };
    }

    const lines = raw.split(/\r\n|\n|\r/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return { records: [], errors: ['No valid rows found.'], processed: 0 };
    }

    // Check header
    const headerRow = lines[0].split('|').map(f => f.trim().toLowerCase());
    const expectedHeaderCount = 17;

    if (headerRow.length < expectedHeaderCount) {
      return {
        records: [],
        errors: [`Header does not match 17-column format (found ${headerRow.length} columns).`],
        processed: 0
      };
    }

    const ids = new Set<string>();
    const records: VocabularyRecord[] = [];
    const errors: string[] = [];

    lines.slice(1).forEach((line, index) => {
      const rowNum = index + 2;
      const fields = line.split('|').map(f => f.trim());

      if (fields.length < expectedHeaderCount) {
        errors.push(`Row ${rowNum}: Expected 17 columns, found ${fields.length}.`);
        return;
      }

      const id = fields[0];
      const word = fields[1];
      const sector = this.canonicalSector(fields[2]);
      const definition = fields[3];
      const exampleUsage = fields[4];

      if (!id || !word || !definition || !exampleUsage) {
        errors.push(`Row ${rowNum}: Missing required core fields (id, word, definition, or example_usage).`);
        return;
      }

      if (!/^VOC\d{6,}$/.test(id)) {
        errors.push(`Row ${rowNum}: Invalid ID format "${id}". Must be VOC followed by 6+ digits.`);
        return;
      }

      if (ids.has(id)) {
        errors.push(`Row ${rowNum}: Duplicate ID "${id}".`);
        return;
      }

      const sentences: Sentence[] = [];
      let sentenceError = '';

      for (let sIdx = 0; sIdx < 6; sIdx++) {
        const sentenceText = fields[5 + sIdx * 2];
        const flagStr = (fields[6 + sIdx * 2] || '').toLowerCase();

        if (!sentenceText) {
          sentenceError = `Missing text for sentence ${sIdx + 1}.`;
          break;
        }

        if (flagStr !== 'true' && flagStr !== 'false') {
          sentenceError = `s${sIdx + 1}_true flag must be TRUE or FALSE (got "${flagStr}").`;
          break;
        }

        sentences.push({
          text: sentenceText,
          correct: flagStr === 'true'
        });
      }

      if (sentenceError) {
        errors.push(`Row ${rowNum}: ${sentenceError}`);
        return;
      }

      const now = new Date().toISOString();
      records.push({
        id,
        word,
        sector,
        definition,
        exampleUsage,
        sentences,
        createdAt: now,
        updatedAt: now,
        status: 'active'
      });

      ids.add(id);
    });

    return {
      records,
      errors,
      processed: lines.length - 1
    };
  }

  public static mergeImported(imported: VocabularyRecord[]): MergeResult {
    const current = StorageService.getVocabulary();
    const map = new Map(current.map(r => [r.id, r]));

    let added = 0;
    let updated = 0;

    imported.forEach(rec => {
      if (map.has(rec.id)) {
        updated++;
      } else {
        added++;
      }
      map.set(rec.id, rec);
    });

    const merged = Array.from(map.values());
    StorageService.setVocabulary(merged);

    return {
      processed: imported.length,
      added,
      updated,
      failed: 0,
      total: merged.length
    };
  }

  public static updateSentencePack(parsed: ParseResult): SentencePackResult {
    const current = StorageService.getVocabulary();
    const map = new Map(current.map(r => [r.id, r]));

    let updated = 0;
    const unknownIds: string[] = [];

    parsed.records.forEach(rec => {
      const existing = map.get(rec.id);
      if (!existing) {
        unknownIds.push(rec.id);
        return;
      }
      map.set(rec.id, {
        ...existing,
        sentences: rec.sentences,
        updatedAt: new Date().toISOString()
      });
      updated++;
    });

    const merged = Array.from(map.values());
    StorageService.setVocabulary(merged);

    return {
      processed: parsed.processed,
      updated,
      unknownIds,
      failed: parsed.errors.length,
      errors: parsed.errors
    };
  }

  public static exportToPipeFormat(records: VocabularyRecord[]): string {
    const header = [
      'id', 'word', 'sector', 'definition', 'example_usage',
      's1', 's1_true', 's2', 's2_true', 's3', 's3_true',
      's4', 's4_true', 's5', 's5_true', 's6', 's6_true'
    ].join('|');

    const rows = records.map(r => {
      const sentenceFields: string[] = [];
      r.sentences.forEach(s => {
        sentenceFields.push(s.text);
        sentenceFields.push(s.correct ? 'TRUE' : 'FALSE');
      });

      return [
        r.id,
        r.word,
        r.sector,
        r.definition,
        r.exampleUsage,
        ...sentenceFields
      ].join('|');
    });

    return [header, ...rows].join('\n');
  }
}
