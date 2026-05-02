import { useState } from 'react';

const STATUSES = ['pending', 'in-progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Task title is required');
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {task ? '✏️ Edit Task' : '+ New Task'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Task Title *</label>
            <input
              id="task-title"
              name="title"
              type="text"
              className="form-input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              name="description"
              className="form-textarea"
              placeholder="Add details (optional)..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-status">Status</label>
              <select id="task-status" name="status" className="form-select" value={form.status} onChange={handleChange}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s === 'pending' ? '⏳ Pending' : s === 'in-progress' ? '🔄 In Progress' : '✅ Done'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select id="task-priority" name="priority" className="form-select" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>
                    {p === 'low' ? '🟢 Low' : p === 'medium' ? '🟡 Medium' : '🔴 High'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-due">Due Date (optional)</label>
            <input
              id="task-due"
              name="due_date"
              type="date"
              className="form-input"
              value={form.due_date}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              id="save-task-btn"
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? <><span className="spinner" /> Saving...</> : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
