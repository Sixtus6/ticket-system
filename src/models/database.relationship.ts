import { Account, Booking, WaitingList } from './database.connection';
import { EventsModel } from './event.model';

class Relationships {

    static group(AccountModel: typeof Account, WaitingListModel: typeof WaitingList, BookingModel: typeof Booking, EventModel: typeof EventsModel): void {
        AccountModel.hasMany(BookingModel);
        BookingModel.belongsTo(AccountModel);

        AccountModel.hasMany(WaitingListModel);
        WaitingListModel.belongsTo(AccountModel);

        EventModel.hasMany(BookingModel);
        BookingModel.belongsTo(EventModel);

        EventModel.hasMany(WaitingListModel);
        WaitingListModel.belongsTo(EventModel);



    }
}

export default Relationships;