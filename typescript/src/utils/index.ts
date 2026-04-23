import fs from 'fs';
import csv from 'csv-parser';
import { CsvItem } from '../types/csvItem.js';
import ErrorCodes from '../const/ErrorCodes.js';
import ErrorBase from '../errors/ErrorBase.js';
import Logger from '../config/logger.js';

const LOG = new Logger('Utils.js');

// export const convertCsvToJson = (filePath: string): Promise<CsvItem[]> => {
//   try {
//     const results: CsvItem[] = [];
//     const stream = fs.createReadStream(filePath).pipe(csv());

//     console.log("[Convert CSV To JSON]: ", stream)

//     // if (stream){
//     //   fs.unlinkSync(filePath)
//     // }

//     return new Promise((resolve, reject) => {
//       stream.on('data', (data: CsvItem) => results.push(data));
//       stream.on('end', () => resolve(results));
//       stream.on('error', (err) => reject(err));
//     });
//   }
//   catch (error: unknown) {

//     if (error instanceof ErrorBase) {
//       throw error;
//     }

//     const stackTrace = error instanceof Error ? error.stack : String(error);
//     LOG.error(`[convertCsvToJson] Unexpected Error: ${stackTrace}`);

//     throw new ErrorBase('Failed to convert CSV to JSON', ErrorCodes.DATABASE_ERROR, 500);
//   }
// }

export const convertCsvToJson = async (filePath: string): Promise<CsvItem[]> => {
  const results: CsvItem[] = [];

  try {
    const stream = fs.createReadStream(filePath).pipe(csv());

    // 2. use for await to wait for each of the data process
    for await (const row of stream) {
      results.push(row);
    }

    // 3. When step 2 finish, it reach step 3 and proceed delete the file after checking file existed.
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return results;

  } catch (error: unknown) {
    // Clear the file if file existed
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (error instanceof ErrorBase) {
      throw error;
    }

    const stackTrace = error instanceof Error ? error.stack : String(error);
    LOG.error(`[convertCsvToJson] Unexpected Error: ${stackTrace}`);

    throw new ErrorBase('Failed to convert CSV to JSON', ErrorCodes.DATABASE_ERROR, 500);
  }
};
