'use strict';

const express = require('express');

function createRecordRouter(recordController) {
  const router = express.Router();

  router.post('/', recordController.create);
  router.get('/', recordController.list);
  router.get('/export', recordController.export);
  router.get('/:id', recordController.getById);

  return router;
}

module.exports = createRecordRouter;
