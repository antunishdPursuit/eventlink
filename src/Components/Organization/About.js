import image from './HomePageEventPlanner.png';

function SectionIcon({ kind }) {
  const paths = {
    inspiration: <><path d="M9 18h6m-5 3h4M8 13a6 6 0 1 1 8 0c-1 1-2 2-2 4h-4c0-2-1-3-2-4Z" /><path d="M12 1v2M3 5l2 1M19 6l2-1M2 12h2m16 0h2" /></>,
    stack: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 10c0 4 16 4 16 0M4 15c0 4 16 4 16 0" /></>,
    features: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 8h18M6 5.5h1m2 0h1" /></>,
    challenges: <><path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h5l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z" /><circle cx="11.5" cy="12" r="3" /></>,
    learning: <><path d="M12 5c-4-3-8-2-9-1v16c3-2 6-1 9 1 3-2 6-3 9-1V4c-1-1-5-2-9 1Zm0 0v16" /></>,
    github: <><path d="M9 19c-5 2-5-3-7-3m14 6v-4a4 4 0 0 0-1-3c4 0 7-2 7-6 0-2-1-3-2-4 0-1 0-3-1-4-2 0-3 1-4 2a14 14 0 0 0-6 0C8 2 6 1 4 1 3 2 3 4 3 5 2 6 1 7 1 9c0 4 3 6 7 6-1 1-1 2-1 3v4" /></>,
  };
  return <span className="about-section-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[kind]}</svg></span>;
}
function AboutSection({ kind, title, children }) {
  return <section className={`about-section about-section-${kind}`}><SectionIcon kind={kind} /><div><h2>{title}</h2>{children}</div></section>;
}
export default function About() {
  return <article className="about-page">
    <div className="about-intro">
      <div><p className="about-eyebrow">About EventLink</p><h1>My Event Planner Website Journey</h1>
        <p className="about-lead">EventLink began as a personal project to bring event discovery and people together. I built it while learning full-stack web development, from the first React screens to a working API and database. This page shares how the project took shape, what challenged me, and what I learned along the way.</p>
      </div>
      <figure><img src={image} alt="Event Planner Screenshot" /><figcaption>An early version of EventLink, showing the initial homepage design.</figcaption></figure>
    </div>
    <div className="about-sections">
      <AboutSection kind="inspiration" title="The Inspiration"><p>I wanted a place to discover live music, find people with similar interests, and keep track of events. Building EventLink gave me a practical way to connect that idea with the front-end, back-end, and database skills I was learning.</p></AboutSection>
      <AboutSection kind="stack" title="The Tech Stack"><p>React powers the interface, with Node.js and Express handling the API. PostgreSQL stores profiles and saved events, and Ticketmaster provides event search. Working across these parts helped me understand how a full-stack application fits together.</p></AboutSection>
      <AboutSection kind="features" title="Features Implemented"><p>Visitors can browse profiles and search for events by state or ZIP code. With an account, they can create a profile and save, edit, or remove events from their own list. The interface adapts to desktop and mobile screens.</p></AboutSection>
      <AboutSection kind="challenges" title="Challenges Faced"><p>Connecting the interface to an external API meant learning to handle changing responses, loading states, and errors. Managing form drafts and saved events brought new challenges, along with making sure people can change only their own data.</p></AboutSection>
      <AboutSection kind="learning" title="What I Learned"><p>This project strengthened my JavaScript, React, Express, and SQL skills. I learned to build REST APIs, connect a database, and manage state. Earlier deployments on Netlify and Render taught me how to host the parts together.</p></AboutSection>
      <AboutSection kind="github" title="Sharing on GitHub"><p>Explore EventLink's front-end and back-end source on GitHub, including its development history.</p><div className="about-source-links"><a href="https://github.com/antunishdPursuit/eventlink">View on GitHub</a><a href="https://github.com/antunishdPursuit/eventlink-backend">Backend</a></div></AboutSection>
    </div>
  </article>;
}
