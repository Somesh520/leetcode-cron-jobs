import { submit, leetcoderesult } from "./main.js";

async function runTask() {
  console.log("Checking LeetCode submissions...");

  try {
    const data = await submit();
    const submissions = data.data.recentAcSubmissionList;
    const today = new Date().toISOString().split("T")[0];

    const solvedToday = submissions.some((item) => {
      const date = new Date(Number(item.timestamp) * 1000)
        .toISOString()
        .split("T")[0];
      console.log("Submission date:", date, "Today:", today);
      return date === today;
    });

    if (solvedToday) {
      console.log("Already solved today");
      return;
    }

    console.log("No submission today. Submitting...");
    const result = await leetcoderesult();
    console.log(result);
  } catch (error) {
    console.error("Error executing task:", error);
    process.exit(1);
  }
}

// Execute immediately and exit cleanly
runTask().then(() => {
  console.log("Execution finished.");
  process.exit(0);
});
