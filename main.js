import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const headers = {
  "Content-Type": "application/json",
  Referer: "https://leetcode.com/problems/two-sum/",
  "x-csrftoken": process.env.CSRFTOKEN || process.env.CSRTOKEN,
  Cookie: process.env.COOKIE,
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

    if (!response.data?.submission_id) {
      throw new Error("LeetCode did not return submission id");
    }

    console.log("Submission created:", response.data.submission_id);

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("LeetCode authentication failed. Cookie expired.");
    }

    if (error.response?.status === 403) {
      throw new Error(
        "LeetCode access forbidden. Cookie or CSRF token invalid.",
      );
    }

    throw new Error(
      `LeetCode submission failed: ${
        error.response?.data?.message || error.message
      }`,
    );
  }
};

export const leetcoderesult = async () => {
  try {
    const submission = await leetcode();

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

      if (data.state === "FAILURE") {
        throw new Error("LeetCode submission rejected");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      attempts++;
    }

    throw new Error("LeetCode submission result timeout");
  } catch (error) {
    throw error;
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

    if (!response.data?.data?.recentAcSubmissionList) {
      throw new Error("Invalid LeetCode submissions response");
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error(
        "LeetCode authentication failed while checking submissions. Cookie expired.",
      );
    }

    if (error.response?.status === 403) {
      throw new Error(
        "LeetCode blocked request. Cookie or CSRF token invalid.",
      );
    }

    throw new Error(
      `LeetCode check failed: ${
        error.response?.data?.message || error.message
      }`,
    );
  }
};
