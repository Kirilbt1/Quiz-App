import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../AuthContext"; 
import '../style/TakeQuiz.css'

const TakeQuiz = () => {
  const { quizId } = useParams();
  const { currentUser } = useAuth(); 
  const navigate = useNavigate(); // Initialize useNavigate
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [canAccess, setCanAccess] = useState(false); 
  const [creatorName, setCreatorName] = useState(""); 

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizDoc = doc(db, "quizzes", quizId);
        const quizSnapshot = await getDoc(quizDoc);
        if (quizSnapshot.exists()) {
          const quizData = quizSnapshot.data();
          setQuiz(quizData);

          if (quizData.showName && quizData.ownerId) {
            const userDoc = await getDoc(doc(db, "users", quizData.ownerId));
            if (userDoc.exists()) {
              setCreatorName(userDoc.data().displayName || "Anonymous");
            }
          }

          if (quizData.isPrivate && quizData.ownerId !== currentUser?.uid) {
            setCanAccess(false);
          } else {
            setCanAccess(true);
          }
        } else {
          setError("Quiz not found.");
        }
      } catch (err) {
        setError("Failed to fetch quiz.");
      } finally {
        setLoading(false);
      }
    };

    const checkIfAnswered = async () => {
      if (currentUser) {
        try {
          const userAnswersRef = collection(db, "userAnswers");
          const q = query(userAnswersRef, where("userId", "==", currentUser.uid), where("quizId", "==", quizId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setAlreadyAnswered(true);
            const answerDoc = querySnapshot.docs[0].data();
            setTotalScore(answerDoc.score || 0);
            setAnswers(answerDoc.answers.reduce((acc, ans) => {
              if (ans.optionIndex !== undefined) {
                acc[`${ans.questionIndex}`] = ans.optionIndex;
              } else {
                acc[`${ans.questionIndex}`] = ans.answer;
              }
              return acc;
            }, {}));
          }
        } catch (err) {
          setError("Failed to check if quiz has been answered.");
        }
      }
    };

    fetchQuiz();
    checkIfAnswered();
  }, [quizId, currentUser]);

  const handlePasswordSubmit = () => {
    if (quiz.password === password) {
      setCanAccess(true);
      setPasswordError(null);
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleAnswerChange = (questionIndex, optionIndex, value) => {
    if (!alreadyAnswered) {
      setAnswers(prevAnswers => ({
        ...prevAnswers,
        [`${questionIndex}`]: optionIndex !== null ? optionIndex : value
      }));
    }
  };

  const handleSubmit = async () => {
    if (alreadyAnswered) {
      alert("You have already submitted answers for this quiz.");
      return;
    }

    let score = 0;
    const answersToSave = [];

    try {
      quiz?.questions.forEach((question, index) => {
        const answerValue = answers[`${index}`];

        if (question.type === "text" || question.type === "scale") {
          if (answerValue !== undefined) {
            if (question.type === "text" && answerValue.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
              score += question.points || 0;
            }
            answersToSave.push({
              questionIndex: index,
              answer: answerValue
            });
          }
        } else if (question.type === "radio" || question.type === "checkbox") {
          const selectedOptionIndex = answers[`${index}`];
          if (selectedOptionIndex !== undefined) {
            score += question.options[selectedOptionIndex]?.score || 0;
            answersToSave.push({
              questionIndex: index,
              optionIndex: selectedOptionIndex
            });
          }
        }
      });

      setTotalScore(score);

      if (currentUser) {
        await setDoc(doc(db, "userAnswers", `${currentUser.uid}_${quizId}`), {
          userId: currentUser.uid,
          quizId,
          answers: answersToSave,
          score
        });
      }

      // Redirect to home page after submission
      navigate('/'); // Adjust the route to where you want to redirect

    } catch (err) {
      setError("Failed to submit answers.");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="background-protected">
      <div className="password-protect">
        <h5>This quiz is private. Please enter the password to access it.</h5>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && <p className="error">{passwordError}</p>}
        <button onClick={handlePasswordSubmit}>Submit</button>
      </div>
      </div>
    );
  }

  return (
    <div className="background">
      <div className="quiz-container">
        <h1>{quiz ? quiz.title : "Loading..."}</h1>
        {error && <p className="error">{error}</p>}
        {quiz && (
          <>
            {quiz.showName && creatorName && (
              <h3>Created by: {creatorName}</h3>
            )}
            {quiz.difficulty !== "Don't show" && (
              <p>Difficulty: {quiz.difficulty}</p>
            )}
          </>
        )}
        {alreadyAnswered && <p>You have already submitted answers for this quiz.</p>}
        {quiz && quiz.questions.map((question, index) => (
          <div key={index} className="question-card">
            <p>{question.text}</p>
            {question.type === "text" && (
              <input
                type="text"
                placeholder="Your answer"
                value={answers[`${index}`] || ""}
                onChange={(e) => handleAnswerChange(index, null, e.target.value)}
                disabled={alreadyAnswered}
              />
            )}
            {question.type === "radio" && (
              <div>
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={answers[`${index}`] === optionIndex}
                      onChange={() => handleAnswerChange(index, optionIndex)}
                      disabled={alreadyAnswered}
                    />
                    {option.text}
                  </label>
                ))}
              </div>
            )}
            {question.type === "checkbox" && (
              <div>
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex}>
                    <input
                      type="checkbox"
                      value={optionIndex}
                      checked={(answers[`${index}`] || []).includes(optionIndex)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setAnswers(prevAnswers => ({
                          ...prevAnswers,
                          [`${index}`]: isChecked
                            ? [...(prevAnswers[`${index}`] || []), optionIndex]
                            : prevAnswers[`${index}`].filter(i => i !== optionIndex)
                        }));
                      }}
                      disabled={alreadyAnswered}
                    />
                    {option.text}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
        {!alreadyAnswered && (
          <button onClick={handleSubmit}>Submit Answers</button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
