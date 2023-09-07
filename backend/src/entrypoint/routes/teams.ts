import express, { Request, Response } from 'express';
import { AddCounterToTeamCommand, CreateTeamCommand, DeleteTeamCommand } from '../../teamboard/domain/commands';
import { getMessageBusInstance } from '../../teamboard/config';
import { InMemoryTeamBoardView } from '../views/views';
import { errorResponse, successResponse,  } from './helpers';

const router = express.Router();
const PATH = '/api/teams'
const bus = getMessageBusInstance();
const views = new InMemoryTeamBoardView();

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: create a new team.
 */
router.post( PATH, async (req: Request, res: Response) => {
    // Create team Router
    const teamName : string = req.body.teamName;
    const cmd = new CreateTeamCommand(teamName);

    try {
        bus.handle(cmd);
        const response = successResponse(201,{teamName: teamName});
        res.status(response.statusCode).send(response); 
    } catch (error) {
        const response = errorResponse(error);
        res.status(response.statusCode).send(response);
    }
});


/**
 * @swagger
 * /api/teams/{teamName}:
 *   get:
 *     summary: get a team name.
 */
router.get( PATH + "/:teamName", async (req: Request, res: Response) => {
    // Get Team Router
    const teamName = req.params.teamName;    
    try{
        const counter = views.getTeam(teamName);
        const response = successResponse(200, counter);
        res.status(response.statusCode).send(response);
    } catch (error) {
        const response = errorResponse(error);
        res.status(response.statusCode).send(response);
    }
});


/**
 * @swagger
 * /api/teams/{teamName}:
 *   delete:
 *     summary: delete a new team.
 */
router.delete( PATH + "/:teamName", async (req: Request, res: Response) => {
    // Get team Router
    const teamName = req.params.teamName;
    const cmd = new DeleteTeamCommand(teamName);
    try {
        bus.handle(cmd);
        const response = successResponse(204, {teamName: teamName});
        res.status(response.statusCode).send(response); 
    } catch (error) {
        const response = errorResponse(error);
        res.status(response.statusCode).send(response);
    }
});


/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: get all teams.
 */
router.get( PATH, async (req: Request, res: Response) => {
    // Get Teams Router
    try {
        const teams = views.getTeams();
        const response = successResponse(200, teams);
        res.status(response.statusCode).send(response);
    }catch (error) {
        const response = errorResponse(error);
        res.status(response.statusCode).send(response);
    }
});


/**
 * @swagger
 * /api/teams/{teamName}/add:
 *   post:
 *     summary: add a counter to a team.
 */
router.post( PATH+"/:teamName/add", async (req: Request, res: Response) => {
    // Add counter to the team
    const teamName = req.params.teamName;
    const counterName : string = req.body.counterName;
    const cmd = new AddCounterToTeamCommand(counterName, teamName);
    try {
        bus.handle(cmd);
        const response = successResponse(200, `${counterName} was added to ${teamName}`);
        res.status(response.statusCode).send(response);
    }catch (error) {
        // console.log(`EVERYTHIN LOOK FINE ${error}`);
        const response = errorResponse(error);
        res.status(response.statusCode).send(response);
    }
});

export { router as TeamRouter };