
import('mongoose').then(async (m) => {
  const mongoose = m.default;
  await mongoose.connect('mongodb://localhost:27017/glybette');
  const db = mongoose.connection.db;
  const countWithCompetences = await db.collection('offres').countDocuments({ status: 'active', competences: { $exists: true, $not: { $size: 0 } } });
  const total = await db.collection('offres').countDocuments({ status: 'active' });
  console.log('Total actives:', total);
  console.log('Avec competences:', countWithCompetences);
  process.exit(0);
});

