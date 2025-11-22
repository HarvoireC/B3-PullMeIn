// api/server.js
require('dotenv').config(); // facultatif, utile si un fichier .env est utilisé en local
const express = require('express');
const cors = require('cors');
const { validateArticlePayload } = require('./validation');
const { createArticlePr } = require('./github');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());            // en prod, à restreindre aux domaines autorisés
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'PullMeIn API is running' });
});

app.post('/api/articles', async (req, res) => {
  const { valid, errors } = validateArticlePayload(req.body);

  if (!valid) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  try {
    const result = await createArticlePr(req.body);

    return res.status(201).json({
      success: true,
      message: 'Article reçu. Une Pull Request a été créée.',
      prUrl: result.prUrl,
      branch: result.branchName,
      filePath: result.filePath,
    });
  } catch (err) {
    console.error('Erreur lors de la création de la PR :', err);
    return res.status(500).json({
      success: false,
      errors: ["Erreur interne lors de la création de la Pull Request."],
    });
  }
});

app.listen(PORT, () => {
  console.log(`PullMeIn API listening on http://localhost:${PORT}`);
});
