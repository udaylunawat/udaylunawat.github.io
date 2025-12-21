export async function loadModalContent(type, id) {
  try {
  const path =
    type === 'project'
      ? `/projects/${id}.html`
      : `/experience/${id}.html`;

    const res = await fetch(path);
    if (!res.ok) throw new Error('Not found');

    const html = await res.text();
    return extractContent(html, type);
  } catch (e) {
    return fallbackContent(type, id);
  }
}

function extractContent(html, type) {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const title = doc.querySelector('h1')?.textContent || `${type}`;
  doc.querySelector('h1')?.remove();
  doc.querySelectorAll('.tags').forEach(t => t.remove());

  return {
    title,
    content: doc.body.innerHTML
  };
}

function fallbackContent(type, id) {
  return {
    title: `${type}`,
    content: `<p>Content unavailable.</p>`
  };
}