const mongoose = require('mongoose');
const User = require('./src/models/User');
const Round = require('./src/models/Round');

mongoose.connect('mongodb://127.0.0.1:27017/error404')
  .then(async () => {
    const round = await Round.findOne({ name: 'Test Round' });
    console.log('Round ID:', round._id);
    
    const user = await User.findOne({ username: 'Alias' });
    console.log('User startedRounds before pull:', user.startedRounds);

    const result = await User.updateMany(
      {},
      { $pull: { startedRounds: { roundId: round._id } } }
    );
    console.log('Pull result:', result);

    const userAfter = await User.findOne({ username: 'Alias' });
    console.log('User startedRounds after pull:', userAfter.startedRounds);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
