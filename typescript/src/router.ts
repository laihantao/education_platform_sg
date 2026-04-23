import Express from 'express';
import DataImportController from './controllers/DataImportController.js';
import HealthcheckController from './controllers/HealthcheckController.js';
import ReportingController from './controllers/ReportingController.js';
import ClassController from './controllers/ClassController.js';

const router = Express.Router();

router.use('/', DataImportController);
router.use('/', HealthcheckController);
router.use('/reports', ReportingController);
router.use('/class', ClassController);

export default router;
