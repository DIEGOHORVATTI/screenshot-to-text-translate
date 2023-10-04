import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { translate } from '@vitalets/google-translate-api';

const app = express();

// Middleware para parsear o corpo das requisições POST
app.use(bodyParser.json());

app.post('/translate', async (req: Request, res: Response) => {
  const { text, to } = req.body;

  try {
    const { text: translatedText } = await translate(text, { to });
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

const PORT: number = Number(3001);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
