const servicesService = require('../services/services.service');

async function createService(req, res) {
  try {
    const { providerId, announcementId, description, category, scheduledDate, scheduledPeriod, suggestedPrice } = req.body;
    if (!providerId || !description || !category) {
      return res.status(400).json({ success: false, error: 'providerId, descrição e categoria são obrigatórios' });
    }
    const service = await servicesService.createService(req.user.id, {
      providerId, announcementId, description, category, scheduledDate, scheduledPeriod, suggestedPrice,
    });
    return res.status(201).json({ success: true, data: service });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getService(req, res) {
  try {
    const service = await servicesService.getService(req.params.id, req.user.id);
    return res.json({ success: true, data: service });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function acceptService(req, res) {
  try {
    const { agreedPrice, scheduledDate, scheduledPeriod } = req.body;
    if (!agreedPrice || !scheduledDate || !scheduledPeriod) {
      return res.status(400).json({ success: false, error: 'Preço, data e período são obrigatórios' });
    }
    const service = await servicesService.acceptService(req.params.id, req.user.id, {
      agreedPrice, scheduledDate, scheduledPeriod,
    });
    return res.json({ success: true, data: service });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function cancelService(req, res) {
  try {
    const { reason } = req.body;
    const service = await servicesService.cancelService(req.params.id, req.user.id, { reason });
    return res.json({ success: true, data: service });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function markInProgress(req, res) {
  try {
    const service = await servicesService.markInProgress(req.params.id, req.user.id);
    return res.json({ success: true, data: service });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function markCompleted(req, res) {
  try {
    const service = await servicesService.markCompletedByProvider(req.params.id, req.user.id);
    return res.json({ success: true, data: service });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function confirmService(req, res) {
  try {
    const service = await servicesService.confirmService(req.params.id, req.user.id);
    return res.json({ success: true, data: service });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function requestModification(req, res) {
  try {
    const { newDate, newPeriod, reason } = req.body;
    const mod = await servicesService.requestModification(req.params.id, req.user.id, { newDate, newPeriod, reason });
    return res.status(201).json({ success: true, data: mod });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function respondModification(req, res) {
  try {
    const { accept } = req.body;
    if (accept === undefined) {
      return res.status(400).json({ success: false, error: 'Campo accept é obrigatório' });
    }
    const result = await servicesService.respondModification(req.params.modId, req.user.id, { accept });
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function reportNonAttendance(req, res) {
  try {
    const record = await servicesService.reportNonAttendance(req.params.id, req.user.id);
    return res.json({ success: true, data: record });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createService, getService, acceptService, cancelService,
  markInProgress, markCompleted, confirmService,
  requestModification, respondModification, reportNonAttendance,
};
