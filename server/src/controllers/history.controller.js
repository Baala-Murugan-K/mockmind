import * as historyService from '../services/history.service.js';

export const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await historyService.getUserHistory(req.user._id, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getHistoryItem = async (req, res, next) => {
  try {
    const interview = await historyService.getHistoryItem(req.params.id, req.user._id);
    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryItem = async (req, res, next) => {
  try {
    await historyService.deleteHistoryItem(req.params.id, req.user._id);
    res.json({ success: true, message: 'Interview deleted' });
  } catch (error) {
    next(error);
  }
};

export const clearHistory = async (req, res, next) => {
  try {
    await historyService.clearHistory(req.user._id);
    res.json({ success: true, message: 'All interviews cleared' });
  } catch (error) {
    next(error);
  }
};
