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

const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_EXP_KEY = "tokenExpiresAt";
const USER_KEY = "user";

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
      capabilities = data?.features || {};
    } catch (_err) {
      capabilities = {};
    } finally {
      capabilitiesFetched = true;
    }
    return capabilities;
  }

  async request(endpoint, options = {}) {

    const config = {
      method,
      headers: {
        ...headers,
      },
      body,
      // send credentials so server-set httpOnly cookies are included
      credentials: 'include',
    };

    // Only set Content-Type for non-FormData requests
    if (!(body instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // Add auth token from Supabase session
    let token = null;
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token;
    } catch (e) {
      // ignore
    }
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

  // ================= Student endpoints =================
  async getStudentProfile() {
    const res = await this.request("/student/profile");
    // normalize profile keys to camelCase for frontend
    try {
      const profile = res?.data?.profile;
      if (profile) {
        const normalized = {
          ...profile,
          studentId: profile.student_id ?? profile.studentId,
          dateOfBirth: profile.date_of_birth ?? profile.dateOfBirth,
          gradYear: profile.grad_year ?? profile.gradYear,
          resumeUrl: profile.resume_url ?? profile.resumeUrl,
          desiredRoles: profile.desired_roles ?? profile.desiredRoles,
          preferredLocations: profile.preferred_locations ?? profile.preferredLocations,
          currentYear: profile.current_year ?? profile.currentYear,
          workMode: profile.work_mode ?? profile.workMode,
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

  async updateStudentProfile(profileData) {
    // Map frontend camelCase keys to backend snake_case expectations
    const payload = {
      ...(profileData.name ? { name: profileData.name } : {}),
      ...(profileData.email ? { email: profileData.email } : {}),
      ...(profileData.phone ? { phone: profileData.phone } : {}),
      ...(profileData.studentId ? { student_id: profileData.studentId } : {}),
      ...(profileData.branch ? { branch: profileData.branch } : {}),
      ...(profileData.currentYear ? { current_year: profileData.currentYear } : {}),
      ...(profileData.gradYear ? { grad_year: profileData.gradYear } : {}),
      ...(profileData.dateOfBirth ? { date_of_birth: profileData.dateOfBirth } : {}),
      ...(profileData.skills ? { skills: profileData.skills } : {}),
      ...(profileData.resumeUrl ? { resume_url: profileData.resumeUrl } : {}),
      ...(profileData.cgpa ? { cgpa: profileData.cgpa } : {}),
      ...(profileData.achievements ? { achievements: profileData.achievements } : {}),
      ...(profileData.experiences ? { experiences: profileData.experiences } : {}),
      ...(profileData.desiredRoles ? { desired_roles: profileData.desiredRoles } : {}),
      ...(profileData.preferredLocations ? { preferred_locations: profileData.preferredLocations } : {}),
      ...(profileData.workMode ? { work_mode: profileData.workMode } : {}),
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
          gradYear: profile.grad_year ?? profile.gradYear,
          resumeUrl: profile.resume_url ?? profile.resumeUrl,
          desiredRoles: profile.desired_roles ?? profile.desiredRoles,
          preferredLocations: profile.preferred_locations ?? profile.preferredLocations,
          currentYear: profile.current_year ?? profile.currentYear,
          workMode: profile.work_mode ?? profile.workMode,
          profilePictureUrl: profile.profile_picture_url ?? profile.profilePictureUrl,
          skills: Array.isArray(profile.skills) ? profile.skills : (profile.skills ? String(profile.skills).split(',').map(s=>s.trim()) : []),
        };
        return { ...res, data: { ...res.data, profile: normalized } };
      }
    } catch (e) {}

    return res;
  }

  // ================= Job endpoints =================
  async getJobs(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/job/get-all-jobs-student?${queryParams}`);
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
    return this.request("/job/apply-job", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
  }

  async getAppliedJobs() {
    return this.request("/job/get-applied-jobs");
  }

  async withdrawApplication(jobId) {
    return this.request(`/job/withdraw-application/${jobId}`, {
      method: "DELETE",
    });
  }

  async getJobApplicants(jobId) {
    return this.request(`/job/view-applicants/${jobId}`);
  }

  // ================= Alumni endpoints =================
  async getAlumniProfile() {
    return this.request("/alumni/profile");
  }

  async updateAlumniProfile(profileData) {
    return this.request("/alumni/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
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
      ? localStorage.getItem("token")
      : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Capability probe passthrough
  async getCapabilities() {
    const caps = await this.ensureCapabilities();
    return caps;
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
}

export const apiClient = new ApiClient();
export default apiClient;
