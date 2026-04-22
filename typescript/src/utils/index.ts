import fs from 'fs';
import csv from 'csv-parser';
import { CsvItem } from 'CsvItem';
import ErrorCodes from '../const/ErrorCodes.js';
import ErrorBase from '../errors/ErrorBase.js';
import Logger from '../config/logger';

const LOG = new Logger('Utils.js');

export const convertCsvToJson = (filePath: string): Promise<CsvItem[]> => {
  try {
    const results: CsvItem[] = [];
    const stream = fs.createReadStream(filePath).pipe(csv());

    return new Promise((resolve, reject) => {
      stream.on('data', (data: CsvItem) => results.push(data));
      stream.on('end', () => resolve(results));
      stream.on('error', (err) => reject(err));
    });
  }
  catch (error: unknown) {

      if (error instanceof ErrorBase) {
        throw error;
      }

      const stackTrace = error instanceof Error ? error.stack : String(error);
      LOG.error(`[convertCsvToJson] Unexpected Error: ${stackTrace}`);

      throw new ErrorBase('Failed to convert CSV to JSON', ErrorCodes.DATABASE_ERROR, 500);
    }
}
