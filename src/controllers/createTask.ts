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

    const snapshot = await taskCollection.get();
    const newId = (snapshot.size + 1).toString();
    const newTaskData = {
      task,
      done: false,
      createdAt: new Date().toISOString(),
    };

    await taskCollection.doc(newId).set(newTaskData);

    const response = {
      id: newId,
      task: newTaskData.task,
      done: newTaskData.done,
      createdAt: newTaskData.createdAt,
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
