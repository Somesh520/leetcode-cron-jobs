import { submit, leetcoderesult } from "./main.js";
import { transporter } from "./nodemailer.js";

async function sendErrorMail(error) {
  await transporter.sendMail({
    from: `"LeetCode Bot" <${process.env.SMTP_USER}>`,
    to: "someshtiwari532@gmail.com",
    subject: "🚨 LeetCode Bot Failed",

    html: `
      <div style="font-family: Arial, sans-serif;">

        <h2 style="color:red;">
          LeetCode Automation Failed
        </h2>

        <p>
          Your daily LeetCode automation task failed while trying to check or submit a solution.
        </p>

        <hr />

        <h3>Error Details</h3>

        <p>
          <b>Time:</b>
          ${new Date().toLocaleString()}
        </p>

        <p>
          <b>Reason:</b>
        </p>

        <pre style="
          background:#f4f4f4;
          padding:10px;
          border-radius:5px;
        ">
${error.message}
        </pre>


        <h3>Possible Causes</h3>

        <ul>
          <li>LeetCode session cookie expired.</li>
          <li>CSRF token is invalid or expired.</li>
          <li>LeetCode blocked the automated request.</li>
          <li>Network request failed.</li>
        </ul>


        <h3>Action Required</h3>

        <p>
          Update the LeetCode cookies and CSRF token in the environment variables,
          then restart the cron job.
        </p>


        <hr />

        <p>
          LeetCode Bot Monitoring System
        </p>

      </div>
    `,
  });
}
async function sendMail(result) {
  await transporter.sendMail({
    from: `"LeetCode Bot" <${process.env.SMTP_USER}>`,
    to: "someshtiwari532@gmail.com",
    subject: "🚨 LeetCode Bot Failed",
    text:`successforlly  result here ${result} `
   
  });
}

async function runTask() {
  try {
    console.log("Checking LeetCode submissions...");

    const data = await submit();

    if (!data?.data?.recentAcSubmissionList) {
      throw new Error("Invalid LeetCode response structure");
    }

    const submissions = data.data.recentAcSubmissionList;

    const today = new Date().toISOString().split("T")[0];

    const solvedToday = submissions.some((item) => {
      const date = new Date(Number(item.timestamp) * 1000)
        .toISOString()
        .split("T")[0];

      console.log(item.title, "=>", date);

      return date === today;
    });

    // if (solvedToday) {
    //   console.log("Already solved today");

    //   return;
    // }

    console.log("No submission today. Submitting...");

    const result = await leetcoderesult();

    console.log("Submission result:", result);
    await sendMail(result.status_msg);
  } catch (error) {
    console.error("Cron Error:", error.message);

    try {
      await sendErrorMail(error);
    } catch (mailError) {
      console.error("Email Error:", mailError.message);
    }

    process.exit(1);
  }
}

runTask();
