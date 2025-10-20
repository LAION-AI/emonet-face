import { Handlers } from "$fresh/server.ts";
import { kvStorage } from "../../utils/kvStorage.ts";

interface AudioAnnotationRequest {
  projectId: string;
  audioId: string;
  email: string;
  label: string;
  value: number; // 0 = not present, 1 = weakly present, 2 = strongly present
  duration: number;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const body: AudioAnnotationRequest = await req.json();
      
      const { projectId, audioId, email, label, value, duration } = body;
      
      if (!projectId || !audioId || !email || value === undefined) {
        return new Response("Missing required fields", { status: 400 });
      }
      
      const annotationData = {
        project: projectId,
        user: email,
        file: audioId,
        annotation: {
          projectId,
          email,
          audioId,
          label,
          value,
          timestamp: new Date().toISOString(),
          time: duration,
        },
      };
      
      const result = await kvStorage.addAnnotation(annotationData);
      
      if (result === "Success") {
        return new Response(JSON.stringify({ success: true }));
      } else {
        return new Response("Failed to save annotation", { status: 500 });
      }
    } catch (error) {
      console.error("Error saving annotation:", error);
      return new Response("Server error", { status: 500 });
    }
  },

  OPTIONS(_req) {
    return new Response(null, {
      status: 204,
      headers: {
        "Allow": "POST, OPTIONS",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  },
};
