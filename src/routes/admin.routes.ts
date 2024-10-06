import { Router, Request, Response } from "express";
import AccountController from "../controllers/account.controller";
import TokenMiddleware from "../middleware/token.middleware";

import AccountValidator from "../validators/account.validators";
import TicketService from "../services/ticket.service";
import TicketController from "../controllers/ticket.controller";
import Ticketvalidator from "../validators/ticket.validators";

const adminRouter = Router();
//Create Admin
adminRouter.post('/createaccount', AccountValidator.signup, AccountController.createAdminAccount);
//GET all Users
adminRouter.get('/accounts', TokenMiddleware.verifyAdminToken, AccountController.accounts);
//Initialize Event
adminRouter.post('/initialize', Ticketvalidator.initEvent, TokenMiddleware.verifyAdminToken, TicketController.initEvent)

adminRouter.get('/status/:eventId', TokenMiddleware.verifyAdminToken, TicketController.getStatus);

export default adminRouter 