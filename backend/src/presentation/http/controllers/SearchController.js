'use strict';

class SearchController {
  constructor({ searchRecordsUseCase }) {
    this.searchRecordsUseCase = searchRecordsUseCase;
  }

  search = async (req, res, next) => {
    try {
      const q = req.query.q || '';
      if (!q.trim()) {
        return res.status(200).json([]);
      }
      const results = await this.searchRecordsUseCase.execute(q);
      return res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = SearchController;
