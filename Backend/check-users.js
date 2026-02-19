require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const users = await User.find({}, 'username email password');

  for (const u of users) {
    const isHashed = u.password && u.password.startsWith('$2');
    console.log(u.email, '|', isHashed ? 'HASHED' : 'PLAIN: ' + u.password);

    // If plain text, hash it
    if (!isHashed) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(u.password, salt);
      await User.updateOne({ _id: u._id }, { password: hashed });
      console.log('  -> Fixed: password now hashed');
    }
  }

  console.log('\nDone.');
  mongoose.disconnect();
}).catch(e => console.error(e));
