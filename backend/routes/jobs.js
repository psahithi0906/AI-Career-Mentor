const express = require('express');
const router = express.Router();

// Middleware to verify token (reuse from auth.js if needed)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  // Add your token verification logic here if needed
  next();
};

/**
 * POST /api/jobs/search
 * Search for jobs using JSearch API (RapidAPI)
 */
router.post('/search', verifyToken, async (req, res) => {
  try {
    const { company, role, location } = req.body;

    if (!role) {
      return res.status(400).json({
        message: 'Role is required'
      });
    }

    // Build the search query
    let query = `${role} jobs`;
    
    // Add company filter if provided
    if (company && company.trim()) {
      query += ` at ${company}`;
    }
    
    // Add location filter if provided
    if (location && location.trim()) {
      query += ` in ${location}`;
    }

    const apiUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=3&date_posted=all`;

    console.log('Fetching jobs from JSearch API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'x-rapidapi-key': '8f5612a5d4msh5b02e47f92d6391p122b58jsn3f0c1768b4b2'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error('API returned non-OK status');
    }

    // Transform and filter the API response
    let jobs = data.data?.map((job, index) => ({
      id: job.job_id || `JOB-${index + 1}`,
      title: job.job_title || 'No title',
      company: job.employer_name || 'Unknown Company',
      location: job.job_city && job.job_state
        ? `${job.job_city}, ${job.job_state}`
        : job.job_location || 'Not specified',
      description: job.job_description
        ? job.job_description.substring(0, 300) + '...'
        : 'No description available',
      salary: job.job_salary_string || job.job_min_salary
        ? `$${job.job_min_salary?.toLocaleString()} - $${job.job_max_salary?.toLocaleString()}`
        : 'Not disclosed',
      posted: job.job_posted_at || 'Recently',
      matchScore: Math.floor(Math.random() * 20) + 70,
      requirements: job.job_highlights?.Qualifications || [],
      applyUrl: job.job_apply_link || '#'
    })) || [];

    // Apply additional filtering if company is specified
    if (company && company.trim()) {
      jobs = jobs.filter(job =>
        job.company.toLowerCase().includes(company.toLowerCase())
      );
    }

    // Apply additional filtering if location is specified
    if (location && location.trim()) {
      jobs = jobs.filter(job =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    res.json({
      success: true,
      jobs: jobs,
      total: jobs.length,
      query: {
        company,
        role,
        location
      }
    });

  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ 
      message: 'Error searching for jobs',
      error: error.message 
    });
  }
});

module.exports = router;


