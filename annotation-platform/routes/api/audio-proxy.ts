import { Handlers } from "$fresh/server.ts";

// The base URL of the actual audio files
const AUDIO_SERVER = "YOUR_AUDIO_SERVER_URL_HERE"; // Replace with your actual audio server URL

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    
    if (!path) {
      return new Response("Missing path parameter", { status: 400 });
    }
    
    try {
      // Fetch the audio file from the original server
      const finalUrl = `${AUDIO_SERVER}${path}`;
      console.log("Fetching audio from:", finalUrl);
      const audioResponse = await fetch(finalUrl);
      
      if (!audioResponse.ok) {
        return new Response(`Failed to fetch audio: ${audioResponse.statusText}`, { 
          status: audioResponse.status 
        });
      }
      
      // Get the audio content
      const audioData = await audioResponse.arrayBuffer();
      
      // Get the content type from the original response
      const contentType = audioResponse.headers.get("content-type") || "audio/mpeg";
      
      // Return the audio with appropriate headers
      return new Response(audioData, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600"
        }
      });
    } catch (error) {
      console.error("Error proxying audio:", error);
      return new Response(`Error fetching audio: ${error.message}`, { status: 500 });
    }
  }
};
