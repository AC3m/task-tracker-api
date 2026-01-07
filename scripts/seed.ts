import { db, taskCollection } from '../src/config/db.js';

const tasks = [
  {
    task: 'Complete homework',
    done: false,
    createdAt: new Date().toISOString(),
  },
  { task: 'Go to the gym', done: false, createdAt: new Date().toISOString() },
  { task: 'Walk the dog', done: false, createdAt: new Date().toISOString() },
  { task: 'Do laundry', done: false, createdAt: new Date().toISOString() },
  { task: 'Buy groceries', done: false, createdAt: new Date().toISOString() },
];

async function seed() {
  console.log('Seeding database...');

  const existingTasks = await taskCollection.get();
  const batch = db.batch();
  existingTasks.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  console.log('Existing tasks cleared.');

  let counter = 1;

  for (const task of tasks) {
    await taskCollection.doc(counter.toString()).set(task);
    console.log(`Added: ID[${counter}]: ${task.task}`);
    counter++;
  }
  console.log('Database seeding completed.');
  process.exit();
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
