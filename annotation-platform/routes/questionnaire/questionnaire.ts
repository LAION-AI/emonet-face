import { Handlers } from "$fresh/server.ts";
import { kvStorage } from "../../utils/kvStorage.ts";

const questionnaire = [
  {
    question: "What is your email?",
    type: "text",
    required: true,
  },
  {
    question: "How did you hear about us?",
    type: "select",
    options: ["Google", "Friend", "Other"],
    required: true,
  },
  {
    question: "What features do you find most useful?",
    type: "checkbox",
    options: ["Feature A", "Feature B", "Feature C"],
    required: false,
  },
  {
    question: "Any additional comments?",
    type: "textarea",
    required: false,
  },
];

export const handler: Handlers = {
  async GET(_req) {
    return new Response(JSON.stringify(questionnaire), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async POST(req) {
    try {
      const data = await req.json();
      // Expecting { email: string, responses: { ... } }
      if (!data.email || !data.responses) {
        return new Response("Missing email or responses", { status: 400 });
      }
      // Save under ["questionnaire", email]
      await kvStorage.addQuestionnaireResponse(data.email, data.responses);
      return new Response("Success", { status: 200 });
    } catch (e) {
      console.error(e);
      return new Response("Error", { status: 500 });
    }
  },
};
