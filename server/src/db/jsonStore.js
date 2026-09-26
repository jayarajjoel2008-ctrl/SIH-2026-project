import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { SEED_USERS, SEED_ASSESSMENTS } from './seedData.js';

class JsonStore {
  constructor(collectionName, defaultData = []) {
    this.collectionName = collectionName;
    this.filePath = path.join(config.dataDir, `${collectionName}.json`);
    this.defaultData = defaultData;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(config.dataDir)) {
        fs.mkdirSync(config.dataDir, { recursive: true });
      }
      if (!fs.existsSync(this.filePath)) {
        this.writeAll(this.defaultData);
      }
    } catch (err) {
      console.error(`Error initializing store for ${this.collectionName}:`, err);
    }
  }

  readAll() {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [...this.defaultData];
      }
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (err) {
      console.error(`Error reading ${this.collectionName}:`, err);
      return [];
    }
  }

  writeAll(items) {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(items, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error(`Error writing ${this.collectionName}:`, err);
    }
  }

  find(predicate = () => true) {
    const all = this.readAll();
    return all.filter(predicate);
  }

  findOne(predicate) {
    const all = this.readAll();
    return all.find(predicate) || null;
  }

  findById(id) {
    const all = this.readAll();
    return all.find(item => item.id === id || item.reference_id === id) || null;
  }

  insert(item) {
    const all = this.readAll();
    const newItem = {
      ...item,
      id: item.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_date: item.created_date || new Date().toISOString()
    };
    all.unshift(newItem);
    this.writeAll(all);
    return newItem;
  }

  update(id, updates) {
    const all = this.readAll();
    const index = all.findIndex(item => item.id === id || item.reference_id === id);
    if (index === -1) return null;
    all[index] = {
      ...all[index],
      ...updates,
      updated_date: new Date().toISOString()
    };
    this.writeAll(all);
    return all[index];
  }

  delete(id) {
    const all = this.readAll();
    const initialLen = all.length;
    const filtered = all.filter(item => item.id !== id && item.reference_id !== id);
    if (filtered.length !== initialLen) {
      this.writeAll(filtered);
      return true;
    }
    return false;
  }
}

export const UsersDB = new JsonStore('users', SEED_USERS);
export const AssessmentsDB = new JsonStore('assessments', SEED_ASSESSMENTS);
