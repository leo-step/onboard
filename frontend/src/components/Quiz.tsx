import React, { useEffect, useState } from 'react';
import '../App.css';
import Environment from "./Environment";
import ProblemStatement from "./ProblemStatement";
import Progress from "./Progress";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "./onboard.jpg";
import axios from 'axios';
import { uit } from "./Global_States";
import { useAtomValue } from 'jotai';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

function Quiz() {
  const uitURL = useAtomValue(uit);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [data, setData] = useState([]);
  const [allCorrect, setAllCorrect] = useState(false); // New state to track correctness
  const [submission, setSubmission] = useState<{ [key: number]: string }>({});
  const [solution, setSolution] = useState([]);

  useEffect(() => {
    var data = {
      url: uitURL
    }
    axios.post("http://localhost:6001/api/question", data).then((res) => {
      setSolution(res.data.map((item: { lines: string; }) => item.lines));
      setData(res.data);
    });
  }, [])

  const goPrev = () => {
    if(currentQuestionIndex > 0){
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  const goNext = () => {
    if(currentQuestionIndex < data.length - 1){
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAllCorrect(false); 
    }

    if (currentQuestionIndex == data.length - 1){
      // celebratory page
      // Trigger confetti animation
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Display SweetAlert popup
      Swal.fire({
        title: "Congratulations!",
        text: "You've completed all the questions!",
        icon: "success",
        confirmButtonText: "Awesome!",
        background: "#f0f0f0",
        customClass: {
          popup: "celebration-popup"
        }
      });
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
          <button className="button-left-arrow" onClick={goPrev}  style={{padding: '5px 15px', fontSize: '1em' }} disabled> prev </button>
          <button className="button-right-arrow" onClick={goNext}  style={{ padding: '5px 15px', fontSize: '1em'}} disabled={!allCorrect} > next </button>
        </div>
      </div>

      {/* Problem Statement Section */}
      <div id="left">
        <ProblemStatement key={currentQuestionIndex} title={currentQuestion.title} descriptions={currentQuestion.descriptions} questionId={currentQuestionIndex} submission={submission} />
      </div>

      {/* Environment Section */}
      <div id="right">
        <Environment  key={currentQuestionIndex} question={currentQuestion.question} solution={solution} questionId={currentQuestionIndex} setAllCorrect={setAllCorrect} setSubmission={setSubmission}/>
      </div>

      {/* Progress Bar at the Bottom */}
      <div id="bottom">
        <Progress progress={((currentQuestionIndex + 1) / data.length) * 100} />
      </div>
    </div>
  );
}

export default Quiz;