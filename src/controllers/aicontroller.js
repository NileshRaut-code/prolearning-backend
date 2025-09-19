import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Topic } from "../models/topicModel.js";
import { Review } from "../models/reviewModel.js";
import { LearningPlan } from "../models/learningplanModel.js";
let expire=0;
export const aigen = asyncHandler(async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.APIAI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const { standard, topic,subject,topiclinedid,qno } = req.query;

if (!standard || !topic) {
  throw new ApiError(400, "Standard and topic are required.");
}
// board
const prompt = `Create ${qno} questions related to the academic standard ${standard} ,${subject} and topic ${topic}. The questions should follow this schema: { "question": string, "score": number, "difficultyLevel": string (choose from Easy, Medium, Hard), "topicId": Objectid mongodb( ${topiclinedid}), "tags": array of strings ( like "NEET" ,"JEE" ,"Olympid" etc ,other than tag dont add any tag) }. Ensure the questions vary in difficulty and cover different aspects of the topic.Dont add any other than the question `; 

const result = await model.generateContent(prompt);
const content = result.response.text();


const jsonString = content.replace(/```json|```/g, '');
let questions;

try {
  questions = JSON.parse(jsonString);
} catch (error) {
  throw new ApiError(500, "Failed to parse AI-generated questions.");
}



    return res
      .status(200)
      .json(new ApiResponse(200, questions, "Ai Generated Results"));
  });


  export const linktagging = asyncHandler(async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.APIAI);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const topicId=req.body.topicId || req.query.id;
   // console.log(topicId);
    
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found." });
    }
    
    
    
    const data = {
      description: topic.description,
    };
  
  
    const prompt =`Take the following content and gave list of  relevant Wikipedia links or external links to key terms where applicable . The links should follow this schema: :[{ "title of link" (string): "url"(string)}]
  ${data.description}
`
      const result = await model.generateContent(prompt);
    const resultContent = result.response.text()


    const jsonString = resultContent.replace(/```json|```/g, '');
    let questions;
  questions = JSON.parse(jsonString);

  //console.log(questions);
    

  questions.map(data => {
    const title = Object.keys(data)[0];
    const link = data[title];
  
    
    const isDuplicate = topic.AIRelatedTopic.some(existingItem => existingItem.link === link);
  
  
    if (!isDuplicate) {
      topic.AIRelatedTopic.push({ title, link });
    }
  });
  await topic.save();
  return res.status(200).json(new ApiResponse(200, questions, "AI Tagging Success"));
    
  });

  export const chatbot = asyncHandler(async (req, res) => {

                                                                                                                                                                  expire++;
                                                                                                                                                                  console.log(expire);
    let data={};
    
      if (!req.body.query) {
        return res.status(400).json({ message: "Search query is required." });
      }
   
        data.results = await Topic.find(
          { $text: { $search: req.body.query } },
          { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } });
        data.resultscomment = await Review.find(
            { $text: { $search: req.body.query } },
            { score: { $meta: "textScore" } }
          ).sort({ score: { $meta: "textScore" } });
    
    
                                                                                                                                                                    if(expire>=3){
                                                                                                                                                                      return res.status(200).json(new ApiResponse(200, { resultContent:"Your token has exhausted its response quota. No further responses are available at this time." }, "AI Tagging Success"));
                                                                                                                                                                    }
    const genAI = new GoogleGenerativeAI(process.env.APIAI);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    const query = req.body.query;
    
    const prompt = `${query} the response content should in markdown`;
    const result = await model.generateContent(prompt);
    const resultContent = result.response.text()
    // const candidates = result?.result?.response?.candidates || [];
    // const content = candidates.length > 0 ? candidates[0]?.content?.parts[0]?.text : "No response generated.";

   // console.log(result);

    // Send formatted content in the response
    return res.status(200).json(new ApiResponse(200, { resultContent }, "AI search + vector search Success"));
});




// Controller to Create Learning Plan
// export const createLearningPlan = asyncHandler(async (req, res) => {
//   const genAI = new GoogleGenerativeAI(process.env.APIAI);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//   const { studentId, recommendedTopics } = req.body;

//   // Validate inputs
//   if (!studentId || !recommendedTopics || recommendedTopics.length === 0) {
//     return res.status(400).json({ message: "Student ID and recommended topics are required." });
//   }

