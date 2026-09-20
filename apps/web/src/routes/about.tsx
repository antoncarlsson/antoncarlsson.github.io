import { createFileRoute } from '@tanstack/react-router'
import { site, pageHead } from '../config/site'
export const Route = createFileRoute('/about')({
  head: () => pageHead('About', `About ${site.name} and this personal notebook.`, '/about'),
  component: About,
})
function About() {
  return (
    <section className="about-page">
      <header className="page-heading">
        <p className="eyebrow">Notebook / About</p>
        <h1>
          Hello, I’m {site.name.split(' ')[0]}
          <span className="accent">.</span>
        </h1>
        <p className="lede">A little about the person behind the notebook.</p>
      </header>
      <div className="prose">
        <p>{site.biography}</p>
        <h2>A place to think and build</h2>
        <p>
          This site brings together my work and my writing. Some entries will be finished projects;
          others will be small discoveries or questions I’m still working through.
        </p>
        <p>Thanks for stopping by.</p>
        {site.links.length > 0 && (
          <>
            <h2>Find me elsewhere</h2>
            <ul>
              {site.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label} ↗</a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <p className="signature">— {site.name.split(' ')[0]}</p>
    </section>
  )
}
