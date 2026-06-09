import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Users from "./pages/Users/Users";
import RoundsPage from "./pages/Rounds/RoundsPage";
import QuestionsList from "./pages/Questions/QuestionsList";
import CreateQuestion from "./pages/Questions/CreateQuestion";
import Submissions from "./pages/Submissions/Submissions";
import LeaderboardPage from "./pages/Leaderboard/LeaderboardPage";

export default function App() {
  return (
    <>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/users" element={<Users />} />
            <Route path="/rounds" element={<RoundsPage />} />
            <Route path="/questions" element={<QuestionsList />} />
            <Route path="/questions/create" element={<CreateQuestion />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </>
  );
}

