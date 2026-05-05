const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectBySlug,
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const uploadFields = upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'videos', maxCount: 5 },
]);

router.get('/', getProjects);
router.get('/slug/:slug', getProjectBySlug);

router.get('/admin/all', authMiddleware, getAllProjects);
router.post('/admin/create', authMiddleware, uploadFields, createProject);
router.put('/admin/:id', authMiddleware, uploadFields, updateProject);
router.delete('/admin/:id', authMiddleware, deleteProject);

module.exports = router;
