import { RequestHandler } from 'express';
import { taskCollection } from '../config/db.js';
import { GetTaskDto, TaskResponse, CustomError } from '../config/types.js';

export const deleteTask: RequestHandler<
  GetTaskDto,
  TaskResponse[],
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
    await taskRef.delete();
    const snapshot = await taskCollection.get();
    const updatedCollection = snapshot.docs.map(
      (task) =>
        ({
          id: task.id,
          ...task.data(),
        }) as TaskResponse,
    );
    res.status(200).json(updatedCollection);
  } catch (error) {
    next(error);
  }
};
