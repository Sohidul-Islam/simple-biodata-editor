import { BiodataData, BiodataSection } from '@/app/actions';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

/**
 * Interface with the local Ollama LLM to enhance and structure the Markdown text into our Biodata database format.
 */
export async function enhanceAndStructureResume(markdownContent: string): Promise<Partial<BiodataData>> {
  const prompt = `
You are an expert Resume and Wedding Biodata designer. Your task is to analyze the following parsed raw resume/biodata markdown, repair any formatting issues, enhance the content, and structure it into a beautiful, standardized JSON schema.

Here is the markdown content of the document:
---
${markdownContent}
---

Your response MUST be a single, valid JSON object and nothing else. Do not write any explanations, markdown formatting blocks (like \`\`\`json), or preamble. Return ONLY the JSON matching this TypeScript structure:

{
  "name": "Full Name of the Person",
  "email": "Email Address or null",
  "phone": "Phone Number or null",
  "titleObjective": "A short heading like 'About the Groom' or 'About the Bride' or 'Career Objective'",
  "objectiveContent": "An enhanced, well-written, and polite 3-4 sentence introduction/about-me or objective paragraph.",
  "theme": "maroon", // Choose one of: maroon, gold, navy, emerald
  "sections": [
    {
      "id": "personal",
      "title": "Personal Details",
      "layout": "simple", // simple (1-column list), grid (2-column layout), academic (edu/work tag style), text (free-text paragraph)
      "items": [
        { "id": "p1", "label": "Full Name", "value": "Name" },
        { "id": "p2", "label": "Date of Birth", "value": "Birth Date" },
        { "id": "p3", "label": "Religion", "value": "Religion details" }
        // Include other personal details like Nationality, Blood Group, Marital Status, etc.
      ]
    },
    {
      "id": "education",
      "title": "Educational Qualification",
      "layout": "academic",
      "items": [
        { "id": "ed1", "tag": "Degree Tag (e.g. B.Sc, HSC)", "title": "Degree / Course Title", "sub": "Institution Name — Grade / CGPA / GPA (Passing Year)" }
      ]
    },
    {
      "id": "work",
      "title": "Occupation & Financial Status",
      "layout": "grid",
      "items": [
        { "id": "w1", "label": "Occupation", "value": "Job Title / Business details" },
        { "id": "w2", "label": "Employer", "value": "Company Name" }
      ]
    }
    // You can also create "family" or "interests" sections if details are present in the text.
  ]
}

Guidelines:
1. Automatically detect and extract as many standard biodata fields as possible.
2. Group items into relevant sections such as "personal", "physical" (Height, Weight, Complexion), "education", "work", "family", "interests".
3. For "education" and "work", prefer the "academic" layout or "grid" layout.
4. Auto-repair broken dates, email structures, or misaligned headers.
5. Make sure every item in a section has a unique "id" (e.g., p1, p2, ed1, w1).
6. Return strictly valid JSON.
`;

  try {
    const url = `${OLLAMA_HOST}/api/generate`;
    console.log(`[Ollama] Querying model ${MODEL_NAME} at ${url}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2, // Low temperature for high structure adherence
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with status: ${response.status}`);
    }

    const result = await response.json();
    const responseText = result.response?.trim() || '';
    
    // Clean potential markdown blocks
    let cleanJson = responseText;
    if (cleanJson.includes('```')) {
      const match = cleanJson.match(/```(?:json)?([\s\S]*?)```/);
      if (match && match[1]) {
        cleanJson = match[1].trim();
      }
    }
    
    // Find the first '{' and last '}'
    const startIndex = cleanJson.indexOf('{');
    const endIndex = cleanJson.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      cleanJson = cleanJson.substring(startIndex, endIndex + 1);
    }

    console.log(`[Ollama] Cleaning and parsing LLM output...`);
    const parsedData = JSON.parse(cleanJson);
    
    // Post-process sections to ensure they have the correct keys and valid items
    if (parsedData.sections && Array.isArray(parsedData.sections)) {
      parsedData.sections = parsedData.sections.map((sec: any, sIdx: number) => ({
        id: sec.id || `sec_${sIdx}_${Date.now()}`,
        title: sec.title || 'Section',
        layout: ['grid', 'simple', 'academic', 'text'].includes(sec.layout) ? sec.layout : 'grid',
        description: sec.description || '',
        items: Array.isArray(sec.items) 
          ? sec.items.map((item: any, iIdx: number) => ({
              id: item.id || `item_${sIdx}_${iIdx}_${Date.now()}`,
              label: item.label || '',
              value: item.value || '',
              tag: item.tag || '',
              title: item.title || '',
              sub: item.sub || '',
            }))
          : []
      }));
    }

    return parsedData;
  } catch (error) {
    console.error('[Ollama] Failed to structure resume with local AI:', error);
    throw error;
  }
}
