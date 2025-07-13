import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('home', { 
    title: '6ol Core - Embodied Presence',
    page: 'home'
  });
});

app.get('/maps', (req, res) => {
  res.render('maps', { 
    title: '6ol Core - Spirit Maps',
    page: 'maps'
  });
});

app.get('/reflections', (req, res) => {
  res.render('reflections', { 
    title: '6ol Core - Reflections',
    page: 'reflections'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌞 6ol Core Web Dashboard running on http://localhost:${PORT}`);
});