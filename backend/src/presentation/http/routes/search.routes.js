'use strict';

const express = require('express');

function createSearchRouter(searchController) {
  const router = express.Router();

  router.get('/', searchController.search);

  return router;
}

module.exports = createSearchRouter;
