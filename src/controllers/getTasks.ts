import { RequestHandler } from 'express';
import { taskCollection } from '../config/db.js';
import { TaskResponse } from '../config/types.js';

export const getTasks: RequestHandler<{}, TaskResponse[], {}, {}> = async (
  req,
  res,
  next,
) => {
  try {
    const snapshot = await taskCollection.get();
    const tasksCollection = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(tasksCollection as TaskResponse[]);
  } catch (error) {
    next(error);
  }
};
