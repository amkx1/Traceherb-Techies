const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const harvestRoutes = require('./routes/harvestRoutes');
const batchRoutes = require('./routes/batchRoutes');
const provenanceRoutes = require('./routes/provenanceRoutes');
const labRoutes = require('./routes/labRoutes');
const recallRoutes = require('./routes/recallRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/provenance', provenanceRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/recall', recallRoutes);
app.use('/api/files', fileRoutes);

app.get('/', (req, res) => res.send('Traceher backend running'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
