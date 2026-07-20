const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Importamos las rutas que crearemos después
app.use('/api/perfiles', require('./routes/perfiles'));
app.use('/api/diario', require('./routes/diario'));
app.use('/api/emociones', require('./routes/emociones'));

app.listen(3000, () => console.log('Backend corriendo en http://localhost:3000'));