import { DataTypes, Model, Sequelize } from "sequelize";
import { Account } from './user.model';

class WaitingList extends Model {
    [x: string]: any;
    public id!: number;
    public userId!: number;
    public eventId!: number;
    length: any;
}

const initializeWaitingListModel = (sequelize: Sequelize) => {
    WaitingList.init(
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            eventId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'WaitingList',
        }
    );

    return WaitingList;
};

export { WaitingList, initializeWaitingListModel };