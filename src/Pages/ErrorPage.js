import { Link } from 'react-router-dom';

function Error() {
    return (
        <section className="container not-found-page">
            <h1>Page not found</h1>
            <p>We couldn't find that page.</p>
            <Link to="/" className="btn btn-primary">Back to home</Link>
        </section>
    );
}

export default Error;
