import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import "../style/Ranking.css";

const Ranking = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const quizzesRef = collection(db, "quizzes");
        const q = query(quizzesRef, where("showInRankings", "==", true));
        const quizSnapshot = await getDocs(q);
        const quizList = quizSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate the max score for each quiz
        const finalQuizList = quizList.map(quiz => {
          let totalMaxScore = 0;
          quiz.questions.forEach(q => {
            if (q.type === "text" || q.type === "scale") {
              totalMaxScore += q.points || 0;
            } else if (q.type === "radio" || q.type === "checkbox") {
              const maxScoreForQuestion = Math.max(...q.options.map(option => option.score || 0));
              totalMaxScore += maxScoreForQuestion;
            }
          });
          return { ...quiz, maxScore: totalMaxScore };
        });

        setQuizzes(finalQuizList);
      } catch (err) {
        setError("Failed to fetch quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const userRef = collection(db, "users");
        const querySnapshot = await getDocs(userRef);
        const names = {};
        querySnapshot.docs.forEach(doc => {
          const userData = doc.data();
          names[doc.id] = userData.displayName;
        });
        setUserNames(names);
      } catch (err) {
        setError("Failed to fetch user names.");
      }
    };

    fetchUserNames();
  }, []);

  const handleQuizClick = async (quizId) => {
    if (selectedQuiz === quizId) {
      setSelectedQuiz(null); // Deselect if the same quiz is clicked again
      setRankings([]);
      return;
    }

    setSelectedQuiz(quizId);
    setRankings([]);
    setError(null);

    try {
      setLoading(true);
      const userAnswersRef = collection(db, "userAnswers");
      const q = query(userAnswersRef, where("quizId", "==", quizId));
      const querySnapshot = await getDocs(q);
      const rankingsList = querySnapshot.docs.map(doc => doc.data());
      setRankings(rankingsList);
    } catch (err) {
      setError("Failed to fetch rankings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bacground-ranking">
      <div className="ranking-container">
        <h2>Quiz Rankings</h2>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="quiz-list">
              <h3>Available Quizzes</h3>
              <ul>
                {quizzes.map(quiz => (
                  <li key={quiz.id} onClick={() => handleQuizClick(quiz.id)}>
                    {quiz.title} - Max Score: {quiz.maxScore}
                    {selectedQuiz === quiz.id && (
                      <div className="ranking-list">
                        <h4>Rankings for Quiz: {quiz.title}</h4>
                        {rankings.length > 0 ? (
                          <ul>
                            {rankings.map((ranking, index) => (
                              <li key={index}>
                                {userNames[ranking.userId] || "Unknown User"} - Score: {ranking.score} /{" "}
                                {quiz.maxScore || "Unknown"}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No rankings available for this quiz.</p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Ranking;
