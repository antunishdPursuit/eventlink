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
        <p className="about-lead">I'm excited to share my journey of creating my very own event planner website! 🎉 After spending weeks diving into web development, I've successfully built a simple yet effective event planner app that helps me manage events effortlessly.</p>
      </div>
      <figure><img src={image} alt="Event Planner Screenshot" /><figcaption>An early version of EventLink, showing the initial homepage design.</figcaption></figure>
    </div>
    <div className="about-sections">
      <AboutSection kind="inspiration" title="The Inspiration"><p>The idea for this project came to me when I realized the need for a versatile event planning tool. I wanted to create an application that seamlessly integrates event searching, user management, and event tracking.</p></AboutSection>
      <AboutSection kind="stack" title="The Tech Stack"><p>I leveraged the following technologies to build this application:</p><ul>
        <li>Frontend: HTML, CSS, JavaScript, React</li><li>Backend: Node.js with Express.js</li><li>Database: PSQL for efficient data storage</li><li>External APIs: Ticketmaster API for event searching</li><li>Deployment: Hosted the backend on Render and frontend on Netlify</li>
      </ul></AboutSection>
      <AboutSection kind="features" title="Features Implemented"><p>I started with the basics and gradually added more features:</p><ul><li>Schedule management: Plan event schedules and share them with attendees.</li><li>Responsive design: A user-friendly interface that works across devices.</li></ul></AboutSection>
      <AboutSection kind="challenges" title="Challenges Faced"><p>While developing the app, I encountered challenges that led to valuable insights:</p><ul><li>API Integration: Learning to work with external APIs and handling responses.</li><li>State Management: Effectively managing state using React's hooks.</li><li>Backend Development: Creating API endpoints and handling CRUD operations.</li><li>Deployment: Configuring the backend and frontend for a seamless deployment.</li></ul></AboutSection>
      <AboutSection kind="learning" title="What I Learned"><p>This project was a fantastic learning experience:</p><ul><li>Improved my coding skills, especially in JavaScript, Node.js, React,and Express</li><li>Gained a deeper understanding of REST APIs and backend development.</li><li>Learned how to deploy a full-stack application on Netlify and Render.</li></ul></AboutSection>
      <AboutSection kind="github" title="Sharing on GitHub"><p>I've just pushed my event planner app to GitHub, and you can find the repository <a href="https://github.com/antunishdPursuit/eventlink">here</a>. Feel free to explore the code, provide feedback, or even contribute if you're interested!</p><p>Thank you for joining me on this journey. I'm thrilled to have created a functional event planner website, and I'm excited to see how it evolves in the future. 🚀</p></AboutSection>
    </div>
  </article>;
}
