import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

import "../style/CreateQuiz.css"; 

const CreateQuiz = () => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState([]);
  const [quizLink, setQuizLink] = useState("");
  const [error, setError] = useState("");
  const [showName, setShowName] = useState(false);
  const [difficulty, setDifficulty] = useState("Don't show");
  const [showInRankings, setShowInRankings] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(null); 
  const navigate = useNavigate();

  const addQuestion = (type) => {
    const newQuestions = [
      ...questions,
      {
        type,
        text: "",
        options: [],
        score: 0,
        min: 1,
        max: 10,
        correctAnswer: type === "text" ? "" : null,
        points: type === "text" ? 0 : null,
      },
    ];
    setQuestions(newQuestions);
    setExpandedQuestion(newQuestions.length - 1); 
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const addOption = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].options.push({ text: "", score: 0 });
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
    updatedQuestions[questionIndex].options = updatedOptions;
    setQuestions(updatedQuestions);
  };

  const handleSaveQuiz = async () => {
    if (title === "") {
      setTitleError(true);
      return;
    }
    if (isPrivate && !password) {
      setError("Password is required for a private quiz.");
      return;
    }

    try {
      const quizRef = collection(db, "quizzes");
      const docRef = await addDoc(quizRef, {
        title,
        isPrivate,
        password: isPrivate ? password : null,
        questions,
        showName,
        difficulty,
        showInRankings,
        ownerId: currentUser.uid,
      });
      setQuizLink(`/take-quiz/${docRef.id}`);
      navigate("/"); // Redirect to the home page 
    } catch (error) {
      setError("Error creating quiz. Please try again.");
    }
  };

  const toggleQuestionVisibility = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index); 
  };

  return (
    <div className="create-quiz-container">
      <div className="create-quiz-form">
        <h1>Create Quiz</h1>
        {error && <p className="error">{error}</p>}

        <label htmlFor="title">Quiz Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleError(false);
          }}
        />
        {titleError && <p className="error">Please insert a title</p>}

        <label>
          <input
            type="checkbox"
            className="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Private Quiz
        </label>

        {isPrivate && (
          <>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}

        <label>
          <input
            type="checkbox"
            checked={showName}
            onChange={(e) => setShowName(e.target.checked)}
          />
          Show Username When Quiz is Answered
        </label>

        <label htmlFor="difficulty">Quiz Difficulty</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="Don't show">Don't show</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={showInRankings}
            onChange={(e) => setShowInRankings(e.target.checked)}
          />
          Show Quiz in Rankings
        </label>

        <button className="addtextquestion" onClick={() => addQuestion("text")}>
          Add Text Question
        </button>
        <button className="addtextquestion" onClick={() => addQuestion("radio")}>
          Add Radio Question
        </button>
        <button className="addtextquestion" onClick={() => addQuestion("checkbox")}>
          Add Checkbox Question
        </button>

        {questions.map((question, index) => (
          <div key={index} className="question-box">
            <div onClick={() => toggleQuestionVisibility(index)}>
              <label>Question {index + 1}</label>
            </div>
            {expandedQuestion === index && (
              <div>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(index, "text", e.target.value)}
                />
                {question.type === "text" && (
                  <>
                    <label>Correct Answer</label>
                    <input
                      type="text"
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                    />
                    <label>Points for Correct Answer</label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => updateQuestion(index, "points", Number(e.target.value))}
                    />
                  </>
                )}
                {(question.type === "radio" || question.type === "checkbox") && (
                  <>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="option-box">
                        <label>Option {optionIndex + 1}</label>
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) =>
                            updateOption(index, optionIndex, "text", e.target.value)
                          }
                        />
                        <label>Score</label>
                        <input
                          type="number"
                          value={option.score}
                          onChange={(e) =>
                            updateOption(index, optionIndex, "score", Number(e.target.value))
                          }
                        />
                      </div>
                    ))}
                    <button className="addtextquestion" onClick={() => addOption(index)}>
                      Add Option
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        <button className="addtextquestion" onClick={handleSaveQuiz}>
          Save Quiz
        </button>
      </div>
    </div>
  );
};

export default CreateQuiz;
