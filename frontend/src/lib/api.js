/**
 * Central API client for interndIn frontend.
 * Adds:
 *  - Production base URL auto-detection (Vercel)
 *  - Retry with exponential backoff
 *  - Request timeout (AbortController)
 *  - Capability probing (/auth/capabilities)
 *  - Graceful fallbacks (skills / locations static stub)
 *  - Unified signup already supported (POST /auth/signup)
 */

const PROD_FRONTEND_HOST = "interndin.vercel.app";
const PROD_BACKEND_BASE = "https://interndin-b.vercel.app/api";

const ENV_BASE = import.meta.env.VITE_BACKEND_URL; // should include /api
let derivedBase = ENV_BASE || "http://localhost:5004/api";

// Auto-select production backend if deployed on Vercel and env not set
if (
  typeof window !== "undefined" &&
  window.location.hostname === PROD_FRONTEND_HOST &&
  !ENV_BASE
) {
  derivedBase = PROD_BACKEND_BASE;
}

const API_BASE_URL = derivedBase;

// Capability cache
let capabilities = null;
let capabilitiesFetched = false;

const STATIC_LOCATIONS = [
  "Remote",
  "Indore",
  "Bhopal",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Pune",
];

// Utility wait
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultTimeoutMs = 12000;
    this.maxRetries = 2;
  }

  async ensureCapabilities() {
    if (capabilitiesFetched) return capabilities;
    try {
      const data = await this.request("/auth/capabilities", {
        method: "GET",
        skipRetry: true,
      });
      capabilities = data || {};
    } catch (_err) {
      capabilities = {};
    } finally {
      capabilitiesFetched = true;
    }
    return capabilities;
  }

  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      headers = {},
      body,
      skipRetry = false,
      timeoutMs = this.defaultTimeoutMs,
      retries = this.maxRetries
    } = options;

    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method,
      headers: {
        ...headers,
      },
      body,
      credentials: 'include',
    };

    // Only set Content-Type for non-FormData requests
    if (!(body instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // Add JWT token from localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let attempt = 0;
    let lastError;
    while (attempt <= (skipRetry ? 0 : retries)) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        // Attempt to parse JSON; handle empty body
        let data;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          const message =
            (data && (data.message || data.error)) ||
            `HTTP ${response.status}`;
          // Non-retriable statuses
          if ([400, 401, 403, 404].includes(response.status) || attempt === retries) {
            throw new Error(message);
          } else {
            throw new Error(message);
          }
        }

        return data;
      } catch (err) {
        clearTimeout(timeout);
        lastError = err;

        // AbortError or network errors get retry unless skipRetry
        const isAbort = err.name === "AbortError";
        if (
          skipRetry ||
          attempt === retries ||
          (err.message && /Invalid password|Unauthorized|Unauthenticated/i.test(err.message)) ||
          isAbort
        ) {
          break;
        }
        // backoff
        await sleep(400 * Math.pow(2, attempt));
      }
      attempt++;
    }

    console.error("API request failed:", lastError);
    throw lastError;
  }

  // ================= Auth endpoints =================
  async createProfile(userData) {
    return this.request("/auth/create-profile", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async requestPasswordReset(email) {
    return this.request("/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // ================= Student endpoints =================
  async getStudentProfile() {
    const res = await this.request("/student/profile");
    // normalize profile keys to camelCase for frontend
    try {
      const profile = res?.profile;
      if (profile) {
        const normalized = {
          ...profile,
          studentId: profile.student_id ?? profile.studentId,
          dateOfBirth: profile.date_of_birth ?? profile.dateOfBirth,
          universityBranch: profile.university_branch ?? profile.universityBranch,
          gradYear: profile.grad_year ?? profile.gradYear,
          cgpa: profile.cgpa ?? profile.cgpa,
          resumeUrl: profile.resume_url ?? profile.resumeUrl,
          skills: Array.isArray(profile.skills) ? profile.skills : (profile.skills ? String(profile.skills).split(',').map(s=>s.trim()) : []),
        };
        return { ...res, data: { profile: normalized } };
      }
    } catch (e) {
      // ignore normalization errors
    }
    return res;
  }

  async getStudentDashboard() {
    return this.request("/student/dashboard");
  }

  async updateStudentProfile(profileData) {
    // Map frontend camelCase keys to backend snake_case expectations
    const payload = {
      ...(profileData.name ? { full_name: profileData.name } : {}),
      ...(profileData.email ? { email: profileData.email } : {}),
      ...(profileData.phone ? { phone: profileData.phone } : {}),
      ...(profileData.rollNo ? { roll_no: profileData.rollNo } : {}),
      ...(profileData.dateOfBirth ? { date_of_birth: profileData.dateOfBirth } : {}),
      ...(profileData.address ? { address: profileData.address } : {}),
      ...(profileData.universityBranch ? { university_branch: profileData.universityBranch } : {}),
      ...(profileData.gradYear ? { grad_year: profileData.gradYear } : {}),
      ...(profileData.cgpa ? { cgpa: profileData.cgpa } : {}),
      ...(profileData.resumeUrl ? { resume_url: profileData.resumeUrl } : {}),
      ...(profileData.skills ? { skills: profileData.skills } : {}),
      ...(profileData.experiences ? { experiences: profileData.experiences } : {}),
      ...(profileData.academics ? { academics: profileData.academics } : {}),
      ...(profileData.preferences ? { preferences: profileData.preferences } : {}),
      ...(profileData.consent ? { consent: profileData.consent } : {}),
    };

    const res = await this.request("/student/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    // normalize and return similar to getStudentProfile
    try {
      const profile = res?.data?.profile;
      if (profile) {
        const normalized = {
          ...profile,
          studentId: profile.student_id ?? profile.studentId,
          dateOfBirth: profile.date_of_birth ?? profile.dateOfBirth,
          universityBranch: profile.university_branch ?? profile.universityBranch,
          gradYear: profile.grad_year ?? profile.gradYear,
          cgpa: profile.cgpa ?? profile.cgpa,
          resumeUrl: profile.resume_url ?? profile.resumeUrl,
          skills: Array.isArray(profile.skills) ? profile.skills : (profile.skills ? String(profile.skills).split(',').map(s=>s.trim()) : []),
        };
        return { ...res, data: { ...res.data, profile: normalized } };
      }
    } catch (e) {}

    return res;
  }

  // ================= Job endpoints =================
  async getJobs(filters = {}) {
    // Build query parameters from filters
    const queryParams = new URLSearchParams();

    // Handle search query
    if (filters.search) {
      queryParams.append('search', filters.search);
    }

    // Handle sort
    if (filters.sort) {
      queryParams.append('sort', filters.sort);
    }

    // Handle array filters (employment_type, location, skills)
    ['employment_type', 'location', 'skills'].forEach(filterKey => {
      if (filters[filterKey] && Array.isArray(filters[filterKey]) && filters[filterKey].length > 0) {
        filters[filterKey].forEach(value => {
          queryParams.append(filterKey, value);
        });
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/job/get-all-jobs-student?${queryString}` : '/job/get-all-jobs-student';

    return this.request(endpoint);
  }

  async getJobById(id) {
    return this.request(`/job/get-job-by-id-student/${id}`);
  }

  async createJob(jobData) {
    return this.request("/job/post-job", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id, jobData) {
    return this.request(`/job/update-job/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id) {
    return this.request(`/job/delete-job/${id}`, {
      method: "DELETE",
    });
  }

  async getMyJobs() {
    return this.request("/job/get-my-jobs");
  }

  // ================= Application endpoints =================
  async applyForJob(jobData) {
    return this.request("/job-application/job/apply-job", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
  }

  async getAppliedJobs() {
    return this.request("/job-application/job/get-applied-jobs");
  }

  async withdrawApplication(jobId) {
    return this.request(`/job-application/job/withdraw-application/${jobId}`, {
      method: "DELETE",
    });
  }

  async getJobApplicants(jobId) {
    return this.request(`/job/view-applicants/${jobId}`);
  }

  async getCurrentUser() {
    return this.request("/auth/profile");
  }
  async getAlumniProfile() {
    const res = await this.request("/alumni/profile");
    // normalize profile keys to camelCase for frontend
    try {
      const profile = res?.data?.profile;
      if (profile) {
        const normalized = {
          ...profile,
          currentTitle: profile.current_title ?? profile.currentTitle,
          companyName: profile.company_name ?? profile.companyName,
          gradYear: profile.grad_year ?? profile.gradYear,
          linkedinUrl: profile.linkedin_url ?? profile.linkedinUrl,
          githubUrl: profile.github_url ?? profile.githubUrl,
          portfolioUrl: profile.portfolio_url ?? profile.portfolioUrl,
          companyWebsite: profile.company_website ?? profile.companyWebsite,
          dateOfBirth: profile.date_of_birth ?? profile.dateOfBirth,
          experienceYears: profile.experience_years ?? profile.experienceYears,
          profilePictureUrl: profile.profile_picture_url ?? profile.profilePictureUrl,
          skills: Array.isArray(profile.skills) ? profile.skills : (profile.skills ? String(profile.skills).split(',').map(s=>s.trim()) : []),
        };
        return { ...res, data: { ...res.data, profile: normalized } };
      }
    } catch (e) {
      // ignore normalization errors
    }
    return res;
  }

  async updateAlumniProfile(profileData) {
    // Map frontend camelCase keys to backend snake_case expectations
    const payload = {
      ...(profileData.name ? { name: profileData.name } : {}),
      ...(profileData.phone ? { phone: profileData.phone } : {}),
      ...(profileData.currentTitle ? { current_title: profileData.currentTitle } : {}),
      ...(profileData.companyName ? { company_name: profileData.companyName } : {}),
      ...(profileData.gradYear ? { grad_year: profileData.gradYear } : {}),
      ...(profileData.bio ? { bio: profileData.bio } : {}),
      ...(profileData.skills ? { skills: profileData.skills } : {}),
      ...(profileData.experienceYears ? { experience_years: profileData.experienceYears } : {}),
      ...(profileData.linkedinUrl ? { linkedin_url: profileData.linkedinUrl } : {}),
      ...(profileData.githubUrl ? { github_url: profileData.githubUrl } : {}),
      ...(profileData.portfolioUrl ? { portfolio_url: profileData.portfolioUrl } : {}),
      ...(profileData.companyWebsite ? { company_website: profileData.companyWebsite } : {}),
      ...(profileData.dateOfBirth ? { date_of_birth: profileData.dateOfBirth } : {}),
      ...(profileData.address ? { address: profileData.address } : {}),
    };

    const res = await this.request("/alumni/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    // normalize and return similar to getAlumniProfile
    try {
      const profile = res?.data?.profile;
      if (profile) {
        const normalized = {
          ...profile,
          currentTitle: profile.current_title ?? profile.currentTitle,
          companyName: profile.company_name ?? profile.companyName,
          gradYear: profile.grad_year ?? profile.gradYear,
          linkedinUrl: profile.linkedin_url ?? profile.linkedinUrl,
          githubUrl: profile.github_url ?? profile.githubUrl,
          portfolioUrl: profile.portfolio_url ?? profile.portfolioUrl,
          companyWebsite: profile.company_website ?? profile.companyWebsite,
          dateOfBirth: profile.date_of_birth ?? profile.dateOfBirth,
          experienceYears: profile.experience_years ?? profile.experienceYears,
          profilePictureUrl: profile.profile_picture_url ?? profile.profilePictureUrl,
          skills: Array.isArray(profile.skills) ? profile.skills : (profile.skills ? String(profile.skills).split(',').map(s=>s.trim()) : []),
        };
        return { ...res, data: { ...res.data, profile: normalized } };
      }
    } catch (e) {}

    return res;
  }

  async getAlumniJobs() {
    return this.request("/alumni/jobs");
  }

  async createCompany(companyData) {
    return this.request("/alumni/company", {
      method: "POST",
      body: JSON.stringify(companyData),
    });
  }

  async getCompanies() {
    return this.request("/alumni/companies");
  }

  // ================= Admin endpoints =================
  async getUsers() {
    return this.request("/admin/users");
  }

  async getAnalytics() {
    // alias added: /admin/analytics maps to dashboard stats
    return this.request("/admin/analytics");
  }

  async updateUserStatus(userId, status) {
    return this.request(`/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // ================= File Upload endpoints =================
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    return this.request("/upload/resume", {
      method: "POST",
      body: formData,
      headers: {
        // Let browser set Content-Type with boundary for FormData
        ...this.getAuthHeaders(),
      },
    });
  }

  async uploadCompanyDocument(file, companyId) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('companyId', companyId);

    return this.request("/upload/company-document", {
      method: "POST",
      body: formData,
      headers: {
        // Let browser set Content-Type with boundary for FormData
        ...this.getAuthHeaders(),
      },
    });
  }

  async uploadJobApplication(file, jobId) {
    const formData = new FormData();
    formData.append('application', file);
    formData.append('jobId', jobId);

    return this.request(`/upload/job-application/${jobId}`, {
      method: "POST",
      body: formData,
      headers: {
        // Let browser set Content-Type with boundary for FormData
        ...this.getAuthHeaders(),
      },
    });
  }

  // Helper method for auth headers (without Content-Type for FormData)
  getAuthHeaders() {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Capability probe passthrough
  async getCapabilities() {
    const caps = await this.ensureCapabilities();
    return caps;
  }

  async getBranches() {
    const caps = await this.ensureCapabilities();
    return caps.data?.branches || [];
  }

  async getFeatures() {
    const caps = await this.ensureCapabilities();
    return caps.data?.features || [];
  }

  async getGoogleOAuthUrl(redirectTo) {
    const params = new URLSearchParams();
    if (redirectTo) {
      params.set("redirectTo", redirectTo);
    }
    const query = params.toString();
    return this.request(`/auth/oauth/google${query ? `?${query}` : ""}`, {
      method: "GET",
      skipAuthRefresh: true,
    });
  }

  // Messaging methods
  async getConnections() {
    return this.request("/connections");
  }

  async getConversation(connectionId) {
    return this.request(`/messages/${connectionId}`);
  }

  async sendMessage(receiverId, content) {
    return this.request("/messages", {
      method: "POST",
      body: JSON.stringify({ receiver_id: receiverId, content }),
    });
  }

  async getUnreadMessages() {
    return this.request("/messages/unread");
  }

  async markMessageRead(messageId) {
    return this.request(`/messages/${messageId}/read`, {
      method: "PUT",
    });
  }

  // Profile viewing methods
  async getStudentPublicProfile(userId) {
    return this.request(`/student/profile/${userId}`);
  }

  async getAlumniPublicProfile(userId) {
    return this.request(`/alumni/profile/${userId}`);
  }

  // Connection methods
  async sendConnectionRequest(receiverId) {
    return this.request("/connections/request", {
      method: "POST",
      body: JSON.stringify({ receiver_id: receiverId }),
    });
  }

  async acceptConnectionRequest(connectionId) {
    return this.request(`/connections/${connectionId}/accept`, {
      method: "PUT",
    });
  }

  async rejectConnectionRequest(connectionId) {
    return this.request(`/connections/${connectionId}/reject`, {
      method: "PUT",
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
