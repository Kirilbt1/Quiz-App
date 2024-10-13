import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import GoogleSignIn from "./components/GoogleSignIn";
import CreateQuiz from "./components/CreateQuiz";
import QuizList from "./components/QuizList";
import TakeQuiz from "./components/TakeQuiz";
import Ranking from "./components/Ranking";
import { useAuth } from "./AuthContext";
import Navbar from "./components/Navbar";


const App = () => {
  const { currentUser } = useAuth();
  console.log(currentUser);
  return (
    <Router>
      <Navbar/>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<QuizList />} />
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <GoogleSignIn />} />
        <Route path="/rankings" element={<Ranking />} />
        <Route path="/take-quiz/:quizId" element={<TakeQuiz />} />
        
        {/* Protected Routes */}
        <Route path="/create-quiz" element={currentUser ? <CreateQuiz /> : <Navigate to="/login" />} />
      </Routes>
     
    </Router>
  );
};

export default App;