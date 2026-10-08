import { Router } from 'express';
import * as posts from '../services/posts.js';
import { validatePost } from '../validators/posts.js';
import { parseId } from '../validators/common.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await posts.listPosts());
});

router.get('/author/:authorId', async (req, res) => {
  res.json(await posts.listPostsByAuthor(parseId(req.params.authorId, 'authorId')));
});

router.get('/:id', async (req, res) => {
  res.json(await posts.getPostById(parseId(req.params.id)));
});

router.post('/', async (req, res) => {
  const post = await posts.createPost(validatePost(req.body));
  res.location(`/posts/${post.id}`).status(201).json(post);
});

router.put('/:id', async (req, res) => {
  res.json(await posts.updatePost(parseId(req.params.id), validatePost(req.body)));
});

router.delete('/:id', async (req, res) => {
  await posts.deletePost(parseId(req.params.id));
  res.status(204).end();
});

export default router;
