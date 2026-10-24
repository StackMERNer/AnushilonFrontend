// import "server-only";
// import { connectToDatabase } from "@/lib/db";
// import { QuestionPaper } from "@/models/question-paper.model";

// export async function getMyPapers() {
//   await connectToDatabase();

//   const papers = await QuestionPaper.find({})
//     .populate("class", "name")
//     .populate("subjects", "name")
//     .populate("chapters", "name")
//     .sort({ updatedAt: -1 })
//     .lean();

//   return JSON.parse(JSON.stringify(papers));
// }
