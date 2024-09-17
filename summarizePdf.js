require("dotenv").config();

const fs = require("fs");
const pdf = require("pdf-parse");
const { OpenAI } = require("@langchain/openai");
console.log("OpenAI API Key Loaded:", !!process.env.OPENAI_API_KEY);
const openAI = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
});

async function parsePDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    console.log("PDF file read successfully");
    const data = await pdf(dataBuffer);
    console.log("PDF parsed successfully, length of text:", data.text.length);
    return data.text;
  } catch (error) {
    console.error("error parsing pdf", error);
  }
}

async function summarizeText(text) {
  try {
    const prompt = `You are an expert in the semiconductor industry. Your task is to summarize a detailed report. Please provide a concise and informative summary focusing on the key points, including economic impact, industry challenges, and future recommendations. Limit the summary to 3-5 sentences.

    Report Content:
    ${text}

    Summary:`;
    //console.log("Prompt for OpenAI:", prompt.slice(0, 500));
    const response = await openAI.call(prompt, {
      temperature: 0.7,
      maxTokens: 150,
      stop: ["\n", "Summary:"],
    });
    console.log("OpenAI response:", response);
    return response.trim();
  } catch (error) {
    console.error(`Error during summarization`, error);
    return "An error occur in summarization";
  }
}

async function summarizePDF(filePath) {
  try {
    const pdfText = await parsePDF(filePath);
    const summary = await summarizeText(pdfText);
    console.log(`Summary:`, summary);
  } catch (error) {
    console.error(`Error in summarization`, error);
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error(`Please provide path to PDF`);
  process.exit(1);
}

summarizePDF(filePath);
