import { Association, DataTypes, Model, Sequelize } from 'sequelize';
import { Account } from './user.model';
import { EventsModel } from './event.model';

class Booking extends Model {

    public id!: number;
    public userId!: number;
    public eventId!: number;
    public status!: string;
    public reallocated!: boolean;
}

const initializeBookingModel = (sequelize: Sequelize) => {
    Booking.init(
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            eventId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('BOOKED', 'CANCELED'),
                allowNull: false,
            },
            reallocated: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'Booking',
        }
    );
    return Booking;
};

export { Booking, initializeBookingModel };
