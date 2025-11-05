
const cannedResponses: { [key: string]: string } = {
    "default": "Based on the available data, here's what I found:\n- **Top Performing Batch:** 'Physics Olympiad' with an average attendance of 98%.\n- **Highest Enrollment:** 'Grade 10 - Maths' has the most students (12).\n- **Financial Note:** Income has consistently exceeded expenses over the past 3 months, showing positive growth.",
    "batch": "The batch with the most students is 'Grade 10 - Maths', which currently has 12 students enrolled. The 'Physics Olympiad' batch is the smallest with 8 students.",
    "financial": "Looking at last month's performance:\n- **Total Income:** ৳15,500\n- **Total Expenses:** ৳8,200 (Salaries: ৳7,000, Other: ৳1,200)\n- **Net Profit:** ৳7,300\nThis indicates a healthy financial status for the period.",
    "teacher": "The teacher with the most assigned students is Mr. Alan Turing, who teaches the 'Grade 10 - Maths' and 'Advanced Algorithms' batches, totaling 22 students.",
    "attendance": "The overall attendance for the last 30 days is 92%. The 'Physics Olympiad' batch has the highest average attendance at 98%, while the 'Grade 10 - English' has the lowest at 88%."
};

const keywords: { [key: string]: string[] } = {
    "batch": ["batch", "students", "enrollment", "class"],
    "financial": ["financial", "income", "expenses", "profit", "money", "payment"],
    "teacher": ["teacher", "instructor", "staff"],
    "attendance": ["attendance", "present", "absent"]
};

/**
 * Simulates a call to the Gemini API for dashboard insights.
 * @param {string} prompt The user's query.
 * @returns {Promise<string>} A simulated AI response.
 */
export const getDashboardInsights = (prompt: string): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const lowerCasePrompt = prompt.toLowerCase();
            let responseKey = "default";

            for (const key in keywords) {
                if (keywords[key].some(keyword => lowerCasePrompt.includes(keyword))) {
                    responseKey = key;
                    break;
                }
            }
            
            resolve(cannedResponses[responseKey]);
        }, 1500); // Simulate network latency
    });
};
