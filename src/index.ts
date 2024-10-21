import http from 'http';
import express, { NextFunction } from 'express';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { DBHOST, DBNAME, DBPASSWORD, DBPORT, DBUSER, serverport } from './config/environment.config';
// import { db } from './models/database.connection';
import approuter from './routes/app.routes';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { SWAGGEROPTIONS } from './config/swagger.config';
import cors from 'cors';
import { db } from './models/database.connection';
import adminRouter from './routes/admin.routes';
import QueueService from './services/queue.service';


const app = express();
// Custom middleware to log request processing time
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`${req.method} ${req.baseUrl}${req.url} took ${duration}ms ${res.statusCode}`);
  });
  next();
});

const CORESOPTIONS = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  transports: ["websocket"],
};

app.use(cors(CORESOPTIONS));

const specs = swaggerJsdoc(SWAGGEROPTIONS);
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req: Request, res: Response) => {
  res.status(200).json('Hello Word');
});

app.use('/admin', adminRouter)
app.use('/api', approuter);

db.sequelize.sync({ force: !true }).then(() => {
  const server = app.listen(serverport, async () => {
    await QueueService.connectRabbitMQ(5, 5000).then(() => {
      QueueService.processWaitingListQueue()
    })
      .catch(error => console.error('Initialization failed:', error));;
    console.log(`Server is running at http://localhost:${serverport}`);
  });
});

export default app;