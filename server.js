import { submit, leetcoderesult } from "./main.js";
import { transporter } from "./nodemailer.js";

async function sendMail(title, message, isError = false) {
  await transporter.sendMail({
    from: `"LeetCode Bot" <${process.env.SMTP_USER}>`,

    to: "someshtiwari532@gmail.com",

    subject: isError
      ? "🚨 LeetCode Bot Failed"
      : "✅ LeetCode Solution Accepted",

    html: `
      <div style="font-family:Arial,sans-serif;">

        <h2 style="color:${isError ? "red" : "green"};">
          ${title}
        </h2>


        <p>
          <b>Time:</b>
          ${new Date().toLocaleString()}
        </p>


        <p>
          <b>Details:</b>
        </p>


        <pre style="
          background:#f4f4f4;
          padding:12px;
          border-radius:6px;
        ">
${message}
        </pre>


        ${
          isError
            ? `
              <h3>Possible Causes</h3>

              <ul>
                <li>LeetCode cookie expired.</li>
                <li>CSRF token expired.</li>
                <li>LeetCode blocked request.</li>
                <li>Network issue.</li>
              </ul>

              <p>
                Update COOKIE and CSRFTOKEN secrets.
              </p>
            `
            : ""
        }


        <hr />

        <p>
          LeetCode Bot Monitoring System
        </p>

      </div>
    `,
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

    if (solvedToday) {
      console.log("Already solved today");

      return;
    }

    console.log("No submission today. Submitting...");

    const result = await leetcoderesult();

    if (!result) {
      throw new Error("No response from LeetCode submission");
    }

    if (result.status_msg !== "Accepted") {
      throw new Error(result.status_msg || "Submission rejected");
    }

    await sendMail(
      "LeetCode Solution Accepted",

      `
Status: ${result.status_msg}

Submission ID:
${result.submission_id || "N/A"}
      `,
    );

    console.log("Success email sent");
  } catch (error) {
    console.error("Cron Error:", error.message);

    try {
      await sendMail(
        "LeetCode Automation Failed",

        error.message,

        true,
      );
    } catch (mailError) {
      console.error("Email Error:", mailError.message);
    }

    process.exit(1);
  }
}

runTask();
