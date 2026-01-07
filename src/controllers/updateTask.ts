import { RequestHandler } from 'express';
import { taskCollection } from '../config/db.js';
import {
  CustomError,
  Task,
  TaskResponse,
  UpdateTaskDto,
} from '../config/types.js';

export const updateTask: RequestHandler<
  UpdateTaskDto,
  TaskResponse,
  {},
  {}
> = async (req, res, next) => {
  try {
    const { id } = req.params;
    const taskRef = taskCollection.doc(id);
    const taskData = await taskRef.get();
    if (!taskData.exists) {
      const error = new Error(
        `A task with the id of ${id} was not found`,
      ) as CustomError;
      error.status = 404;
      return next(error);
    }
    const currentData = taskData.data() as Task;
    const newStatus = !currentData?.done;
    console.log('currentData:', typeof currentData.createdAt);

    await taskRef.update({ done: newStatus });
    const response: TaskResponse = {
      id: taskData.id,
      task: currentData.task,
      done: newStatus,
      createdAt: currentData.createdAt,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
