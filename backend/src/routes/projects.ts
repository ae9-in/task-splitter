import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  splitProject,
  updateStructure,
  exportProject,
  addModule,
} from '../controllers/projectController';

const router = Router();

// All project routes require auth
router.use(authMiddleware);

router.get('/', listProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/split', splitProject);
router.put('/:id/structure', updateStructure);
router.get('/:id/export', exportProject);
router.post('/:id/modules', addModule);

export default router;
