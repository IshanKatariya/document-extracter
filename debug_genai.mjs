import { GoogleGenerativeAI } from '@google/generative-ai';

try {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  console.log('Client prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)).sort());
  console.log('Has listModels:', typeof client.listModels);
  console.log('Has getGenerativeModel:', typeof client.getGenerativeModel);
  console.log('Has listEndpoints:', typeof client.listEndpoints);
} catch (err) {
  console.error('Error instantiating GoogleGenerativeAI:', err);
}
