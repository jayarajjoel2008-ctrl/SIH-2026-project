import { AssessmentsDB } from '../db/jsonStore.js';

export class AssessmentController {
  static async list(req, res) {
    try {
      const { sort = '-created_date', limit = 200, risk_category, status, search } = req.query;
      let items = AssessmentsDB.readAll();

      // Filtering by risk category
      if (risk_category && risk_category !== 'All') {
        items = items.filter(a => a.risk_category?.toLowerCase() === risk_category.toLowerCase());
      }

      // Filtering by status
      if (status && status !== 'All') {
        items = items.filter(a => a.status?.toLowerCase() === status.toLowerCase());
      }

      // Search across name, reference_id, narrative, primary_concern
      if (search && search.trim()) {
        const query = search.toLowerCase().trim();
        items = items.filter(a => 
          (a.full_name && a.full_name.toLowerCase().includes(query)) ||
          (a.reference_id && a.reference_id.toLowerCase().includes(query)) ||
          (a.narrative && a.narrative.toLowerCase().includes(query)) ||
          (a.primary_concern && a.primary_concern.toLowerCase().includes(query))
        );
      }

      // Sorting
      if (sort) {
        const isDesc = sort.startsWith('-');
        const field = isDesc ? sort.substring(1) : sort;
        items.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
          return 0;
        });
      }

      // Limit
      const max = parseInt(limit, 10) || 200;
      return res.json(items.slice(0, max));
    } catch (err) {
      console.error('Assessment list error:', err);
      return res.status(500).json({ error: 'Failed to fetch assessments: ' + err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const found = AssessmentsDB.findById(id);
      if (!found) {
        return res.status(404).json({ error: 'Assessment not found' });
      }
      return res.json(found);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const data = req.body;
      const currentYear = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const refId = data.reference_id || `NHAA-${currentYear}-${randomSuffix}`;

      const newRecord = {
        ...data,
        reference_id: refId,
        id: data.id || `asm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        status: data.status || (data.risk_category === 'Critical' ? 'Escalated' : 'Analyzed'),
        created_date: data.created_date || new Date().toISOString()
      };

      const saved = AssessmentsDB.insert(newRecord);
      return res.status(201).json(saved);
    } catch (err) {
      console.error('Assessment create error:', err);
      return res.status(500).json({ error: 'Failed to create assessment: ' + err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = AssessmentsDB.update(id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Assessment not found to update' });
      }
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const success = AssessmentsDB.delete(id);
      if (!success) {
        return res.status(404).json({ error: 'Assessment not found to delete' });
      }
      return res.json({ success: true, message: 'Assessment deleted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async stats(req, res) {
    try {
      const all = AssessmentsDB.readAll();
      const total = all.length;
      const criticalCount = all.filter(a => a.risk_category === 'Critical').length;
      const highCount = all.filter(a => a.risk_category === 'High').length;
      const moderateCount = all.filter(a => a.risk_category === 'Moderate').length;
      const lowCount = all.filter(a => a.risk_category === 'Low').length;

      const avgSvi = total > 0
        ? Math.round(all.reduce((acc, curr) => acc + (Number(curr.svi_score) || 0), 0) / total)
        : 0;

      const statusCounts = {
        Pending: all.filter(a => a.status === 'Pending').length,
        Analyzed: all.filter(a => a.status === 'Analyzed').length,
        Escalated: all.filter(a => a.status === 'Escalated').length,
        Resolved: all.filter(a => a.status === 'Resolved').length
      };

      return res.json({
        total,
        criticalCount,
        highCount,
        moderateCount,
        lowCount,
        avgSvi,
        statusCounts
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}
