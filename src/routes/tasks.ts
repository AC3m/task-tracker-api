import express from 'express';
import { getTasks } from '../controllers/getTasks.js';
import { getTaskById } from '../controllers/getTaskById.js';
import { updateTask } from '../controllers/updateTask.js';
import { createTask } from '../controllers/createTask.js';
import { deleteTask } from '../controllers/deleteTask.js';

export const router = express.Router();

router.get('/', getTasks);

router.get('/:id', getTaskById);

router.post('/', createTask);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

export default router;
