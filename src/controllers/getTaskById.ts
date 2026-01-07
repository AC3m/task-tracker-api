import { GetTaskDto, CustomError, TaskResponse } from '../config/types.js';
import { taskCollection } from '../config/db.js';
import { RequestHandler } from 'express';

export const getTaskById: RequestHandler<GetTaskDto, TaskResponse, {}> = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;
    const taskData = await taskCollection.doc(id).get();
    if (!taskData.exists) {
      const error = new Error(
        `A task with the id of ${id} was not found`,
      ) as CustomError;
      error.status = 404;
      return next(error);
    }
    res.status(200).json({
      id: taskData.id,
      task: taskData.data()?.task,
      done: taskData.data()?.done,
      createdAt: taskData.data()?.createdAt,
    });
  } catch (error) {
    next(error);
  }
};
