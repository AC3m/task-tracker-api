import express from 'express';
import { CustomError } from '../middleware/error.js';
import { db } from '../config/db.js';

const router = express.Router();

const taskCollection = db.collection('tasks');

//TO DO: Add controllers

router.get('/', async (req, res, next) => {
  try {
    const snapshot = await taskCollection.get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await taskCollection.doc(id).get();
    if (!doc.exists) {
      const error = new Error(
        `A task with the id of ${id} was not found`,
      ) as CustomError;
      error.status = 404;
      return next(error);
    }
    res.status(200).json({
      id: doc.id,
      task: doc.data()?.task,
      done: doc.data()?.done,
      createdAt: doc.data()?.createdAt,


    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { task } = req.body;
  if (!task) {
    const error = new Error('Bad Request') as CustomError;
    error.status = 400;
    next(error);
  }

  try {
    const snapshot = await taskCollection.get();
    const newId = (snapshot.size + 1).toString();
    const newTask = {
      task,
      done: false,
      createdAt: new Date(),
    };

    await taskCollection.doc(newId).set(newTask);
    res.status(201).json({ id: newId, ...newTask });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
  const { id } = req.params;
  const taskRef = taskCollection.doc(id);
  const doc = await taskRef.get();
  if (!doc.exists) {
    const error = new Error(
      `A task with the id of ${id} was not found`,
    ) as CustomError;
    error.status = 404;
    return next(error);
  }
  const currentData = doc.data();
  const newStatus = !currentData?.done;

  await taskRef.update({done: newStatus});
  res.status(200).json({
    id: doc.id,
    ...currentData,
    done:newStatus
  })
}catch (error) {
    next(error);
  }
});

// TODO: Refactor delete route to use Firestore

// router.delete('/:id', (req, res, next) => {
//   const { id: paramId } = req.params;
//   const task = taskList.find((task) => task.id === +paramId);
//   if (!task) {
//     // const error = { error: `A task with the id of ${paramId} was not found` };
//     const error = new Error(
//       `A task with the id of ${paramId} was not found`,
//     ) as CustomError;
//     error.status = 404;
//     return next(error);
//   }
//   const updatedTaskList = taskList.filter((task) => task.id !== +paramId);
//   res.status(200).json(updatedTaskList);
// });

export default router;
