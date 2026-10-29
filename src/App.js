// DEPENDENCIES
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// PAGES
import Edit from "./Pages/Edit";
import Error from "./Pages/ErrorPage";
import Home from "./Pages/Home";
import DiscoverEvents from "./Pages/DiscoverEvents";
import SignIn from "./Pages/SignIn";
import Index from "./Pages/Index";
import New from "./Pages/New";
import Show from "./Pages/Show";

// COMPONENTS
import NavBar from "./Components/Organization/NavBar";
import About from "./Components/Organization/About"
import Footer from "./Components/Organization/Footer";
function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className={`App${pathname === '/' ? '' : ' interior-shell'}`}>
        <NavBar />
        <main className="site-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<DiscoverEvents />} />
            <Route path="/users" element={<Index />} />
            <Route path="/users/new" element={<New />} />
            <Route path="/signin" element={<SignIn />} />
            <Route exact path="/users/:id" element={<Show />} />
            <Route path="/users/:id/edit" element={<Edit />} />
            <Route path="/about" element={<About/>} />
            <Route path="*" element={<Error />} />
          </Routes>
        </main>
        <Footer />
    </div>
  );
}

export default App;