//   // Fetch topic names for the provided topic IDs
//   const topics = await Topic.find({ _id: { $in: recommendedTopics } });

//   if (!topics || topics.length === 0) {
//     return res.status(404).json({ message: "No topics found for the provided IDs." });
//   }

//   // Prepare AI prompt and generate Q&A for each topic
//   const generatedData = await Promise.all(
//     topics.map(async (topic) => {
//       const prompt = `
//         Create 5 questions and answers for the topic: ${topic.name}.
//         Format: { "question": string, "answer": string, "difficultyLevel": string ("Easy", "Medium", "Hard"), "tags": array of strings (keywords or concepts) }.
//       `;

//       try {
//         const result = await model.generateContent(prompt);
//         const qna = JSON.parse(result.response.text());
//         return { topicId: topic._id, topicName: topic.name, aiGeneratedQnA: qna };
//       } catch (error) {
//         console.error(`AI generation failed for topic: ${topic.name}`, error);
//         return { topicId: topic._id, topicName: topic.name, aiGeneratedQnA: [] };
//       }
//     })
//   );

//   // Create the learning plan
//   const newLearningPlan = new LearningPlan({
//     student: studentId,
//     recommendedTopics: generatedData,
//   });

//   await newLearningPlan.save();

//   return res.status(201).json({ message: "Learning Plan created successfully.", learningPlan: newLearningPlan });
// });

export const generateCompleteTest = asyncHandler(async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.APIAI);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const { standard, subject, topics, questionsPerTopic, difficultyDistribution, testName, timeLimit } = req.body;

  if (!standard || !subject || !topics || !questionsPerTopic) {
    throw new ApiError(400, "Standard, subject, topics, and questionsPerTopic are required.");
  }

  const topicDetails = await Topic.find({ _id: { $in: topics } });
  
  if (topicDetails.length === 0) {
    throw new ApiError(404, "No topics found for the provided IDs.");
  }

  const totalQuestions = topics.length * questionsPerTopic;
  const distribution = difficultyDistribution || { Easy: 40, Medium: 40, Hard: 20 }; // percentage

  const prompt = `Create a comprehensive test with ${totalQuestions} questions for academic standard ${standard}, subject ${subject}.

Topics to cover: ${topicDetails.map(t => t.name).join(', ')}

Requirements:
- ${questionsPerTopic} questions per topic
- Difficulty distribution: ${distribution.Easy}% Easy, ${distribution.Medium}% Medium, ${distribution.Hard}% Hard
- Include multiple choice questions with 4 options each
- Each question should have exactly one correct answer
- Questions should test different cognitive levels (knowledge, comprehension, application, analysis)

Return the response in this exact JSON schema:
{
  "testName": "${testName || 'Generated Test'}",
  "timeLimit": ${timeLimit || 60},
  "totalQuestions": ${totalQuestions},
  "questions": [
    {
      "questionText": "string",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "option1",
      "difficultyLevel": "Easy|Medium|Hard",
      "topicId": "topicId from provided list",
      "score": number,
      "explanation": "brief explanation of correct answer",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Ensure questions are varied, academically sound, and appropriate for the standard level.`;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    const jsonString = content.replace(/```json|```/g, '');
    let testData;
    
    try {
      testData = JSON.parse(jsonString);
    } catch (error) {
      throw new ApiError(500, "Failed to parse AI-generated test data.");
    }

    // Validate and enhance the generated data
    if (!testData.questions || !Array.isArray(testData.questions)) {
      throw new ApiError(500, "Invalid test structure generated.");
    }

    // Ensure each question has a valid topicId
    testData.questions = testData.questions.map((question, index) => {
      const topicIndex = Math.floor(index / questionsPerTopic);
      const topicId = topics[topicIndex] || topics[0];
      
      return {
        ...question,
        topicId,
        score: question.score || (question.difficultyLevel === 'Hard' ? 3 : question.difficultyLevel === 'Medium' ? 2 : 1)
      };
    });

    return res
      .status(200)
      .json(new ApiResponse(200, testData, "Complete test generated successfully"));

  } catch (error) {
    console.error("AI test generation error:", error);
    throw new ApiError(500, "Failed to generate test. Please try again.");
  }
});
