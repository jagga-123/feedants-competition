const mongoose = require('mongoose');
const dns = require('dns');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  // mongodb+srv:// URIs need a DNS SRV lookup before connecting. On some
  // Windows/networking setups, Node's resolver fails that lookup (querySrv
  // ECONNREFUSED) even though the OS's own DNS client resolves it fine —
  // falling back to public resolvers works around it. Local mongodb://
  // connections never hit this path.
  if (uri && uri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
  }

  await mongoose.connect(uri);
}

module.exports = connectDB;
