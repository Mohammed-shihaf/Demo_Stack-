import { Request, Response, NextFunction } from 'express';

export class SearchController {
  private searchRecordsUseCase: any;

  constructor(dependencies: { searchRecordsUseCase: any }) {
    this.searchRecordsUseCase = dependencies.searchRecordsUseCase;
  }

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = (req.query.q as string) || '';
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

export default SearchController;
