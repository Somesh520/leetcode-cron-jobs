import cron from "node-cron";

import { submit, leetcoderesult } from "./main.js";

console.log("Cron started");

cron.schedule("* * * * *", async () => {
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
});
