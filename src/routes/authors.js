import { Router } from 'express';
import * as authors from '../services/authors.js';
import { validateAuthor } from '../validators/authors.js';
import { parseId } from '../validators/common.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await authors.listAuthors());
});

router.get('/:id', async (req, res) => {
  res.json(await authors.getAuthorById(parseId(req.params.id)));
});

router.post('/', async (req, res) => {
  const author = await authors.createAuthor(validateAuthor(req.body));
  res.location(`/authors/${author.id}`).status(201).json(author);
});

router.put('/:id', async (req, res) => {
  res.json(await authors.updateAuthor(parseId(req.params.id), validateAuthor(req.body)));
});

router.delete('/:id', async (req, res) => {
  await authors.deleteAuthor(parseId(req.params.id));
  res.status(204).end();
});

export default router;
