import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ApiResponse from "../config/response.config";
import TicketService from "../services/ticket.service";
import { CustomRequest } from "../interfaces/interface";
import { EventsModel } from "../models/event.model";
import { db } from "../models/database.connection";

class TicketController {

    static async initEvent(req: Request, res: Response): Promise<void> {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(ApiResponse.code.bad_request).json({ errors: errors.array() });
            return;
        }

        try {
            const response = await TicketService.initEvent(req.body)
            res.status(response.code).json(response.body);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({
                    error: true,
                    message: `Internal Server Error: ${error.message}`,
                    data: {},
                });
            }
        }
    }

    static async getAllEvents(req: Request, res: Response): Promise<void> {

        try {
            const response = await TicketService.getAllEvents();
            res.status(response.code).json(response.body);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({
                    error: true,
                    message: `Internal Server Error: ${error.message}`,
                    data: {},
                });
            }
        }
    }


    static async bookEvent(req: CustomRequest, res: Response): Promise<void> {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(ApiResponse.code.bad_request).json({ errors: errors.array() });
            return;
        }
        try {
            const { id } = req.userData;
            req.body.userId = id;
            const response = await TicketService.bookEvent(req.body)
            res.status(response.code).json(response.body);
        } catch (error) {
            const transaction = await db.sequelize.transaction();
            await transaction.rollback();
            if (error instanceof Error) {
                res.status(500).json({
                    error: true,
                    message: `Internal Server Error: ${error.message}`,
                    data: {},
                });
            }
        }
    }


    static async getStatus(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { eventId } = req.params;
            const response = await TicketService.getStatus(eventId)
            res.status(response.code).json(response.body);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({
                    error: true,
                    message: `Internal Server Error: ${error.message}`,
                    data: {},
                });
            }
        }
    }

    static async cancelBookedEvent(req: CustomRequest, res: Response): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(ApiResponse.code.bad_request).json({ errors: errors.array() });
            return;
        }
        try {
            const { id } = req.userData;

            req.body.userId = id;
            const response = await TicketService.cancelEvent(req.body);
            res.status(response.code).json(response.body)
        } catch (error) {
            const transaction = await db.sequelize.transaction();
            await transaction.rollback();
            if (error instanceof Error) {
                res.status(500).json({
                    error: true,
                    message: `Internal Server Error: ${error.message}`,
                    data: {},
                });
            }
        }

    }



}

export default TicketController;