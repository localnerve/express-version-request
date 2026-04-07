export interface CustomVersion {
  label: string;
  isCustom: boolean;
  original: string;
  meta: object;
}

export type VersionResult = string | CustomVersion;

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      version?: VersionResult;
    }
  }
}