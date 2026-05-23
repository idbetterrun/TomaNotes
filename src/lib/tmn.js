import JSZip from 'jszip';

const APP_NAME = 'tomanotes';
const FORMAT_VERSION = 'tmn/zip/v1';
const SCHEMA_VERSION = '1.0';

function countWords(text, format) {
  if (!text) return 0;
  if (format === 'html') {
    const stripped = text.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ');
    return stripped.trim().split(/\s+/).filter(Boolean).length;
  }
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function htmlToPlainText(html) {
  if (!html) return '';
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<\/th>/gi, ' | ')
    .replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, url, inner) => {
      const stripped = inner.replace(/<[^>]*>/g, '');
      return `${stripped} (${url})`;
    })
    .replace(/<img\s+[^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, (_, alt) => alt ? `[Image: ${alt}]` : '[Image]')
    .replace(/<\/?(b|i|u|strong|em|span|mark|code|del|ins|sub|sup|s)\b[^>]*>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n/g, '\n')
    .replace(/  +/g, ' ')
    .replace(/\| \| \| /g, '\n')
    .trim();
  return text;
}

function mdToPlainSummary(md) {
  if (!md) return '';
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/  +/g, ' ')
    .trim();
}

const SUMMARY_MAX = 60;

export function noteToContentJson(note, appVersion = '0.2.0') {
  const format = note.type === 'markdown' ? 'markdown' : 'html';
  const isProtected = !!(note.protected ?? note.encrypted);
  const plainContent = format === 'html' ? htmlToPlainText(note.content || '') : (note.content || '');
  const plainPreview = format === 'markdown' ? mdToPlainSummary(note.content || '') : plainContent;
  const summary = plainPreview.length > SUMMARY_MAX
    ? plainPreview.substring(0, SUMMARY_MAX).replace(/\s+\S*$/, '') + '...'
    : plainPreview;

  return {
    id: note.uuid || crypto.randomUUID(),
    type: 'note',
    title: note.title || '',
    description: note.description || '',
    created_at: note.createdAt,
    updated_at: note.modifiedAt || note.createdAt,
    tags: note.tags || [],
    lang: note.lang || null,
    version: note.version || 1,
    encryption: {
      enabled: isProtected,
      method: isProtected ? 'aes-256-gcm' : null,
      hint: null,
    },
    content: {
      format,
      text: note.content || '',
      word_count: countWords(note.content, format),
      attachments_refs: [],
    },
    shared: {},
    app_data: {
      [APP_NAME]: {
        editor: {
          type: note.type === 'markdown' ? 'markdown' : 'rich',
          font_size: note.fontSize || '16px',
          font_family: 'system-ui',
          theme: 'light',
          line_numbers: false,
          syntax_highlighting: true,
          word_wrap: true,
        },
        metadata: {
          is_pinned: note.isPinned || false,
          is_favorite: note.isFavorite || false,
          is_trashed: note.isDeleted || false,
          read_time_minutes: note.readTimeMinutes || 0,
          last_opened_at: note.lastOpenedAt || note.createdAt,
          open_count: note.openCount || 0,
        },
      },
      notiee: {
        ai_processing: {
          state: 'completed',
          ocr_text: null,
          summary: summary || null,
          detailed_content: plainContent || null,
          todos: null,
          models_used: [APP_NAME],
          token_usage: 0,
        },
      },
    },
  };
}

