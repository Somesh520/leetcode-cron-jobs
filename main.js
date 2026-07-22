import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const headers = {
  "Content-Type": "application/json",
  Referer: "https://leetcode.com/problems/two-sum/",
  "x-csrftoken": process.env.CSRTOKEN,
  "Cookie": process.env.COOKIE,
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export const leetcode = async () => {
  try {
    const url = "https://leetcode.com/problems/two-sum/submit/";

    const body = {
      lang: "cpp",
      question_id: "1",
      typed_code: `
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {

        for(int i = 0; i < nums.size(); i++) {

            for(int j = i + 1; j < nums.size(); j++) {

                if(nums[i] + nums[j] == target) {
                    return {i,j};
                }

            }

        }

        return {};
    }
};
`,
    };

    const response = await axios.post(url, body, {
      headers,
    });

    console.log("Submission created:", response.data.submission_id);

    return response.data;
  } catch (error) {
    console.log("Submission error:", error.response?.data || error.message);

    return null;
  }
};

export const leetcoderesult = async () => {
  try {
    const submission = await leetcode();

    if (!submission) {
      console.log("Submission failed");

      return null;
    }

    const id = submission.submission_id;

    const url = `https://leetcode.com/submissions/detail/${id}/v2/check/`;

    let attempts = 0;

    while (attempts < 15) {
      const response = await axios.get(url, {
        headers,
      });

      const data = response.data;

      console.log("Current state:", data.state);

      if (data.state === "SUCCESS") {
        return data;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      attempts++;
    }

    return {
      message: "Timeout",
    };
  } catch (error) {
    console.log(error.response?.data || error.message);

    return null;
  }
};

export const submit = async () => {
  try {
    const url = "https://leetcode.com/graphql/";

    const body = {
      operationName: "recentAcSubmissions",

      query: `
      query recentAcSubmissions(
        $username:String!,
        $limit:Int!
      ){
        recentAcSubmissionList(
          username:$username,
          limit:$limit
        ){
          id
          title
          titleSlug
          timestamp
        }
      }
      `,

      variables: {
        username: "1K5I3tlCbw",
        limit: 4,
      },
    };

    const response = await axios.post(url, body, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.log("GraphQL error:", error.response?.data || error.message);

    return null;
  }
};


