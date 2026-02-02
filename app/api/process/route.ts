import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('📄 Processing:', file.name, 'Type:', documentType);

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured in .env.local' },
        { status: 500 }
      );
    }

    // Select model based on document type
    const modelName = documentType === 'handwritten' || documentType === 'mixed'
      ? 'gemini-1.5-pro'
      : 'gemini-1.5-flash';

    console.log('🤖 Using model:', modelName);

    const model = genAI.getGenerativeModel({ model: modelName });

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Extraction prompt
    const prompt = `
You are a document data extraction system. Extract the following fields from this PDF document and return ONLY a valid JSON object:

{
  "name": "Full name",
  "address": "Street address",
  "postalcode": "5-digit postal code",
  "city": "City name",
  "birthday": "DD.MM.YYYY",
  "date": "Document date DD.MM.YYYY",
  "time": "HH:MM",
  "handwritten": true/false,
  "signed": true/false,
  "stamp": "Stamp code (BB, AB, FK, S, or other)",
  "confidence": 0-100
}

Rules:
- Extract exactly what you see
- Use null if field not found
- Confidence 0-100 based on clarity
- Return ONLY valid JSON, no markdown, no explanation
`;

    console.log('🚀 Calling Gemini API...');

    // Call Gemini API
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      },
      prompt,
    ]);

    const response = result.response;
    const text = response.text();

    console.log('📥 Raw response:', text);

    // Parse JSON response
    let extractedData;
    try {
      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: text },
        { status: 500 }
      );
    }

    // Calculate cost
    const costPerToken = modelName.includes('pro') ? 0.000002 : 0.0000005;
    const estimatedTokens = 1000;
    const cost = estimatedTokens * costPerToken;

    console.log('✅ Extraction successful!');

    return NextResponse.json({
      success: true,
      data: {
        ...extractedData,
        pdf_file_name: file.name,
        status: 'success',
      },
      model: modelName,
      cost,
      processingTime: 2.5,
    });

  } catch (error) {
    console.error('❌ Extraction error:', error);
    return NextResponse.json(
      { 
        error: 'Extraction failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
