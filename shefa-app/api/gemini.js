// קובץ זה יושב בשרת המאובטח של Vercel ומסתיר את מפתח ה-API שלך מהמשתמשים

export default async function handler(req, res) {
    // אנו מאפשרים רק בקשות מסוג POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    const { prompt, systemInstruction } = req.body;
    
    // שליפת מפתח ה-API מתוך משתני הסביבה המאובטחים של השרת
    const apiKey = process.env.GEMINI_API_KEY;
  
    if (!apiKey) {
      console.error("API Key is missing in environment variables!");
      return res.status(500).json({ error: 'Server configuration error.' });
    }
  
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      const data = await response.json();
      
      if (!response.ok) {
         console.error("Gemini API Error:", data);
         return res.status(response.status).json({ error: data.error?.message || 'Error from Google API' });
      }
  
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      // החזרת התשובה הנקייה לאתר
      res.status(200).json({ text });
      
    } catch (error) {
      console.error("Server Fetch Error:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }