const express = require('express');
const cors = require('cors');
const competitionRoutes = require('./routes/competitionRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/competitions', competitionRoutes);

app.use(errorHandler);

module.exports = app;
