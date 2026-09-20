import { createFileRoute, Link } from '@tanstack/react-router'
import { site, pageHead } from '../config/site'
import { ContentList } from '../features/content/components/content-list'
export const Route = createFileRoute('/')({
  head: () => pageHead(site.name, site.description, '/'),
  component: Home,
})
function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> Personal website / notebook
          </p>
          <h1>
            Building things.
            <br />
            <span>Thinking out loud.</span>
          </h1>
          <p className="hero-intro">
            Hi, I’m {site.name.split(' ')[0]}. {site.introduction}
          </p>
          <div className="hero-links">
            <Link className="primary-link" to="/projects">
              Explore projects <span aria-hidden="true">↗</span>
            </Link>
            <Link to="/about">
              A little about me <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="notebook-art" aria-hidden="true">
          <div className="notebook-top">
            <span>notes / index</span>
            <span>01</span>
          </div>
          <div className="notebook-code">
            <span className="code-comment">// a space to keep exploring</span>
            <br />
            <span className="code-key">const</span> notebook = {'{'}
            <br />
            <span className="code-indent">
              build: <span className="code-string">'something useful'</span>,
            </span>
            <br />
            <span className="code-indent">
              learn: <span className="code-string">'along the way'</span>,
            </span>
            <br />
            <span className="code-indent">
              share: <span className="code-string">'what I find'</span>,
            </span>
            <br />
            {'}'}
            <span className="cursor">_</span>
          </div>
          <div className="notebook-bottom">
            <span>ideas → experiments → projects</span>
            <span>↳</span>
          </div>
        </div>
      </section>
      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / Selected work</p>
            <h2>Things I’m building</h2>
          </div>
          <Link to="/projects">
            All projects <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ContentList kind="projects" featured limit={3} />
      </section>
      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / From the notebook</p>
            <h2>Thoughts & discoveries</h2>
          </div>
          <Link to="/blog">
            All writing <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ContentList kind="blog" limit={3} />
      </section>
      <aside className="closing-note">
        <span aria-hidden="true">*</span>
        <p>
          A small corner of the internet for unfinished thoughts
          <br className="desktop-break" /> and things worth sharing.
        </p>
      </aside>
    </>
  )
}
