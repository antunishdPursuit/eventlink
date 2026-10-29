import '../../Css/FooterCss.css';

export default function Footer() {
  return (
    <footer className="footer">
      <nav className="footer-links" aria-label="GitHub repositories">
        <span>GitHub</span>
        <a href="https://github.com/antunishdPursuit/events_attending" target="_blank" rel="noreferrer">Front End</a>
        <a href="https://github.com/antunishdPursuit/EventsBackEnd" target="_blank" rel="noreferrer">Back End</a>
      </nav>
    </footer>
  );
}
