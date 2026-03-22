import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api'
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

// --- Swipes ---
export function recordSwipe(projectId, action) {
  return api.post('/swipes', { projectId: projectId, action: action });
}

// --- Matches ---
export function getIncomingMatches() {
  return api.get('/matches/incoming');
}

export function acceptMatch(matchId) {
  return api.post('/matches/' + matchId + '/accept');
}

// --- Questions ---
export function getQuestions(projectId) {
  return api.get('/questions/' + projectId);
}

export function postQuestion(projectId, text) {
  return api.post('/questions/' + projectId, { text: text });
}

export default api;
