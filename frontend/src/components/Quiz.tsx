import React, { useEffect, useState } from 'react';
import '../App.css';
import Environment from "./Environment";
import ProblemStatement from "./ProblemStatement";
import Progress from "./Progress";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "./onboard.jpg";
import axios from 'axios';


function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.post("http://localhost:6001/api/question").then((res) => {
      setData(res.data);
    });
  }, [])

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const goPrev = () => {
    if(currentQuestionIndex > 0){
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  const goNext = () => {
    if(currentQuestionIndex < data.length - 1){
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  const currentQuestion = data[currentQuestionIndex] as any;

  console.log(currentQuestion)

  if (!currentQuestion) {
    return <div></div>
  }

  return (
    <div className="App">
      {/* Pagination at the top */}
      <div id = "top">
      <img src={logo} alt="Onboard Logo" className="logo-image"/>
        <div className="pagination-container" style={{ textAlign: 'center', marginTop: '10px' }}>
          <button className="button-left-arrow" onClick={goPrev}  style={{padding: '5px 15px', fontSize: '1em' }}> prev </button>
          <button className="button-right-arrow" onClick={goNext}  style={{ padding: '5px 15px', fontSize: '1em'}}> next </button>
        </div>
      </div>

      {/* Problem Statement Section */}
      <div id="left">
        <ProblemStatement key={currentQuestionIndex} title={currentQuestion.title} description={currentQuestion.description} />
      </div>

      {/* Environment Section */}
      <div id="right">
        <Environment  key={currentQuestionIndex} question={currentQuestion.question} questionId={currentQuestionIndex}  />
      </div>

      {/* Progress Bar at the Bottom */}
      <div id="bottom">
        <Progress progress={((currentQuestionIndex + 1) / data.length) * 100} />
      </div>
    </div>
  );
}

export default Quiz;