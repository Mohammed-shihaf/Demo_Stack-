import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';

export function createSearchRouter(searchController: SearchController): Router {
  const router = Router();

  router.get('/', searchController.search);

  return router;
}

export default createSearchRouter;
