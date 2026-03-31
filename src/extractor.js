import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const MAX_CHARS = 80000;

async function extractPdfText(buffer) {
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  console.log(`PDF loaded — ${pdf.numPages} pages`);

  const pageTexts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n\n');
}

export async function extractTextFromFile(buffer, mimetype) {
  let text = '';

  if (mimetype === 'application/pdf') {
    console.log('Extracting text from PDF...');
    text = await extractPdfText(buffer);

  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    console.log('Extracting text from Word document...');
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;

  } else {
    throw new Error('Unsupported file type. Please upload a PDF or Word document.');
  }

  text = text.replace(/\n{3,}/g, '\n\n').replace(/\s{3,}/g, ' ').trim();

  if (!text || text.length < 100) {
    throw new Error('Could not extract text from this file. It may be scanned or image-based.');
  }

  if (text.length > MAX_CHARS) {
    console.log(`Document too long (${text.length} chars), capping at ${MAX_CHARS}...`);
    text = text.slice(0, MAX_CHARS);
  }

  console.log(`Text extracted — ${text.length} characters`);
  return text;
}