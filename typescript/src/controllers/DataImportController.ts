import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import upload from '../config/multer.js';
import { convertCsvToJson } from '../utils/index.js';
import DataImportService from '../services/DataImportService.js';

const DataImportController = Express.Router();

// Question 1: Upload CSV file and import/update/delete data into database
const dataImportHandler: RequestHandler = async (req, res, next) => {
  try{
    const { file } = req;

    await DataImportService.processImportValidation(file);

    const data = await convertCsvToJson(file.path);

    await DataImportService.processImportDataValidation(data);

    await DataImportService.processImport(data);

    // Here should use "sendStatus" instead of "status" to end the response, because status is just set status
    // Otherwise it will just hang there
    return res.sendStatus(StatusCodes.NO_CONTENT);

  }catch(error: unknown){

    next(error)
  }
};

// DataImportController.post('/upload', upload.single('data'), dataImportHandler);

DataImportController.post('/upload', (req, res, next) => {
  upload.single('data')(req, res, (err) => {
    if (err) {
      // Catch Multer-specific errors
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            error: 'Too many files. Only one CSV file is allowed per upload.'
        });
      }
      return res.status(400).json({ error: err.message });
    }

    next();
  });
}, dataImportHandler);

export default DataImportController;
