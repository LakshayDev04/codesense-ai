


const { analyzeCode } = require('../services/codeAnalyzer');

function analyzeReview(req, res) {
  console.log("DEBUG: analyzeReview was called");

  const { code } = req.body || {};

  if (typeof code !== "string" || !code.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Please provide JavaScript code to analyze."
    });
  }

  try {
    const issues = analyzeCode(code);

    console.log(JSON.stringify(issues, null, 2));

    return res.json({
      status: "success",
      message: "Code analysis completed.",
      issueCount: issues.length,
      issues
    });

  } catch (error) {
    console.error("Code analysis failed:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to analyze the submitted code."
    });
  }
}

module.exports = { analyzeReview };


