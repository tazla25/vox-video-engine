import fs from 'node:fs';
import path from 'node:path';
import type { StorageProvider } from './interfaces.ts';

export class LocalAndArtifactStorageAdapter implements StorageProvider {
  readonly name = 'local-and-artifact-storage';
  private storageRoot: string;

  constructor(storageRoot: string = path.join(process.cwd(), 'out')) {
    this.storageRoot = storageRoot;
    fs.mkdirSync(this.storageRoot, { recursive: true });
  }

  async storeFile(localSourcePath: string, destinationKey: string): Promise<string> {
    if (!fs.existsSync(localSourcePath)) {
      throw new Error(`Source file does not exist: ${localSourcePath}`);
    }
    const destPath = path.join(this.storageRoot, destinationKey);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(localSourcePath, destPath);
    return destPath;
  }

  async getFile(sourceKey: string, localDestinationPath: string): Promise<void> {
    const srcPath = path.join(this.storageRoot, sourceKey);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Storage key not found: ${sourceKey}`);
    }
    fs.mkdirSync(path.dirname(localDestinationPath), { recursive: true });
    fs.copyFileSync(srcPath, localDestinationPath);
  }

  async fileExists(sourceKey: string): Promise<boolean> {
    const p = path.join(this.storageRoot, sourceKey);
    return fs.existsSync(p);
  }

  async getPublicUrl(sourceKey: string): Promise<string> {
    return `file://${path.resolve(this.storageRoot, sourceKey)}`;
  }
}
