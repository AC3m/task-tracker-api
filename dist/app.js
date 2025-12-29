import express from 'express';
import router from './routes/tasks.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/error.js';
const PORT = process.env.PORT || 8000;
const app = express();
// TODO: Add logger
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/tasks', router);
app.use(errorHandler);
app.use(notFound);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
