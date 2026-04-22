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

    // Here must use "sendStatus" instead of "status" to end the response,
    // Otherwise it will just hang there
    return res.sendStatus(StatusCodes.NO_CONTENT);

  }catch(error: unknown){

    next(error)
  }
};

DataImportController.post('/upload', upload.single('data'), dataImportHandler);


export default DataImportController;
