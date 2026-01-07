import express from 'express';
import { CustomError } from '../middleware/error.js';
import { db } from '../config/db.js';

const router = express.Router();

const taskCollection = db.collection('tasks');

interface Task {
  id?: string;
  task: string;
  done?: boolean;
}

//TO DO: Add controllers

router.get('/', async (req, res, next) => {
  try {
    const snapshot = await taskCollection.get();
    const tasksCollection = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(tasksCollection);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
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
});

router.post('/', async (req, res, next) => {
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
      createdAt: new Date(),
    };

    await taskCollection.doc(newId).set(newTaskData);
    res.status(201).json({ id: newId, ...newTaskData });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
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
    const currentData = taskData.data();
    const newStatus = !currentData?.done;

    await taskRef.update({ done: newStatus });
    res.status(200).json({
      id: taskData.id,
      ...currentData,
      done: newStatus,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
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
    const updatedCollection: Task[] = snapshot.docs.map(
      (task) =>
        ({
          id: task.id,
          ...task.data(),
        }) as Task,
    );
    res.status(200).json(updatedCollection);
  } catch (error) {
    next(error);
  }
});

export default router;
