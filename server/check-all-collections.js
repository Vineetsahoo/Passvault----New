import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/passvault')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n=== All Collections ===');
    collections.forEach(col => console.log(' -', col.name));
    
    // Check each collection for documents
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`\n${col.name}: ${count} documents`);
      
      if (count > 0 && count < 10) {
        const docs = await mongoose.connection.db.collection(col.name).find({}).limit(3).toArray();
        docs.forEach((doc, i) => {
          console.log(`  Doc ${i + 1}:`, JSON.stringify(doc, null, 2).substring(0, 300));
        });
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
