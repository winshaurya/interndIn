import { supabase } from './supabase'

// ==================== NEW: Role-aware Auth Helpers ====================
export const signUpWithEmailRole = async ({ email, password, role = 'student', redirectTo } = {}) => {
  const options = { redirectTo, data: { role } }
  const { data, error } = await supabase.auth.signUp({ email, password }, { data: options.data, redirectTo: options.redirectTo })
  if (error) throw error
  return data
}

export const signInWithOAuthWithRole = async (provider, role = 'student', redirectTo) => {
  const options = { redirectTo, data: { role } }
  const { data, error } = await supabase.auth.signInWithOAuth({ provider, options })
  if (error) throw error
  return data
}

export const getMyCompanies = async () => {
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const userId = user?.id
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const postJobForCompany = async (companyId, jobData) => {
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const payload = {
    ...jobData,
    company_id: companyId,
    posted_by: user.id
  }
  const { data, error } = await supabase
    .from('jobs')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==================== AUTH HELPERS ====================
export const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user?.id
}

// ==================== USER PROFILE OPERATIONS ====================
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==================== STUDENT OPERATIONS ====================
export const getStudentProfile = async (userId) => {
  const { data, error } = await supabase
    .from('student_details')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export const updateStudentProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('student_details')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const createStudentProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('student_details')
    .insert(profileData)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==================== ALUMNI OPERATIONS ====================
export const getAlumniProfile = async (userId) => {
  const { data, error } = await supabase
    .from('alumni_details')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export const updateAlumniProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('alumni_details')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const createAlumniProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('alumni_details')
    .insert(profileData)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==================== COMPANY OPERATIONS ====================
export const getCompany = async (alumniId) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', alumniId)

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
  return data
}

export const getCompanyById = async (companyId) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error) throw error
  return data
}

export const createCompany = async (companyData) => {
  const { data, error } = await supabase
    .from('companies')
    .insert(companyData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCompany = async (companyId, updates) => {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getAllCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ==================== JOB OPERATIONS ====================
export const createJob = async (jobData) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getJobsByAlumni = async (alumniId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('posted_by', alumniId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getJobById = async (jobId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) throw error
  return data
}

export const updateJob = async (jobId, updates) => {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getJobsByCompany = async (companyId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getAllJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (
        name,
        website,
        description
      ),
      posted_by:profiles (
        id,
        full_name,
        headline
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getJobDetails = async (jobId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (
        id,
        name,
        website,
        description
      ),
      posted_by:profiles (
        id,
        full_name,
        headline
      )
    `)
    .eq('id', jobId)
    .single()

  if (error) throw error
  return data
}

// ==================== JOB APPLICATION OPERATIONS ====================
export const applyForJob = async (applicationData) => {
  const { data, error } = await supabase
    .from('job_applications')
    .insert(applicationData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getAppliedJobs = async (userId) => {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      jobs (
        title,
        description,
        created_at,
        companies (
          name,
          website
        )
      )
    `)
    .eq('student_id', userId)
    .order('applied_at', { ascending: false })

  if (error) throw error
  return data
}

export const getJobApplicants = async (jobId) => {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      student:profiles (
        id,
        email,
        full_name
      ),
      student_details (
        university_branch,
        grad_year
      )
    `)
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false })

  if (error) throw error
  return data
}

export const getApplicantCountForJob = async (jobId) => {
  const { count, error } = await supabase
    .from('job_applications')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)

  if (error) throw error
  return count
}

export const withdrawApplication = async (jobId, userId) => {
  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('job_id', jobId)
    .eq('student_id', userId)

  if (error) throw error
}

// ==================== CONNECTION OPERATIONS ====================
export const sendConnectionRequest = async (requestData) => {
  const { data, error } = await supabase
    .from('connections')
    .insert(requestData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const acceptConnectionRequest = async (connectionId) => {
  const { data, error } = await supabase
    .from('connections')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString()
    })
    .eq('id', connectionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const rejectConnectionRequest = async (connectionId) => {
  const { data, error } = await supabase
    .from('connections')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString()
    })
    .eq('id', connectionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getConnections = async (userId) => {
  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      sender:users!sender_id (
        id,
        email,
        role,
        student_profiles (name),
        alumni_profiles (name)
      ),
      receiver:users!receiver_id (
        id,
        email,
        role,
        student_profiles (name),
        alumni_profiles (name)
      )
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ==================== MESSAGE OPERATIONS ====================
export const sendMessage = async (messageData) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getMessages = async (connectionId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export const getUnreadMessagesCount = async (userId) => {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count
}

export const markMessageAsRead = async (messageId) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==================== NOTIFICATION OPERATIONS ====================
export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const markNotificationAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const createNotification = async (notificationData) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteNotification = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) throw error
}

// ==================== STORAGE OPERATIONS ====================
export const uploadFile = async (bucket, filePath, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      upsert: true
    })

  if (error) throw error
  return data
}

export const getFileUrl = async (bucket, filePath) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export const deleteFile = async (bucket, filePath) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  if (error) throw error
}

// ==================== REALTIME SUBSCRIPTIONS ====================
export const subscribeToMessages = (connectionId, callback) => {
  return supabase
    .channel(`messages:${connectionId}`)
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `connection_id=eq.${connectionId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToNotifications = (userId, callback) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToJobApplications = (jobId, callback) => {
  return supabase
    .channel(`applications:${jobId}`)
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'job_applications',
        filter: `job_id=eq.${jobId}`
      },
      callback
    )
    .subscribe()
}
