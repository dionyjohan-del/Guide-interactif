// api/coach.js

// This is a serverless function, designed to run on platforms like Vercel or Netlify.
// It acts as a secure intermediary between your web app and the Gemini API.

// We use 'node-fetch' for making HTTP requests in a Node.js environment.
import fetch from 'node-fetch';

// The main handler for the serverless function.
export default async function handler(request, response) {
    // 1. SECURITY CHECK: Only allow POST requests.
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 2. RETRIEVE USER INPUT: Get the prompt and type from the request body.
        const { prompt, type } = request.body;

        if (!prompt || !type) {
            return response.status(400).json({ error: 'Missing prompt or type in request body' });
        }

        // 3. SECURELY GET API KEY: Retrieve the Gemini API key from environment variables.
        // This key is NEVER exposed to the client-side code.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // This is a server-side error, as the key should be configured during deployment.
            console.error('GEMINI_API_KEY is not set in environment variables.');
            return response.status(500).json({ error: 'Server configuration error: API key not found.' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        // 4. CHOOSE SYSTEM INSTRUCTION: Select the correct persona for the AI based on the request type.
        let systemInstructionText = "";
        if (type === 'scenario') {
            systemInstructionText = "Tu es un coach en interactions sociales nommé 'Alex', sage, empathique et bienveillant, inspiré par la 'Philosophie de l'Interaction pour l'Homme Moderne'. Tes conseils sont toujours constructifs, positifs et basés sur les principes d'intelligence émotionnelle, d'authenticité et de respect. Analyse le scénario de l'utilisateur et fournis des conseils clairs et encourageants. Structure ta réponse en Markdown avec des titres, des listes à puces ou numérotées pour une lisibilité maximale.";
        } else if (type === 'message') {
            systemInstructionText = "Tu es un expert en communication nommé 'Alex'. Ton rôle est d'aider les utilisateurs à raffiner leurs messages pour qu'ils soient plus clairs, respectueux et efficaces. Pour chaque message soumis, propose 2 ou 3 alternatives en expliquant brièvement la nuance et l'avantage de chaque suggestion (par exemple, 'plus direct et confiant', 'plus doux et empathique', 'avec une touche d'humour'). Structure ta réponse en Markdown.";
        } else {
            return response.status(400).json({ error: 'Invalid type specified' });
        }

        // 5. CONSTRUCT THE PAYLOAD for the Gemini API call.
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
                parts: [{ text: systemInstructionText }]
            },
        };

        // 6. CALL THE GEMINI API from the server.
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            console.error('Error from Gemini API:', errorBody);
            throw new Error(`Gemini API responded with status: ${geminiResponse.status}`);
        }

        const result = await geminiResponse.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            // 7. SEND THE RESPONSE BACK TO THE USER'S BROWSER
            return response.status(200).json({ text: candidate.content.parts[0].text });
        } else {
            console.error('Unexpected response format from Gemini:', result);
            throw new Error('Unexpected response format from the AI model.');
        }

    } catch (error) {
        console.error('An error occurred in the serverless function:', error);
        return response.status(500).json({ error: 'An internal server error occurred.' });
    }
}

