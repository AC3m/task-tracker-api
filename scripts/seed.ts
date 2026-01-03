import { db } from '../src/config/db.js';

const tasks = [
  { task: 'Complete homework', done: false, createdAt: new Date() },
  { task: 'Go to the gym', done: false, createdAt: new Date() },
  { task: 'Walk the dog', done: false, createdAt: new Date() },
  { task: 'Do laundry', done: false, createdAt: new Date() },
  { task: 'Buy groceries', done: false, createdAt: new Date() },
];

async function seed() {
  console.log('Seeding database...');
  const collectionRef = db.collection('tasks');

  const existingTasks = await collectionRef.get();
  const batch = db.batch();
  existingTasks.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  console.log('Existing tasks cleared.');

  let counter = 1;

  for (const task of tasks) {
    await collectionRef.doc(counter.toString()).set(task);
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
