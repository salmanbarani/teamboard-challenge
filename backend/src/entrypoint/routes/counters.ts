import express, { Request, Response } from 'express';
import { CreateCounterCommand, DeleteCounterCommand, InCrementStepsCommand } from '../../teamboard/domain/commands';
import { getMessageBusInstance } from '../../teamboard/config';
import { InMemoryTeamBoardView } from '../views/views';
import { errorResponse, successResponse } from './helpers';

const router = express.Router();
const PATH = '/api/counters';
const bus = getMessageBusInstance();
const views = new InMemoryTeamBoardView();

/**
 * @swagger
 * /api/counters:
 *   post:
 *     summary: Create a new counter
 */
router.post(PATH, async (req: Request, res: Response) => {
  // Create Counter Router
  const counterName: string = req.body.counterName;
  const cmd = new CreateCounterCommand(counterName);

  try {
    bus.handle(cmd);
    const response = successResponse(201, { counterName: counterName });
    res.status(response.statusCode).send(response);
  } catch (error) {
    const response = errorResponse(error);
    res.status(response.statusCode).send(response);
  }
});

/**
 * @swagger
 * /api/counters/{counterName}:
 *   get:
 *     summary: Get a counter by name
 */
router.get(PATH + "/:counterName", async (req: Request, res: Response) => {
  // Get Counter Router
  const counterName = req.params.counterName;
  try {
    const counter = views.getCounter(counterName);
    const response = successResponse(200, counter);
    res.status(response.statusCode).send(response);
  } catch (error) {
    const response = errorResponse(error);
    res.status(response.statusCode).send(response);
  }
});

/**
 * @swagger
 * /api/counters/{counterName}:
 *   delete:
 *     summary: Delete a counter by name
 */
router.delete(PATH + "/:counterName", async (req: Request, res: Response) => {
  // Delete Counter Router
  const counterName = req.params.counterName;
  const cmd = new DeleteCounterCommand(counterName);
  try {
    bus.handle(cmd);
    const response = successResponse(204, {});
    res.status(response.statusCode).send(response);
  } catch (error) {
    const response = errorResponse(error);
    res.status(response.statusCode).send(response);
  }
});

/**
 * @swagger
 * /api/counters:
 *   get:
 *     summary: Get all counters
 */
router.get(PATH, async (req: Request, res: Response) => {
  // Get Counters Router
  try {
    const counters = views.getCounters();
    const response = successResponse(200, counters);
    res.status(response.statusCode).send(response);
  } catch (error) {
    const response = errorResponse(error);
    res.status(response.statusCode).send(response);
  }
});

/**
 * @swagger
 * /api/counters/{counterName}/add-steps:
 *   post:
 *     summary: Add steps to a counter (Y), counter MUST be added to a team before calling this endpoint.
 */
router.post(PATH + "/:counterName/add-steps", async (req: Request, res: Response) => {
  // Add Steps to Counter Router
  const counterName = req.params.counterName;
  const teamName: string = req.body.teamName; // Get the teamName from the request body
  const cmd = new InCrementStepsCommand(counterName);

  try {
    // Ensure that the team exists and is valid before incrementing the steps
    // ... add your team validation logic here ...

    bus.handle(cmd);
    const response = successResponse(200, {});
    res.status(response.statusCode).send(response);
  } catch (error) {
    const response = errorResponse(error);
    res.status(response.statusCode).send(response);
  }
});

export { router as CounterRouter };
