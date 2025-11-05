const API_BASE_URL = 'http://localhost:5004/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async resetPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Job endpoints
  async getJobs(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/job/get-all-jobs-student?${queryParams}`);
  }

  async getJobById(id) {
    return this.request(`/job/get-job-by-id-student/${id}`);
  }

  async createJob(jobData) {
    return this.request('/job/post-job', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id, jobData) {
    return this.request(`/job/update-job/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id) {
    return this.request(`/job/delete-job/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyJobs() {
    return this.request('/job/get-my-jobs');
  }

  // Application endpoints
  async applyForJob(jobData) {
    return this.request('/job/apply-job', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async getAppliedJobs() {
    return this.request('/job/get-applied-jobs');
  }

  async withdrawApplication(jobId) {
    return this.request(`/job/withdraw-application/${jobId}`, {
      method: 'DELETE',
    });
  }

  async getJobApplicants(jobId) {
    return this.request(`/job/view-applicants/${jobId}`);
  }

  // Student endpoints
  async getStudentProfile() {
    return this.request('/student/profile');
  }

  async updateStudentProfile(profileData) {
    return this.request('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Alumni endpoints
  async getAlumniProfile() {
    return this.request('/alumni/profile');
  }

  async updateAlumniProfile(profileData) {
    return this.request('/alumni/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getAlumniJobs() {
    return this.request('/alumni/jobs');
  }

  async createCompany(companyData) {
    return this.request('/alumni/company', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async getCompanies() {
    return this.request('/alumni/companies');
  }

  // Admin endpoints
  async getUsers() {
    return this.request('/admin/users');
  }

  async getAnalytics() {
    return this.request('/admin/analytics');
  }

  async updateUserStatus(userId, status) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Utility endpoints
  async getSkills() {
    return this.request('/skills');
  }

  async getLocations() {
    return this.request('/locations');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
