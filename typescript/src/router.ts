import Express from 'express';
import DataImportController from './controllers/DataImportController';
import HealthcheckController from './controllers/HealthcheckController';
import ReportingController from './controllers/ReportingController';
import ClassController from './controllers/ClassController';

const router = Express.Router();

router.use('/', DataImportController);
router.use('/', HealthcheckController);
router.use('/reports', ReportingController);
router.use('/class', ClassController);

export default router;
