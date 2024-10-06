import { DBHOST, DBPORT, DBNAME, DBUSER, DBPASSWORD } from '../config/environment.config';
import { Sequelize } from 'sequelize';
import { Account, initializeAccountModel } from './user.model';

import Relationships from './database.relationship';
import { Booking, initializeBookingModel } from './booking.model';
import { EventsModel, initializeEventModel } from './event.model';
import { initializeWaitingListModel, WaitingList } from './waiting_list.model';

const sequelize = new Sequelize({
  database: DBNAME || '',
  username: DBUSER || '',
  password: DBPASSWORD || '',
  host: DBHOST || 'localhost',
  port: DBPORT || 8080,
  dialect: 'postgres',
  dialectOptions: {},
  logging: false
});

const db: any = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.account = initializeAccountModel(sequelize);
db.booking = initializeBookingModel(sequelize);
db.event = initializeEventModel(sequelize);
db.waitinglist = initializeWaitingListModel(sequelize);


Relationships.group(Account, WaitingList, Booking, EventsModel);


export { db, Account, WaitingList, Booking, EventsModel };
