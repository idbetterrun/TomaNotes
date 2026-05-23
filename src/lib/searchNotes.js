const normalizeText = (value = '') => value.toLowerCase().replace(/\s+/g, ' ').trim();

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ');

const getSearchableContent = (note) => {
  const title = normalizeText(note?.title || '');
  const content = normalizeText(stripHtml(note?.content || ''));
  const tags = normalizeText((note?.tags || []).join(' '));

  return {
    title,
    content,
    tags,
    combined: [title, content, tags].filter(Boolean).join(' '),
  };
};

const matchesTags = (note, tags = []) => {
  if (!tags?.length) return true;
  const noteTags = note?.tags || [];
  return tags.every(tag => noteTags.includes(tag));
};

const matchesType = (note, type) => {
  if (!type || type === 'all') return true;
  return note?.type === type;
};

const matchesDate = (note, date) => {
  if (!date) return true;
  const target = new Date(note?.modifiedAt || note?.createdAt || 0).getTime();
  if (Number.isNaN(target)) return false;

  if (date.from) {
    const from = new Date(date.from).getTime();
    if (!Number.isNaN(from) && target < from) return false;
  }

  if (date.to) {
    const to = new Date(date.to).getTime();
    if (!Number.isNaN(to) && target > to) return false;
  }

  return true;
};

export function searchNotes({ notes = [], query = '', filters = {}, options = {} }) {
  // Single search entry: every sidebar search funnels through this function.
  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(' ').filter(Boolean);
  const isProtectedNote = options.isProtectedNote || (() => false);

  return notes.filter(note => {
    if (options.excludeProtectedNotes && isProtectedNote(note)) return false;
    if (!matchesType(note, filters.type)) return false;
    if (!matchesTags(note, filters.tags)) return false;
    if (!matchesDate(note, filters.date)) return false;

    if (!tokens.length) return true;

    const searchable = getSearchableContent(note);
    return tokens.every(token => searchable.combined.includes(token));
  });
}

export function getPlainNoteText(note) {
  return stripHtml(note?.content || '').replace(/\s+/g, ' ').trim();
}
