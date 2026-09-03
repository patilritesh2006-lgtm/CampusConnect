/**
 * AI Event Creator Service: Generates draft event blueprints for faculty/organizers.
 */
const generateEventDraft = async (promptText) => {
  if (!promptText || promptText.trim().length === 0) {
    throw new Error("Prompt text is required for AI event drafting.");
  }

  const text = promptText.toLowerCase();

  let category = "Workshop";
  if (text.includes("hackathon") || text.includes("coding")) category = "Hackathon";
  else if (text.includes("seminar") || text.includes("talk") || text.includes("guest")) category = "Seminar";
  else if (text.includes("bootcamp") || text.includes("training")) category = "Bootcamp";
  else if (text.includes("cultural") || text.includes("fest")) category = "Cultural";

  // Derive title
  let title = promptText.trim();
  if (title.length > 60) {
    title = title.substring(0, 57) + "...";
  }
  // Capitalize title
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Extract skills
  const skills = [];
  if (text.includes("python")) skills.push("Python", "Data Structures");
  if (text.includes("react") || text.includes("web") || text.includes("frontend")) skills.push("React", "JavaScript", "Web Development");
  if (text.includes("ai") || text.includes("machine learning") || text.includes("ml")) skills.push("Machine Learning", "Artificial Intelligence", "Python");
  if (text.includes("cloud") || text.includes("aws") || text.includes("devops")) skills.push("Cloud Computing", "DevOps", "Docker");
  if (skills.length === 0) skills.push("Leadership", "Problem Solving", "Technical Communication");

  const prerequisites = text.includes("beginner") || text.includes("first year")
    ? ["Basic computer literacy", "Interest in technology"]
    : ["Fundamental programming concepts", "Laptop with development environment installed"];

  const learningOutcomes = [
    `Hands-on practical implementation of core ${skills[0] || "industry"} methodologies.`,
    "Collaborative problem solving and real-world project development.",
    `Earning verifiable digital credential and +50 XP on your Campus Passport upon attendance.`,
  ];

  const agenda = [
    { time: "00:00 - 00:20", topic: "Welcome, Keynote & Industry Context" },
    { time: "00:20 - 01:10", topic: "Hands-on Guided Technical Session & Live Code" },
    { time: "01:10 - 01:45", topic: "Group Challenge & Mini-Project Implementation" },
    { time: "01:45 - 02:00", topic: "Q&A, Rotating QR Verification & Certificate Issuance" },
  ];

  return {
    draft: {
      title,
      description: `Join us for an intensive hands-on session focusing on ${skills.join(", ")}. Designed to empower students with verified practical skills, collaborative workflows, and industry-grade competencies.`,
      category,
      venue: "Tech Auditorium / Computer Lab A",
      capacity: text.includes("hackathon") ? 150 : 80,
      durationHours: 2,
      targetAudience: text.includes("second") ? "2nd Year Engineering & IT Students" : "All Undergraduate & Graduate Students",
      prerequisites,
      learningOutcomes,
      agenda,
      suggestedSkills: skills,
    },
  };
};

module.exports = {
  generateEventDraft,
};