const express = require("express");
const router = express.Router();
const axios = require("axios");

const RAPIDAPI_KEY = "8f5612a5d4msh5b02e47f92d6391p122b58jsn3f0c1768b4b2";
const GLASSDOOR_API_HOST = "real-time-glassdoor-data.p.rapidapi.com";

// GET /api/insights/salary/:jobTitle/:location
// Fetch real salary data from Glassdoor
router.get("/salary/:jobTitle/:location", async (req, res) => {
  try {
    const { jobTitle, location } = req.params;
    
    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: "Job title is required"
      });
    }

    const locationParam = location || "United States";

    console.log(`Fetching salary for: ${jobTitle} in ${locationParam}`);

    const response = await axios.get(
      `https://${GLASSDOOR_API_HOST}/salary-estimation`,
      {
        params: {
          job_title: jobTitle,
          location: locationParam,
          location_type: "ANY",
          years_of_experience: "ALL",
          domain: "www.glassdoor.com"
        },
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": GLASSDOOR_API_HOST,
          "x-rapidapi-key": RAPIDAPI_KEY
        }
      }
    );

    if (response.data.status === "OK") {
      res.json({
        success: true,
        data: {
          jobTitle: response.data.data.job_title,
          location: response.data.data.location,
          salary: {
            min: Math.round(response.data.data.min_salary),
            max: Math.round(response.data.data.max_salary),
            median: Math.round(response.data.data.median_salary),
            currency: response.data.data.salary_currency,
            period: response.data.data.salary_period
          },
          baseSalary: {
            min: Math.round(response.data.data.min_base_salary),
            max: Math.round(response.data.data.max_base_salary),
            median: Math.round(response.data.data.median_base_salary)
          },
          additionalPay: {
            min: Math.round(response.data.data.min_additional_pay),
            max: Math.round(response.data.data.max_additional_pay),
            median: Math.round(response.data.data.median_additional_pay)
          },
          salaryCount: response.data.data.salary_count,
          confidence: response.data.data.confidence,
          link: response.data.data.link
        }
      });
    } else {
      res.json({
        success: false,
        message: "No salary data available"
      });
    }
  } catch (error) {
    console.error("Error fetching salary:", error.message);
    res.json({
      success: false,
      message: "No salary data available"
    });
  }
});

