'use strict';

class RecordController {
  constructor({ createRecordUseCase, getRecordByIdUseCase, listRecordsUseCase, exportFormatUseCase }) {
    this.createRecordUseCase = createRecordUseCase;
    this.getRecordByIdUseCase = getRecordByIdUseCase;
    this.listRecordsUseCase = listRecordsUseCase;
    this.exportFormatUseCase = exportFormatUseCase;
  }

  create = async (req, res, next) => {
    try {
      const { title, description } = req.body || {};
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }
      const record = await this.createRecordUseCase.execute({ title, description });
      return res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const record = await this.getRecordByIdUseCase.execute(id);
      if (!record) {
        return res.status(404).json({ error: `Record ${id} not found` });
      }
      return res.status(200).json(record);
    } catch (err) {
      next(err);
    }
  };

  list = async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit || '50', 10);
      const skip = parseInt(req.query.skip || '0', 10);
      const records = await this.listRecordsUseCase.execute({ limit, skip });
      return res.status(200).json(records);
    } catch (err) {
      next(err);
    }
  };

  export = async (req, res, next) => {
    try {
      const format = (req.query.format || 'json').toLowerCase();
      const output = await this.exportFormatUseCase.execute(format);
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        return res.status(200).send(output);
      }
      if (format === 'xml') {
        res.setHeader('Content-Type', 'application/xml');
        return res.status(200).send(output);
      }
      return res.status(200).json(output);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = RecordController;
