import express from 'express';
import { CustomError } from '../middleware/error.js';

const router = express.Router();

interface TaskList {
  id: number;
  task: string;
  done: boolean;
  createAt?: DateConstructor;
}

// TODO: Introduce DB OR storing in JSON

const taskList: TaskList[] = [
  { id: 1, task: 'Complete homework', done: false },
  { id: 2, task: 'Go to the gym', done: false },
  { id: 3, task: 'Walk the dog', done: false },
  { id: 4, task: 'Do laundry', done: false },
  { id: 5, task: 'Buy groceries', done: false },
];

//TO DO: Add controllers
//TO DO: Support query param filtering done items

router.get('/', (req, res) => {
  res.status(200).json(taskList);
});

router.post('/', (req, res, next) => {
  const { task } = req.body;
  const newTask = {
    id: taskList.length + 1,
    task: task,
    done: false,
    createdAt: new Date(),
  };
  if (!task) {
    const error = new Error('Bad Request') as CustomError;
    error.status = 400;
    next(error);
  }
  taskList.push(newTask);
  res.status(201).json(taskList);
});

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const task = taskList.find((task) => task.id === +id);
  if (!task) {
    const error = new Error(
      `A task with the id of ${id} was not found`,
    ) as CustomError;
    error.status = 404;
    return next(error);
  }

  task.done = !task.done;

  res.status(200).json(taskList);
});

router.delete('/:id', (req, res, next) => {
  const { id: paramId } = req.params;
  const task = taskList.find((task) => task.id === +paramId);
  if (!task) {
    // const error = { error: `A task with the id of ${paramId} was not found` };
    const error = new Error(
      `A task with the id of ${paramId} was not found`,
    ) as CustomError;
    error.status = 404;
    return next(error);
  }
  const updatedTaskList = taskList.filter((task) => task.id !== +paramId);
  res.status(200).json(updatedTaskList);
});

export default router;
