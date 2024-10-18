import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    
    const data = {
      description: `
        <p>(or greatest common divisor) of two positive integers. Here's how the process works:</p>
        <ul>
          <li>Divide the larger number by the smaller number.</li>
          <li>Use the remainder to repeat the division until the remainder is zero.</li>
          <li>The divisor at this stage will be the <strong>HCF</strong> of the two numbers.</li>
        </ul>
        <p>This method is widely used because of its efficiency.</p>
        <h2><strong>2. The Fundamental Theorem of Arithmetic</strong></h2>
        <p><br></p>
        <h3><strong>What is the Fundamental Theorem of Arithmetic?</strong></h3>
        <p>The <strong>Fundamental Theorem of Arithmetic</strong> states that every <strong>composite number</strong> can be uniquely expressed as a product of prime numbers, except for the order of the factors.</p>
        <p>For example: <strong style="background-color: rgb(187, 187, 187);">60 = 2^2 x 3 x 5</strong></p>
        <p>This theorem has important applications in various mathematical problems.</p>
        <p><br></p>
        <h2><strong>Applications of the Fundamental Theorem of Arithmetic</strong></h2>
        <p><br></p>
        <h3><strong>Application 1: Proving Irrationality</strong></h3>
        <p>One key application of this theorem is in proving the <strong>irrationality</strong> of numbers such as <strong><u>√2, √3, √5.</u></strong> The prime factorization method helps in showing that these numbers cannot be expressed as a ratio of two integers, thus proving their irrational nature.</p>
        <p><br></p>
        <h3><strong>Application 2: Determining Decimal Expansions</strong></h3>
        <p>The theorem also helps in determining whether the decimal expansion of a rational number "p/q" (where q ≠ 0) is <strong>terminating</strong> or <strong>non-terminating repeating</strong>. This is determined by the prime factorization of the denominator (q).</p>
        <ul>
          <li>If (q) contains only 2's and/or 5's as prime factors, the decimal expansion will be <strong>terminating</strong>.</li>
          <li>If (q) has prime factors other than 2 or 5, the decimal expansion will be <strong>non-terminating repeating</strong>.</li>
        </ul>
        <p>For example: (1/8 = 0.125 ) (terminating, as (8 = 2^3))</p>
        <p><br></p>
        <p>These concepts are not only easy to grasp but also have powerful applications in various branches of mathematics. As you move forward, you’ll find them playing a crucial role in solving more complex mathematical problems.</p>
      `,
    };
  
  
    const prompt =`Take the following content and gave list of  relevant Wikipedia links or external links to key terms where applicable . The links should follow this schema: :[{ "title of link" (string): "url"(string)}]
  ${data.description}
`
      const result = await model.generateContent(prompt);
    const resultContent = result.response.text()


    const jsonString = resultContent.replace(/```json|```/g, '');
let questions;


  questions = JSON.parse(jsonString);

      return res.status(500).json(new ApiResponse(200, questions, "AI Tagging Failed"));
    
  });
  