import 'dotenv/config';
import Logger from './config/logger.js';
import App from './app.js';

//  Ensured that all models are imported so that Sequelize can recognize them and create tables accordingly
import { sequelize } from './models/index.js';

const LOG = new Logger('server.js');
const { PORT = 3000 } = process.env;
const MAX_RETRY = 20;

const startApplication = async (retryCount: number) => {
  try {
    await sequelize.authenticate();
    LOG.info('\n\n##################################\n✅ DB Connection established.\n##################################\n');

    await sequelize.sync({ force: true });
    LOG.info('\n\n##################################\n✅ Tables synced.\n##################################\n');

    App.listen(PORT, () => {
      LOG.info(`\n\n##################################\n🚀 Server on http://localhost:${PORT}\n##################################\n`);
    });

  } catch (e:unknown) {
    LOG.error(`❌ Failed. Retries: ${retryCount}`);

    if (retryCount > 0) {
      setTimeout(() => startApplication(retryCount - 1), 3000);
    } else {
      process.exit(1);
    }
  }
};

startApplication(MAX_RETRY);
