import fs from 'fs/promises'; import path from 'path'; import crypto from 'crypto';
import { config } from '../config';
export interface Storage { save(file: Express.Multer.File): Promise<string> }
export class LocalStorage implements Storage {
  async save(file: Express.Multer.File) {
    await fs.mkdir(config.uploadDir, { recursive: true });
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `${crypto.randomUUID()}${ext}`;
    await fs.writeFile(path.join(config.uploadDir, name), file.buffer);
    return `/uploads/${name}`;
  }
}
export const storage: Storage = new LocalStorage();
