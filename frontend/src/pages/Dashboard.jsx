import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import TaskModal from '../components/TaskModal';
import './Dashboard.css';

const STATUS_FILTERS = ['all', 'pending', 'in-progress', 'done'];
const PRIORITY_FILTERS = ['all', 'high', 'medium', 'low'];

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  done: 'Done',
};

const PRIORITY_ICONS = { high: '🔴', medium: '🟡', low: '🟢' };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      const res = await client.get('/api/tasks', { params });
      setTasks(res.data);
    } catch (err) {
      console.error('Fetch tasks error', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };

  const handleSave = async (taskData) => {
    if (editingTask) {
      const res = await client.put(`/api/tasks/${editingTask.id}`, taskData);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? res.data : t));
      showToast('Task updated!');
    } else {
      const res = await client.post('/api/tasks', taskData);
      setTasks(prev => [res.data, ...prev]);
      showToast('Task created!');
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting(id);
    try {
      await client.delete(`/api/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast('Task deleted', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleDone = async (task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    const res = await client.put(`/api/tasks/${task.id}`, { ...task, status: newStatus });
    setTasks(prev => prev.map(t => t.id === task.id ? res.data : t));
  };

  // Client-side search
  const visibleTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const donePercent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>⚡</span>
          <span>TaskFlow</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>

        <div className="sidebar-section-title">Filter by Status</div>
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            id={`filter-status-${s}`}
            className={`sidebar-filter-btn ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            <span>{s === 'all' ? '📋' : s === 'pending' ? '⏳' : s === 'in-progress' ? '🔄' : '✅'}</span>
            {s === 'all' ? 'All Tasks' : STATUS_LABELS[s]}
            <span className="filter-count">
              {s === 'all' ? total : s === 'pending' ? pending : s === 'in-progress' ? inProgress : done}
            </span>
          </button>
        ))}

        <div className="sidebar-section-title" style={{ marginTop: 16 }}>Filter by Priority</div>
        {PRIORITY_FILTERS.map(p => (
          <button
            key={p}
            id={`filter-priority-${p}`}
            className={`sidebar-filter-btn ${priorityFilter === p ? 'active' : ''}`}
            onClick={() => setPriorityFilter(p)}
          >
            <span>{p === 'all' ? '🎯' : PRIORITY_ICONS[p]}</span>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}

        <div className="sidebar-spacer" />

        <button id="logout-btn" className="btn btn-ghost sidebar-logout" onClick={handleLogout}>
          ← Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Top bar */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-greeting">{getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="dashboard-subtext">You have <strong>{pending}</strong> pending task{pending !== 1 ? 's' : ''} to complete.</p>
          </div>
          <button id="create-task-btn" className="btn btn-primary" onClick={openCreate}>
            + New Task
          </button>
        </header>

        {/* Stats row */}
        <div className="stats-row">
          <div className="stat-card card">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value">{total}</div>
            <div className="stat-progress">
              <div className="stat-bar" style={{ width: '100%', background: 'var(--accent-gradient)' }} />
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-label">Pending</div>
            <div className="stat-value" style={{ color: 'var(--status-pending)' }}>{pending}</div>
            <div className="stat-progress">
              <div className="stat-bar pending" style={{ width: total ? `${(pending/total)*100}%` : '0%' }} />
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value" style={{ color: 'var(--status-inprogress)' }}>{inProgress}</div>
            <div className="stat-progress">
              <div className="stat-bar inprogress" style={{ width: total ? `${(inProgress/total)*100}%` : '0%' }} />
            </div>
          </div>
          <div className="stat-card card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="stat-label">Completed</div>
            <div className="stat-value" style={{ color: 'var(--status-done)' }}>{done}</div>
            <div className="stat-progress">
              <div className="stat-bar done" style={{ width: `${donePercent}%` }} />
            </div>
            <div className="stat-percent">{donePercent}%</div>
          </div>
        </div>

        {/* Search bar */}
        <div className="search-bar-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="task-search-input"
            type="text"
            className="form-input search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Tasks list */}
        <div className="tasks-section">
          {loading ? (
            <div className="tasks-loading">
              <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
              <span>Loading tasks...</span>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="tasks-empty">
              <div className="empty-icon">📭</div>
              <h3>{search ? 'No tasks match your search' : 'No tasks yet'}</h3>
              <p>{search ? 'Try a different keyword' : 'Create your first task to get started!'}</p>
              {!search && (
                <button className="btn btn-primary" onClick={openCreate}>+ Create Task</button>
              )}
            </div>
          ) : (
            <div className="tasks-list">
              {visibleTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`task-card card ${task.status === 'done' ? 'task-done' : ''}`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  {/* Checkbox */}
                  <button
                    className={`task-check ${task.status === 'done' ? 'checked' : ''}`}
                    onClick={() => handleToggleDone(task)}
                    title={task.status === 'done' ? 'Mark as pending' : 'Mark as done'}
                  >
                    {task.status === 'done' ? '✓' : ''}
                  </button>

                  {/* Content */}
                  <div className="task-content">
                    <div className="task-title-row">
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-badges">
                        <span className={`badge badge-${task.priority}`}>
                          {PRIORITY_ICONS[task.priority]} {task.priority}
                        </span>
                        <span className={`badge badge-${task.status === 'in-progress' ? 'inprogress' : task.status}`}>
                          {STATUS_LABELS[task.status] || task.status}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}

                    <div className="task-meta">
                      <span className="task-date">
                        📅 Created {new Date(task.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                      {task.due_date && (
                        <span className="task-due">⏰ Due {task.due_date}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="task-actions">
                    <button
                      id={`edit-task-${task.id}`}
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEdit(task)}
                    >
                      ✏️
                    </button>
                    <button
                      id={`delete-task-${task.id}`}
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(task.id)}
                      disabled={deleting === task.id}
                    >
                      {deleting === task.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.type === 'error' ? '🗑️' : '✅'} {toast.msg}
        </div>
      )}
    </div>
  );
}
