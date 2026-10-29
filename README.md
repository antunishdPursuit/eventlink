# EventLink

Explore concerts, browse profiles, and save events to your own profile. The React frontend uses the [EventLink backend](https://github.com/antunishdPursuit/eventlink-backend) for event search and profile data.

## Run locally

Start the backend and PostgreSQL using the instructions in its repository. Then, in PowerShell:

```powershell
npm ci
$env:HOST = '127.0.0.1'
$env:PORT = '3225'
$env:VITE_API_URL = 'http://127.0.0.1:3003'
npm start
```

Open `http://127.0.0.1:3225/`. The `localhost` address redirects there so sign-in and session cookies use the same local site as the API. Browse Events without an account. To save events, choose Sign in; new users can select Create account there and are signed in automatically. My profile holds your profile information and saved events. The existing sample profiles remain available to browse under People.

The Ticketmaster API key belongs in the backend environment, not the frontend or the repository.

