// API Service connecting Frontend to the Express.js Backend

const API_BASE = '/api';

/**
 * Check if the backend server is reachable and healthy
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const json = await res.json();
    return json.status === 'healthy';
  } catch (err) {
    return false;
  }
}

/**
 * Fetch complete project dataset from the backend
 */
export async function fetchProjectData() {
  try {
    const res = await fetch(`${API_BASE}/project`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend unavailable, falling back to local storage:', err.message);
    return null;
  }
}

/**
 * Synchronize full project data to the backend file store
 */
export async function syncProjectData(data) {
  try {
    const res = await fetch(`${API_BASE}/project/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    // Non-blocking warning so local state continues uninterrupted
    return null;
  }
}

/**
 * Reset project data on the backend
 */
export async function resetProjectData() {
  try {
    const res = await fetch(`${API_BASE}/project/reset`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Could not reset on backend:', err.message);
    return null;
  }
}

/**
 * Add an activity via backend REST endpoint
 */
export async function apiAddActivity(activity) {
  try {
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Delete an activity via backend REST endpoint
 */
export async function apiDeleteActivity(activityId) {
  try {
    const res = await fetch(`${API_BASE}/activities/${activityId}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Fetch all test cases from backend database
 */
export async function apiGetTestCases() {
  try {
    const res = await fetch(`${API_BASE}/testcases`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.testcases;
  } catch (err) {
    return null;
  }
}

/**
 * Add a new test case to backend database
 */
export async function apiAddTestCase(testcase) {
  try {
    const res = await fetch(`${API_BASE}/testcases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testcase)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Update an existing test case in backend database
 */
export async function apiUpdateTestCase(testCaseId, update) {
  try {
    const res = await fetch(`${API_BASE}/testcases/${testCaseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Delete a test case from backend database
 */
export async function apiDeleteTestCase(testCaseId) {
  try {
    const res = await fetch(`${API_BASE}/testcases/${testCaseId}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Reset test cases on backend database to defaults
 */
export async function apiResetTestCases() {
  try {
    const res = await fetch(`${API_BASE}/testcases/reset`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Stakeholders API Helpers
 */
export async function apiGetStakeholders() {
  try {
    const res = await fetch(`${API_BASE}/stakeholders`);
    const json = await res.json();
    return json.stakeholders || [];
  } catch (err) {
    return null;
  }
}

export async function apiAddStakeholder(stakeholder) {
  try {
    const res = await fetch(`${API_BASE}/stakeholders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stakeholder)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function apiDeleteStakeholder(id) {
  try {
    const res = await fetch(`${API_BASE}/stakeholders/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Team Members API Helpers
 */
export async function apiAddTeamMember(member) {
  try {
    const res = await fetch(`${API_BASE}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function apiDeleteTeamMember(id) {
  try {
    const res = await fetch(`${API_BASE}/team/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Requirements API Helpers
 */
export async function apiAddRequirement(req) {
  try {
    const res = await fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function apiDeleteRequirement(id) {
  try {
    const res = await fetch(`${API_BASE}/requirements/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    return null;
  }
}


