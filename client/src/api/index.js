import axios from 'axios';

// Dev: Vite proxies /api → backend (see vite.config.js). Override with VITE_API_URL for production.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use(function(config) {
  const token = localStorage.getItem('collabr_token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});

// --- Auth ---
export function registerUser(data) {
  return api.post('/auth/register', data);
}

export function loginUser(data) {
  return api.post('/auth/login', data);
}

// --- Projects ---
export function getFeed() {
  return api.get('/projects/feed');
}

export function getMyProjects() {
  return api.get('/projects/mine');
}

export function getProjectById(id) {
  return api.get('/projects/' + id);
}

export function createProject(data) {
  return api.post('/projects', data);
}

export function updateProjectStatus(id, status) {
  return api.patch('/projects/' + id + '/status', { status: status });
}

export function updateProject(id, data) {
  return api.patch('/projects/' + id, data);
}

// --- Swipes ---
export function recordSwipe(projectId, action) {
  return api.post('/swipes', { projectId: projectId, action: action });
}

// --- Matches ---
export function getIncomingMatches() {
  return api.get('/matches/incoming');
}

export function acceptMatch(matchId, payload) {
  return api.post('/matches/' + matchId + '/accept', payload || {});
}

export function getMyApplications() {
  return api.get('/matches/my-applications');
}

// --- Questions ---
export function getQuestions(projectId) {
  return api.get('/questions/' + projectId);
}

export function postQuestion(projectId, text) {
  return api.post('/questions/' + projectId, { text: text });
}

export function getUnansweredQuestions() {
  return api.get('/questions/mine/unanswered');
}

export function answerQuestion(questionId, answer) {
  return api.patch('/questions/' + questionId + '/answer', { answer: answer });
}

// --- Ideas ---
export function getIdeas() {
  return api.get('/ideas');
}

export function createIdea(data) {
  return api.post('/ideas', data);
}

export default api;
