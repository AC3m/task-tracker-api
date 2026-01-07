import { RequestHandler } from 'express';
import {
  CreateTaskDto,
  GetTaskDto,
  TaskResponse,
  CustomError,
} from '../config/types.js';
import { taskCollection } from '../config/db.js';

export const createTask: RequestHandler<
  GetTaskDto,
  TaskResponse,
  CreateTaskDto,
  {}
> = async (req, res, next) => {
  try {
    const { task } = req.body;
    if (!task) {
      const error = new Error('Bad Request') as CustomError;
      error.status = 400;
      next(error);
    }

    const newTaskData = {
      task,
      done: false,
      createdAt: new Date().toISOString(),
    };

    const docRef = await taskCollection.add(newTaskData);

    const response = {
      id: docRef.id,
      task: newTaskData.task,
      done: newTaskData.done,
      createdAt: newTaskData.createdAt,
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
