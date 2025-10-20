import { Handlers } from "$fresh/server.ts";
import { db } from "../../utils/kvStorage.ts";

export const handler: Handlers = {
  async POST(req) {
    const { projectId, email, imageId, value, duration } = await req.json();

    try {
      // Use compare| prefix for the key
      const key = [`compare|${projectId}`, email, imageId];
      console.log("Key", key);
      console.log("Value", value);
      await db.set(key, { value, duration });

      // Return a proper JSON response instead of plain text
      return new Response(JSON.stringify({ success: true, message: "Annotation saved" }), { 
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (e) {
      console.error(e);
      // Also return error as JSON
      return new Response(JSON.stringify({ success: false, error: "Server error" }), { 
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  },
};
