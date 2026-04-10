import { useEffect, useState } from 'react';

const API_BASE = 'https://backend-4-i03l.onrender.com';

function StudentDashboard() {
  const student = JSON.parse(localStorage.getItem('student') || 'null');
  const [projectName, setProjectName] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [deployLink, setDeployLink] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [projectImage, setProjectImage] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [message, setMessage] = useState(null);

  const loadStudentData = async () => {
    if (!student) return null;
    const response = await fetch(`${API_BASE}/student/${student.id}`);
    if (response.ok) {
      const data = await response.json();
      setStudentData(data);
      return data;
    }
    return null;
  };

  useEffect(() => {
    if (!student) return;

    let lastStatus = null;
    const refresh = async () => {
      const latestData = await loadStudentData();
      if (latestData) {
        if (latestData.status === 'Reviewed' && lastStatus !== 'Reviewed') {
          setMessage({ type: 'success', text: 'Your project has been reviewed!' });
        }
        lastStatus = latestData.status;
      }
    };

    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [student?.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData();
    formData.append('student_id', student.id);
    formData.append('project_name', projectName);
    formData.append('github_link', githubLink);
    formData.append('deploy_link', deployLink);
    if (profileImage) formData.append('profile_image', profileImage);
    if (projectImage) formData.append('project_image', projectImage);

    const response = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (response.ok) {
      setMessage({ type: 'success', text: data.message });
      setProjectName('');
      setGithubLink('');
      setDeployLink('');
      setProfileImage(null);
      setProjectImage(null);
      await loadStudentData();
    } else {
      setMessage({ type: 'error', text: data.message || 'Could not submit project.' });
    }
  };

  return (
    <div className="card">
      <h1 className="page-title">Student Dashboard</h1>
      <p className="small-text">Welcome, {student?.name}</p>

      <section className="card">
        <h2>Submit Project</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" required />
          <input value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="GitHub link" required />
          <input value={deployLink} onChange={(e) => setDeployLink(e.target.value)} placeholder="Deploy link" required />
          <label>
            Profile image
            <input type="file" onChange={(e) => setProfileImage(e.target.files[0])} accept="image/*" />
          </label>
          <label>
            Project screenshot
            <input type="file" onChange={(e) => setProjectImage(e.target.files[0])} accept="image/*" />
          </label>
          <button type="submit">Submit project</button>
        </form>
      </section>

      <section className="card status-card">
        <h2>Submission Status</h2>
        {studentData ? (
          <div className="review-grid status-grid">
            <div>
              <strong>Status:</strong> <span className="badge status-badge">{studentData.status || 'Pending'}</span>
            </div>
            <div>
              <strong>UI Marks:</strong> {studentData.ui_marks ?? 'N/A'} / 10
            </div>
            <div>
              <strong>Code Marks:</strong> {studentData.code_marks ?? 'N/A'} / 10
            </div>
            <div>
              <strong>Completion Marks:</strong> {studentData.completion_marks ?? 'N/A'} / 10
            </div>
            <div>
              <strong>Feedback:</strong> {studentData.feedback || 'No feedback yet.'}
            </div>
            <div className="image-row">
              {studentData.profile_image && (
                <img src={`http://localhost:4000/uploads/${studentData.profile_image}`} alt="Profile" />
              )}
              {studentData.project_image && (
                <img src={`http://localhost:4000/uploads/${studentData.project_image}`} alt="Project" />
              )}
            </div>
          </div>
        ) : (
          <p className="small-text">Load your student record to view project status.</p>
        )}
      </section>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}
    </div>
  );
}

export default StudentDashboard;