export function contentJsonToNote(contentJson, { preserveAppData = true } = {}) {
  const appData = contentJson.app_data?.tomanotes || {};
  const editor = appData.editor || {};
  const metadata = appData.metadata || {};
  const content = contentJson.content || {};
  const now = new Date().toISOString();

  let noteType = 'rich';
  if (content.format === 'markdown') {
    noteType = 'markdown';
  } else if (content.format === 'plain' || content.format === 'html') {
    noteType = 'rich';
  }

  let noteContent = content.text || '';

  // Handle Notiee records: content.text may be empty, real text is in app_data.notiee.ai_processing
  if (!noteContent.trim() && contentJson.app_data?.notiee?.ai_processing) {
    const ai = contentJson.app_data.notiee.ai_processing;
    const parts = [];
    if (ai.detailed_content) {
      parts.push(ai.detailed_content);
      if (ai.summary) parts.push(ai.summary);
    } else if (ai.summary) {
      parts.push(ai.summary);
    }
    if (ai.todos && ai.todos.length > 0) {
      const todoLines = ai.todos.map(t => `${t.is_completed ? '[x]' : '[ ]'} ${t.content}`);
      parts.push('Todos:\n' + todoLines.join('\n'));
    }
    noteContent = parts.join('\n\n');
  }

  return {
    id: Date.now(),
    uuid: contentJson.id || crypto.randomUUID(),
    title: contentJson.title || '',
    description: contentJson.description || '',
    content: noteContent,
    type: noteType,
    isFavorite: metadata.is_favorite || false,
    isDeleted: metadata.is_trashed || false,
    isPinned: metadata.is_pinned || false,
    encrypted: contentJson.encryption?.enabled || false,
    protected: contentJson.encryption?.enabled || false,
    starred: false,
    tags: contentJson.tags || [],
    lang: contentJson.lang || null,
    version: contentJson.version || 1,
    fontSize: editor.font_size || '16px',
    readTimeMinutes: metadata.read_time_minutes || 0,
    openCount: metadata.open_count || 0,
    createdAt: contentJson.created_at || now,
    modifiedAt: contentJson.updated_at || now,
    lastOpenedAt: metadata.last_opened_at || now,
    _importedAppData: preserveAppData ? contentJson.app_data : null,
  };
}

export async function packNote(note, appVersion = '0.2.0') {
  const zip = new JSZip();
  const contentJson = noteToContentJson(note, appVersion);
  const docId = contentJson.id;
  const isProtected = !!(note.protected ?? note.encrypted);

  const manifest = {
    format: FORMAT_VERSION,
    metadata: {
      app: APP_NAME,
      app_version: appVersion,
      created_at: note.createdAt,
      modified_at: note.modifiedAt || note.createdAt,
      document_id: docId,
      encrypted: false,
      encryption_method: null,
      compression: 'deflate',
    },
    files: [],
    content: {
      main: 'content.json',
      type: 'note',
      schema_version: SCHEMA_VERSION,
    },
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('content.json', JSON.stringify(contentJson, null, 2));

  if (isProtected) {
    zip.file('content.json.encrypted', JSON.stringify({ note: 'Content encrypted. Unlock before export.' }));
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return {
    blob,
    filename: `${note.title || 'Untitled_Note'}.tmn`,
  };
}

export async function unpackTmn(fileOrBuffer) {
  const zip = await JSZip.loadAsync(fileOrBuffer);

  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) throw new Error('Invalid .tmn file: missing manifest.json');

  const manifestText = await manifestFile.async('string');
  let manifest;
  try {
    manifest = JSON.parse(manifestText);
  } catch {
    throw new Error('Invalid .tmn file: manifest.json is not valid JSON');
  }

  if (manifest.format !== FORMAT_VERSION) {
    throw new Error(`Unsupported format version: ${manifest.format}. Expected ${FORMAT_VERSION}`);
  }

  const contentFile = zip.file('content.json');
  if (!contentFile) throw new Error('Invalid .tmn file: missing content.json');

  const contentText = await contentFile.async('string');
  let contentJson;
  try {
    contentJson = JSON.parse(contentText);
  } catch {
    throw new Error('Invalid .tmn file: content.json is not valid JSON');
  }

  const attachments = [];
  const attachmentFiles = manifest.files || [];
  if (attachmentFiles.length > 0) {
    for (const fileInfo of attachmentFiles) {
      const entry = zip.file(fileInfo.path);
      if (entry) {
        const data = await entry.async('base64');
        attachments.push({
          path: fileInfo.path,
          mimeType: fileInfo.mime_type,
          size: fileInfo.size,
          data: `data:${fileInfo.mime_type};base64,${data}`,
        });
      }
    }
  }

  return { manifest, contentJson, attachments };
}

export function isTmnFile(filename) {
  return /\.tmn$/i.test(filename);
}

export { htmlToPlainText };
