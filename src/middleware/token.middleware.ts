// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express'; // Assuming you're using Express
import ApiResponse from '../config/response.config';
import { CustomRequest } from '../interfaces/interface';
import { Account } from '../models/database.connection';
import { JWTSECRETE } from '../config/environment.config';


class TokenMiddleware {

    static generate = (userdata: any) => {

        return jwt.sign({ userdata }, JWTSECRETE, { expiresIn: "90d" });
    }

    static verifyToken = async (req: CustomRequest, res: Response, next: NextFunction) => {

        try {

            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Authentication failed. Token missing.' });
            }

            const decoded: any = jwt.verify(token, JWTSECRETE);
            const email = decoded.userdata.email;

            const accountInstance = await Account.findOne({ where: { email } });

            if (!accountInstance) {
                return res.status(ApiResponse.code.unauthorized).json({ message: ApiResponse.fail.unauthorized });
            }

            const encryptedData = decoded.userData;

            const fetchedData = accountInstance.toJSON();

            req.userData = fetchedData;

            next();



        } catch (err) {

            return res.status(401).json({ message: 'Authentication failed. Token invalid.' });
        }
    }

    static verifyAdminToken = async (req: CustomRequest, res: Response, next: NextFunction) => {

        try {

            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Authentication failed. Token missing.' });
            }

            const decoded: any = jwt.verify(token, JWTSECRETE);
            const email = decoded.userdata.email;

            const accountInstance = await Account.findOne({ where: { email } });

            if (!accountInstance) {
                return res.status(ApiResponse.code.unauthorized).json({ message: ApiResponse.fail.unauthorized });
            } else if (accountInstance.isAdmin == false) {
                return res.status(ApiResponse.code.unauthorized).json({ message: ApiResponse.fail.adminUnauthorized });

            }

            const encryptedData = decoded.userData;

            const fetchedData = accountInstance.toJSON();

            req.userData = fetchedData;

            next();



        } catch (err) {

            return res.status(401).json({ message: 'Authentication failed. Token invalid.' });
        }
    }

}


export default TokenMiddleware;