// GET /api/insights/company/:companyName
// Fetch company overview and reviews from Glassdoor
router.get("/company/:companyName", async (req, res) => {
  try {
    const { companyName } = req.params;
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required"
      });
    }

    console.log(`Fetching company data for: ${companyName}`);

    // Step 1: Search for company to get company ID
    const searchResponse = await axios.get(
      `https://${GLASSDOOR_API_HOST}/company-search`,
      {
        params: {
          query: companyName,
          domain: "www.glassdoor.com"
        },
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": GLASSDOOR_API_HOST,
          "x-rapidapi-key": RAPIDAPI_KEY
        }
      }
    );

    if (searchResponse.data.status !== "OK" || !searchResponse.data.data || searchResponse.data.data.length === 0) {
      return res.json({
        success: false,
        message: `No data available for "${companyName}"`
      });
    }

    const companyId = searchResponse.data.data[0].company_id;
    console.log(`Found company ID: ${companyId}`);

    // Step 2: Get company overview
    let overview = null;
    try {
      const overviewResponse = await axios.get(
        `https://${GLASSDOOR_API_HOST}/company-overview`,
        {
          params: {
            company_id: companyId,
            domain: "www.glassdoor.com"
          },
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": GLASSDOOR_API_HOST,
            "x-rapidapi-key": RAPIDAPI_KEY
          }
        }
      );
      if (overviewResponse.data.status === "OK") {
        overview = overviewResponse.data.data;
        console.log("Got company overview");
      }
    } catch (err) {
      console.log("Company overview error:", err.message);
    }

    // Step 3: Get company reviews
    let reviews = null;
    try {
      const reviewsResponse = await axios.get(
        `https://${GLASSDOOR_API_HOST}/company-reviews`,
        {
          params: {
            company_id: companyId,
            page: 1,
            sort_by: "RELEVANCE",
            domain: "www.glassdoor.com"
          },
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": GLASSDOOR_API_HOST,
            "x-rapidapi-key": RAPIDAPI_KEY
          }
        }
      );
      if (reviewsResponse.data.status === "OK") {
        reviews = reviewsResponse.data.data;
        console.log("Got company reviews");
      }
    } catch (err) {
      console.log("Company reviews error:", err.message);
    }

    // Step 4: Get company interviews
    let interviewsData = null;
    try {
      const interviewsResponse = await axios.get(
        `https://${GLASSDOOR_API_HOST}/company-interviews`,
        {
          params: {
            company_id: companyId,
            page: 1,
            domain: "www.glassdoor.com"
          },
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": GLASSDOOR_API_HOST,
            "x-rapidapi-key": RAPIDAPI_KEY
          }
        }
      );
      if (interviewsResponse.data.status === "OK") {
        interviewsData = interviewsResponse.data.data;
        console.log("Got company interviews");
      }
    } catch (err) {
      console.log("Interviews data error:", err.message);
    }

    // Check if we have any data
    if (!overview && !reviews && !interviewsData) {
      console.log("No data available for any endpoint");
      return res.json({
        success: false,
        message: `No data available for "${companyName}"`
      });
    }

    // Extract pros and cons from reviews
    const pros = [];
    const cons = [];
    
    if (reviews && reviews.reviews && Array.isArray(reviews.reviews)) {
      reviews.reviews.forEach(review => {
        if (review.pros && review.pros.trim()) {
          pros.push(review.pros.trim());
        }
        if (review.cons && review.cons.trim()) {
          cons.push(review.cons.trim());
        }
      });
    }

    // Extract interview questions
    const interviewQuestions = [];
    if (interviewsData && interviewsData.interviews && Array.isArray(interviewsData.interviews)) {
      interviewsData.interviews.forEach(interview => {
        if (interview.questions && Array.isArray(interview.questions)) {
          interview.questions.forEach(q => {
            if (q.question) {
              interviewQuestions.push(q.question);
            }
          });
        }
      });
    }

    // Calculate overall rating from available ratings if not provided
    let overallRating = overview?.overall_rating || overview?.rating || 0;
    if (overallRating === 0 && overview) {
      const ratings = [
        overview.culture_rating,
        overview.work_life_balance_rating,
        overview.compensation_rating,
        overview.career_opportunities_rating,
        overview.senior_management_rating
      ].filter(r => r && r > 0);
      
      if (ratings.length > 0) {
        overallRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
      }
    }

    const insights = {
      companyName: overview?.company_name || companyName,
      overallRating: parseFloat(overallRating) || 0,
      ratings: {
        culture: overview?.culture_rating || 0,
        workLifeBalance: overview?.work_life_balance_rating || 0,
        compensation: overview?.compensation_rating || 0,
        careerGrowth: overview?.career_opportunities_rating || 0,
        management: overview?.senior_management_rating || 0
      },
      reviewCount: overview?.review_count || reviews?.total_reviews || 0,
      pros: pros.length > 0 ? pros.slice(0, 5) : ['No pros data available'],
      cons: cons.length > 0 ? cons.slice(0, 5) : ['No cons data available'],
      recommendToFriend: overview?.recommend_to_friend_percentage || 0,
      ceoApproval: overview?.ceo_approval_percentage || 0,
      interviewDifficulty: interviewsData?.interview_difficulty || "Not available",
      interviewQuestions: interviewQuestions.length > 0 ? interviewQuestions.slice(0, 5) : ['No interview questions available'],
      interviewTips: [
        "Research the company thoroughly before the interview",
        "Prepare specific examples using the STAR method",
        "Ask thoughtful questions about the role and team"
      ],
      source: "Glassdoor (Real Data)"
    };

    console.log("Final insights being sent:", {
      companyName: insights.companyName,
      overallRating: insights.overallRating,
      reviewCount: insights.reviewCount,
      prosCount: insights.pros.length,
      consCount: insights.cons.length
    });

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error("Error fetching company data:", error.message);
    res.json({
      success: false,
      message: `No data available for the company`
    });
  }
});

module.exports = router;

// Made with Bob
