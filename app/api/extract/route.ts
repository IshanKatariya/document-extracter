import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Select model based on document type (can be overridden with GEMINI_MODEL env)
    const defaultEnvModel = process.env.GEMINI_MODEL;
    const modelName = defaultEnvModel ?? (documentType === 'handwritten' || documentType === 'mixed'
      ? 'models/gemini-2.5-pro'
      : 'models/gemini-2.5-flash');

    // Track which model we end up using (useful when fallback occurs)
    let modelNameUsed = modelName;
    let model = genAI.getGenerativeModel({ model: modelName });

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Craft extraction prompt
    const prompt = `
You are a highly accurate document data extraction system. Extract the following fields from this document image and return ONLY a JSON object with this exact structure:

{
  "name": "Full name of the person",
  "address": "Full street address",
  "postalcode": "5-digit postal code",
  "city": "City name",
  "birthday": "Date in DD.MM.YYYY format",
  "date": "Document date in DD.MM.YYYY format",
  "time": "Time in HH:MM format",
  "handwritten": boolean,
  "signed": boolean,
  "stamp": "Stamp identifier (BB, AB, FK, S, or other)"
}

Rules:
- Extract exactly what you see
- Postalcode must be exactly 5 digits
- Use DD.MM.YYYY format for dates
- Use HH:MM format for time
- Return confidence: 0-100 based on clarity
- If a field is not found, use null
- Be precise with handwriting recognition

Return ONLY valid JSON, no markdown, no explanation.
`;

    // Call Gemini API with fallback when model isn't available
    let result;
    try {
      result = await model.generateContent([
        {
          inlineData: {
            mimeType: file.type,
            data: base64,
          },
        },
        prompt,
      ]);
    } catch (genErr: any) {
      console.error('Generation error:', genErr);
      // Attempt REST fallback if SDK lacks listModels and we have a key
      if (typeof (genAI as any).listModels !== 'function' && process.env.GEMINI_API_KEY) {
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`);
          const listJson = await listRes.json();
          console.warn('ListModels response (REST):', listJson);
          const modelsArray: any[] = Array.isArray(listJson) ? listJson : (listJson?.models || []);
          const fallbackEntry = modelsArray.find(m => (m?.name || m?.id || '').toString().toLowerCase().includes('gemini'));
          const fallbackModelName = fallbackEntry?.name || fallbackEntry?.id || fallbackEntry?.model;
          if (fallbackModelName) {
            console.log('Falling back to model (REST):', fallbackModelName);
            modelNameUsed = fallbackModelName;
            model = genAI.getGenerativeModel({ model: fallbackModelName });
            result = await model.generateContent([
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64,
                },
              },
              prompt,
            ]);
          } else {
            console.error('No Gemini model found in REST model list');
            return NextResponse.json({
              error: 'Model unavailable',
              details: genErr?.message || String(genErr),
              hint: 'No Gemini models discovered via REST. Set GEMINI_MODEL in .env.local or verify your API key/project permissions.'
            }, { status: 500 });
          }
        } catch (restErr) {
          console.error('REST listModels failed:', restErr);
          return NextResponse.json({
            error: 'Model unavailable',
            details: genErr?.message || String(genErr),
            hint: 'Failed to discover models via REST. Set GEMINI_MODEL in .env.local or upgrade the SDK.'
          }, { status: 500 });
        }
      }

      // If the SDK exposes listModels, use it to find a fallback; otherwise return a helpful error
      if (typeof (genAI as any).listModels !== 'function') {
        console.error('genAI.listModels is not a function on this SDK version');
        return NextResponse.json({
          error: 'Model unavailable',
          details: genErr?.message || String(genErr),
          hint: 'The installed @google/generative-ai SDK does not implement listModels. Set GEMINI_MODEL in .env.local to a working model name (see docs) or upgrade the SDK.',
        }, { status: 500 });
      }

      // If model is not found, try to list available models and pick a supported Gemini model
      try {
        const available = await (genAI as any).listModels();
        console.warn('ListModels response:', available);

        // Support multiple response shapes: array or object with models property
        const modelsArray: any[] = Array.isArray(available) ? available : (available?.models || []);

        const fallbackEntry = modelsArray.find(m => {
          const name = (m?.name || m?.id || m?.model || '').toString().toLowerCase();
          const hasGenerate = (m?.supportedMethods || m?.methods || []).includes('generateContent');
          return name.includes('gemini') && hasGenerate;
        }) || modelsArray.find(m => (m?.name || m?.id || '').toString().toLowerCase().includes('gemini'));

        const fallbackModelName = fallbackEntry?.name || fallbackEntry?.id || fallbackEntry?.model;

        if (!fallbackModelName) {
          // Re-throw original error to be handled below
          throw genErr;
        }

        console.log('Falling back to model:', fallbackModelName);
        modelNameUsed = fallbackModelName;
        model = genAI.getGenerativeModel({ model: fallbackModelName });
        result = await model.generateContent([
          {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          },
          prompt,
        ]);
      } catch (fallbackErr: any) {
        console.error('Fallback generateContent failed:', fallbackErr);
        // Propagate the original or fallback error to the outer handler
        throw genErr;
      }
    }

    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: text },
        { status: 500 }
      );
    }

    // Calculate approximate cost using the actual model used
    const costPerToken = modelNameUsed.includes('pro') ? 0.000002 : 0.0000005;
    const estimatedTokens = 1000; // Rough estimate
    const cost = estimatedTokens * costPerToken;

    return NextResponse.json({
      data: extractedData,
      model: modelNameUsed,
      cost,
      processingTime: Math.random() * 2 + 1, // Simulated
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Extraction failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Debug: expose available models via GET for troubleshooting
export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    if (typeof (genAI as any).listModels !== 'function') {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({
          error: 'listModels not available on installed SDK and GEMINI_API_KEY not set',
          hint: 'Upgrade @google/generative-ai or set GEMINI_MODEL in .env.local to a known working model name.'
        }, { status: 500 });
      }

      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`);
        const listJson = await listRes.json();
        const modelsArray: any[] = Array.isArray(listJson) ? listJson : (listJson?.models || []);
        const geminiCandidates = modelsArray.filter(m => (m?.name || m?.id || m?.model || '').toString().toLowerCase().includes('gemini'));
        return NextResponse.json({ models: modelsArray, geminiCandidates });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : String(err);

        return NextResponse.json(
          {
            error: 'Failed to list models via REST',
            details: message,
          },
          { status: 500 }
        );
      }

    }
    const available = await (genAI as any).listModels();
    // Provide a lightweight summary and also show any Gemini-related candidates we detect
    const modelsArray: any[] = Array.isArray(available) ? available : (available?.models || []);
    const geminiCandidates = modelsArray.filter(m => (m?.name || m?.id || m?.model || '').toString().toLowerCase().includes('gemini'));

    return NextResponse.json({ models: modelsArray, geminiCandidates });
  } catch (err: any) {
    console.error('ListModels error:', err);
    return NextResponse.json({ error: 'Failed to list models', details: err?.message || String(err) }, { status: 500 });
  }
}
