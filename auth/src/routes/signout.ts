import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  req.session = null;
  res.send({});
});

// Trying to get change in Skaffold to work.
export { router as signoutRouter };
