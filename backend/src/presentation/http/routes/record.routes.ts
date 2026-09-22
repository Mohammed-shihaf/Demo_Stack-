import { Router } from 'express';
import { RecordController } from '../controllers/RecordController';

export function createRecordRouter(recordController: RecordController): Router {
  const router = Router();

  router.post('/', recordController.create);
  router.get('/', recordController.list);
  router.get('/export', recordController.export);
  router.get('/:id', recordController.getById);

  return router;
}

export default createRecordRouter;
