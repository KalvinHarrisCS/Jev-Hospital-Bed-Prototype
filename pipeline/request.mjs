import {createHash} from 'node:crypto';
import {terms} from './sources.mjs';

export function collectionError(message) {
  return Object.assign(new Error(message), {code: 'COLLECTION_ERROR'});
}

export async function readPublic(url, format = 'json') {
  try {
    if (!['https://health.data.ny.gov', 'https://data.ny.gov'].includes(new URL(url).origin) ||
        !['json', 'pdf'].includes(format)) throw collectionError('Unsupported public endpoint or format.');
    const response = await fetch(url, {redirect: 'manual', signal: AbortSignal.timeout(45000),
      headers: {Accept: format === 'json' ? 'application/json' : 'application/pdf'}});
    // The current terms download has one reviewed redirect. Other redirects fail.
    if (url === terms.url && response.status === 302 && response.headers.get('location') === terms.fileUrl) {
      return readPublic(terms.fileUrl, format);
    }
    if (!response.ok) throw collectionError('Public source returned HTTP ' + response.status + '. Retry later.');
    if (format === 'json' && !response.headers.get('content-type')?.includes('application/json')) {
      throw collectionError('Expected JSON from the public API.');
    }
    const chunks = []; let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 2 * 1024 * 1024) throw collectionError('Public response exceeded the size limit.');
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    if (format === 'pdf' && bytes.subarray(0, 5).toString() !== '%PDF-') {
      throw collectionError('Expected the reviewed public PDF.');
    }
    return {sha256: createHash('sha256').update(bytes).digest('hex'),
      ...(format === 'json' ? {value: JSON.parse(bytes.toString('utf8'))} : {})};
  } catch (error) {
    if (error.code === 'COLLECTION_ERROR') throw error;
    throw collectionError('Could not read the public source. No snapshot was saved.');
  }
}
