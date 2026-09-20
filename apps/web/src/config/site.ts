export const site = {
  name: 'Anton Carlsson',
  url: 'https://antoncarlsson.github.io',
  description: 'Projects, ideas, and notes by Anton Carlsson.',
  introduction: 'A place for things I build and ideas I’m working through.',
  biography:
    'I’m Anton. This is my personal corner of the web — a notebook for projects, experiments, and ideas. I’ll share what I’m building and what I learn along the way.',
  // Add your own verified links, for example { label: 'GitHub', href: 'https://github.com/…' }.
  links: [] as { label: string; href: string }[],
}

export function pageHead(title: string, description: string, path: string) {
  const url = `${site.url}${path === '/' ? '/' : `${path.replace(/\/$/, '')}/`}`
  return {
    meta: [
      { title: title === site.name ? title : `${title} · ${site.name}` },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: path.startsWith('/blog/') ? 'article' : 'website' },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
