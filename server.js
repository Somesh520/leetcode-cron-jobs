import { submit, leetcoderesult } from "./main.js";

async function runTask() {
  console.log("Checking LeetCode submissions...");

  try {
    const data = await submit();

    if (!data?.data?.recentAcSubmissionList) {
      console.error("Invalid response structure:", data);
      process.exit(1);
    }

    const submissions = data.data.recentAcSubmissionList;
    const today = new Date().toISOString().split("T")[0];

    const solvedToday = submissions.some((item) => {
      const date = new Date(Number(item.timestamp) * 1000)
        .toISOString()
        .split("T")[0];
      console.log("Submission date:", date, "Today:", today);
      return date === today;
    });

    // if (solvedToday) {
    //   console.log("Already solved today");
    //   return;
    // }

    console.log("No submission today. Submitting...");
    const result = await leetcoderesult();
    console.log(result);
  } catch (error) {
    console.error("Error executing task:", error);
    process.exit(1);
  }
}

// Timeout backup: Kill process after 30 seconds if network hangs
const timeout = setTimeout(() => {
  console.error("Execution timed out after 30s");
  process.exit(1);
}, 30000);

runTask().finally(() => {
  clearTimeout(timeout);
  console.log("Execution finished.");
  process.exit(0);
});
