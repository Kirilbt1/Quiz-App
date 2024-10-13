import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import '../style/QuizList.css'; // Import the CSS file

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUserId = localStorage.getItem('currentUserId');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizCollection = collection(db, "quizzes");
        const querySnapshot = await getDocs(quizCollection);
        const quizData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setQuizzes(quizData);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setError("Failed to fetch quizzes.");
      }
    };

    const fetchUserAnswers = async () => {
      if (currentUserId) {
        try {
          const userAnswersCollection = collection(db, "userAnswers");
          const q = query(userAnswersCollection, where("userId", "==", currentUserId));
          const querySnapshot = await getDocs(q);
          const answersData = querySnapshot.docs.map(doc => doc.data());

          setUserAnswers(answersData);
        } catch (error) {
          console.error("Error fetching user answers:", error);
          setError("Failed to fetch user answers.");
        }
      }
    };

    // Fetch quizzes and user answers in parallel
    Promise.all([fetchQuizzes(), fetchUserAnswers()]).finally(() => setLoading(false));
  }, [currentUserId]);

  const handleDelete = async (quizId) => {
    try {
      const quizRef = doc(db, "quizzes", quizId);
      await deleteDoc(quizRef);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      console.log("Quiz deleted successfully.");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      setError("Failed to delete quiz.");
    }
  };

  return (
    <>
    <div className="background-container">
    <div className="absolute-container">
    <div className="text-overlay">
        <h1 >Available Quizzes</h1>
        <p >Welcome to the Quiz List page! Here, you can explore all available quizzes created by you and others.</p>
      </div>
    <div className="quiz-list-container">
      
      
      {loading ? (
        <div className="loading">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        quizzes.map(quiz => {
          const userAnswer = userAnswers.find(answer => answer.quizId === quiz.id);
          const points = userAnswer ? userAnswer.score : "Not Answered";

          return (
            <div key={quiz.id} className="quiz-card">
              <div className="card-content">
                <h2>
                  <Link to={`/take-quiz/${quiz.id}`} className="quiz-link">
                    {quiz.title}
                  </Link>
                </h2>
                <p className="info">
                  Private: {quiz.isPrivate ? "Yes" : "No"}
                </p>
                <p className="info">
                  {points === "Not Answered" ? points : `Points: ${points}`}
                </p>
                {quiz.ownerId === currentUserId && (
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(quiz.id)}
                  >
                    Delete Quiz
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
    </div>
  <div className="picturetwo">

  </div>
    </div>
    </>
  );
};

export default QuizList;
