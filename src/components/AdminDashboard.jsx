import { useEffect, useState } from 'react';

const API_BASE = 'https://backend-4-i03l.onrender.com';
const STUDENTS_PER_PAGE = 2;

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState({
    total_students: 0,
    total_reviewed: 0,
    average_ui: 0,
    average_code: 0,
    average_completion: 0,
  });
  const [message, setMessage] = useState(null);
  const [reviewForms, setReviewForms] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const loadStudents = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const response = await fetch(
        `${API_BASE}/students?search=${encodeURIComponent(search)}&page=${page}&limit=${STUDENTS_PER_PAGE}`
      );
      if (!response.ok) {
        throw new Error('Could not load student data.');
      }
      const data = await response.json();
      setStudents(data.students || []);
      setTotal(data.total || 0);
    } catch (error) {
      setFetchError(error.message || 'Unable to load students.');
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics({
          total_students: data.total_students ?? 0,
          total_reviewed: data.total_reviewed ?? 0,
          average_ui: data.average_ui ?? 0,
          average_code: data.average_code ?? 0,
          average_completion: data.average_completion ?? 0,
        });
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / STUDENTS_PER_PAGE));
  const visibleFrom = total === 0 ? 0 : (page - 1) * STUDENTS_PER_PAGE + 1;
  const visibleTo = Math.min(page * STUDENTS_PER_PAGE, total);

  useEffect(() => {
    loadStudents();
  }, [search, page]);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleReview = async (studentId) => {
    const form = reviewForms[studentId];
    if (!form) return;

    const ui_marks = parseInt(form.ui_marks || '0', 10);
    const code_marks = parseInt(form.code_marks || '0', 10);
    const completion_marks = parseInt(form.completion_marks || '0', 10);
    const feedback = form.feedback || '';

    if (
      Number.isNaN(ui_marks) || ui_marks < 0 || ui_marks > 10 ||
      Number.isNaN(code_marks) || code_marks < 0 || code_marks > 10 ||
      Number.isNaN(completion_marks) || completion_marks < 0 || completion_marks > 10 ||
      feedback.trim() === ''
    ) {
      setMessage({ type: 'error', text: 'All fields are required and marks must be 0-10.' });
      return;
    }

    const response = await fetch(`${API_BASE}/review/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ui_marks, code_marks, completion_marks, feedback })
    });
    const data = await response.json();
    if (response.ok) {
      setMessage({ type: 'success', text: data.message });
      loadStudents();
      loadMetrics();
      // Hide the form after submission
      setReviewForms(prev => ({ ...prev, [studentId]: { ...prev[studentId], showForm: false } }));
    } else {
      setMessage({ type: 'error', text: data.message || 'Could not save review.' });
    }
  };

  const toggleReviewForm = (studentId, student) => {
    setReviewForms(prev => ({
      ...prev,
      [studentId]: {
        showForm: !prev[studentId]?.showForm,
        ui_marks: prev[studentId]?.ui_marks ?? student.ui_marks ?? '',
        code_marks: prev[studentId]?.code_marks ?? student.code_marks ?? '',
        completion_marks: prev[studentId]?.completion_marks ?? student.completion_marks ?? '',
        feedback: prev[studentId]?.feedback ?? student.feedback ?? ''
      }
    }));
  };

  const updateReviewForm = (studentId, field, value) => {
    setReviewForms(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  return (
    <div className="card dashboard-card">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="small-text">Manage student submissions and review progress.</p>
        </div>
      </div>
      <div className="dashboard-secondary">
        {/* Removed student count display for cleaner UI */}
      </div>

      <div className="grid-2">
        <div className="card stats-card">
          <h2>Quick Metrics</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">Total students</span>
              <strong>{metrics.total_students}</strong>
            </div>
            <div className="stat-box">
              <span className="stat-label">Reviewed</span>
              <strong>{metrics.total_reviewed}</strong>
            </div>
          </div>
        </div>
        <div className="card search-card">
          <h2>Search</h2>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search students by name"
          />
        </div>
      </div>

      <div className="card stats-card">
        <h2>Average Ratings</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Avg UI (/10)</span>
            <strong>{metrics.average_ui > 0 ? metrics.average_ui : 'N/A'}</strong>
          </div>
          <div className="stat-box">
            <span className="stat-label">Avg Code (/10)</span>
            <strong>{metrics.average_code > 0 ? metrics.average_code : 'N/A'}</strong>
          </div>
          <div className="stat-box">
            <span className="stat-label">Avg Completion (/10)</span>
            <strong>{metrics.average_completion > 0 ? metrics.average_completion : 'N/A'}</strong>
          </div>
        </div>
      </div>

      <section className="card">
        <h2>Student List</h2>
        {loading ? (
          <p className="small-text">Loading students...</p>
        ) : fetchError ? (
          <p className="small-text error-text">{fetchError}</p>
        ) : students.length === 0 ? (
          <p className="small-text">No students found.</p>
        ) : (
          students.map((student) => {
            const form = reviewForms[student.id] || {};
            return (
              <div key={student.id} className="student-row hover-card">
                <div className="student-header">
                  <div className="student-details">
                    <strong>{student.name}</strong>
                    <span>{student.email}</span>
                    <span>{student.project_name || 'No project submitted yet'}</span>
                    <span>Status: <span className="badge">{student.status}</span></span>
                  </div>
                  <div className="actions">
                    <button
                      onClick={() => toggleReviewForm(student.id, student)}
                      className={`hover-button review-btn ${student.status === 'Reviewed' ? 'edit-btn' : ''}`}
                    >
                      {student.status === 'Reviewed' ? 'Edit Review' : 'Review'}
                    </button>
                    {student.status === 'Reviewed' && (
                      <span className="review-done">✓ Review Done</span>
                    )}
                  </div>
                </div>
                <div className="image-row">
                  {student.profile_image && (
                    <img src={`http://localhost:4000/uploads/${student.profile_image}`} alt="Profile" />
                  )}
                  {student.project_image && (
                    <img src={`http://localhost:4000/uploads/${student.project_image}`} alt="Project" />
                  )}
                </div>
                <div className="small-text">
                  <p>GitHub: {student.github_link || 'N/A'}</p>
                  <p>Deploy: {student.deploy_link || 'N/A'}</p>
                  <p>UI: {student.ui_marks ?? 'N/A'} | Code: {student.code_marks ?? 'N/A'} | Completion: {student.completion_marks ?? 'N/A'}</p>
                  <p>Feedback: {student.feedback || 'No feedback'} </p>
                </div>
                {form.showForm && (
                  <div className="review-form">
                    <h3>Review Submission</h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleReview(student.id); }}>
                      <div className="form-grid">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          placeholder="UI Marks (/10)"
                          value={form.ui_marks || ''}
                          onChange={(e) => updateReviewForm(student.id, 'ui_marks', e.target.value)}
                          required
                        />
                        <input
                          type="number"
                          min="0"
                          max="10"
                          placeholder="Code Quality Marks (/10)"
                          value={form.code_marks || ''}
                          onChange={(e) => updateReviewForm(student.id, 'code_marks', e.target.value)}
                          required
                        />
                        <input
                          type="number"
                          min="0"
                          max="10"
                          placeholder="Completion Marks (/10)"
                          value={form.completion_marks || ''}
                          onChange={(e) => updateReviewForm(student.id, 'completion_marks', e.target.value)}
                          required
                        />
                        <textarea
                          placeholder="Feedback"
                          value={form.feedback || ''}
                          onChange={(e) => updateReviewForm(student.id, 'feedback', e.target.value)}
                          required
                        />
                        <button type="submit" className="hover-button">Submit Review</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}

        <div className="pagination">
          <button
            className="secondary"
            disabled={page <= 1 || loading}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span className="current-page">Page {page}</span>
          <button
            className="secondary"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </section>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}
    </div>
  );
}

export default AdminDashboard;
