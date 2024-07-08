import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
 
async function run() {
  try {
    await client.connect();
    const database = client.db('prolearning');
 
    // 1. Connection Check
    console.log('Connected to MongoDB');
 
    // 2. Collection Existence Check
    const collections = await database.listCollections().toArray();
const collectionNames = collections.map(col => col.name);
    if (!collectionNames.includes('chapters')) {
      throw new Error('Collection "chapters" does not exist');
    }
    console.log('Collection "chapters" exists');
 
    // 3. Document Validation Check
    const collection = database.collection('chapters');
    const documents = await collection.find({}).toArray();
    documents.forEach(doc => {
      if (!doc.hasOwnProperty('subject')) {
        throw new Error('Document validation failed: missing "subject"');
      }
    });
    console.log('All documents passed validation');
 
    // 4. Index Check
//     const indexes = await collection.indexes();
// const indexNames = indexes.map(index => index.name);
//     if (!indexNames.includes('requiredIndex')) {
//       throw new Error('Index "requiredIndex" does not exist');
    // }
    // console.log('Required index exists');
 
    // // 5. Schema Validation (basic example)
    // documents.forEach(doc => {
    //   if (typeof doc.requiredField !== 'subject') {
    //     throw new Error('Schema validation failed: "subject" is not a string');
    //   }
    // });
    // console.log('All documents passed schema validation');
 
  } finally {
    await client.close();
  }
}
 
run().catch(error => {
  console.error(error);
  process.exit(1);
});
