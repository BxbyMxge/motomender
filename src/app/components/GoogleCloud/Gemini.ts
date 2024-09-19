//const { GoogleGenerativeAI } = require("@google/generative-ai");
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import {getAllNodesFromUser} from "@/app/components/neo4jQueries";



export async function test(query:string, email:string) {
    //const {GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = "@google/generative-ai";

    const resultNeo4j = await getAllNodesFromUser(email);
    const jsonRecords = JSON.stringify(resultNeo4j);

    console.log(email);
    console.log("Neo4j results : ", resultNeo4j);
    console.log("JSON Records : ", jsonRecords);


    const apikey = process.env.GENERATIVE_LANGUAGE_API_KEY;
    console.log ("API KEY : ", apikey);
    const _client = process.env.GENERATIVE_LANGUAGE_CLIENT as string;
    const genAI = new GoogleGenerativeAI(_client);
    const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Your response are to be in html tags because your response will be output to a html file to be displayed to user. You will also make your output look professional and modern. Use bright text on dark colored background. use colors if required. note that your output is part of a div tag. Note that lifespan in the data is in KM, and vehicle mileage is also in KM. You may only answer based on this data : " + jsonRecords,
});

    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
    ],
  });


    //const result = await model.generateContent(query);
    const result = await chatSession.sendMessage(query);
    console.log(result.response.text());

    return result.response.text();

}
