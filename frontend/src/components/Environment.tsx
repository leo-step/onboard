import React, { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";
import axios from "axios";
import Swal from "sweetalert2";
import { uit } from "./Global_States";
import { useAtomValue } from "jotai";

interface EnvironmentProps {
  question: string[];
  questionId: number;
  setAllCorrect: (value: boolean) => void; // New prop for setting correctness
  setSubmission: (value: InputsState) => void;
}

type InputsState = {
  [key: number]: string;
};

type ResultsMap = {
  [key: number]: boolean;
};

const Environment: React.FC<EnvironmentProps> = ({ question, questionId, setAllCorrect, setSubmission}) => {
  const [inputs, setInputs] = useState<InputsState>({});
  const [tempInputs, setTempInputs] = useState<InputsState>({});
  const [inputStyles, setInputStyles] = useState<{ [key: number]: string }>({});
  const [disabledInputs, setDisabledInputs] = useState<{ [key: number]: boolean }>({});
  const uitURL = useAtomValue(uit);


  // Load inputs from localStorage when component mounts
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`question-${questionId}`);
    if (savedAnswers) {
      setInputs(JSON.parse(savedAnswers));
      setTempInputs(JSON.parse(savedAnswers));
    }
  }, [questionId]);

  // Save inputs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`question-${questionId}`, JSON.stringify(inputs));
  }, [inputs, questionId]);

  // Handle input changes
  const handleTempInputChange = (index: number, value: string) => {
    setTempInputs((prev) => ({ ...prev, [index]: value }));
  };

  // Handle results to update input styles
  const handleResults = (data: ResultsMap) => {
    const updatedStyles: { [key: number]: string } = {};
    const updatedDisabled: { [key: number]: boolean } = {};
    let numTrue = 0;
  
    Object.keys(data).forEach((index) => {
      const idx = parseInt(index);
      if (data[idx]) {
        // Correct input: green halo
        updatedStyles[idx] = "0 0 10px 3px rgba(0, 255, 0, 0.7)"; // Green glow
        updatedDisabled[idx] = true;
        numTrue += 1;
      } else {
        // Incorrect input: red halo
        updatedStyles[idx] = "0 0 10px 3px rgba(255, 0, 0, 0.7)"; // Red glow
        updatedDisabled[idx] = false;
      }
    });
  
    setInputStyles(updatedStyles);
    setDisabledInputs(updatedDisabled);
  
    // If all are correct, show a success message
    if (numTrue === Object.keys(data).length) {
      Swal.fire({
        title: "Good job!",
        text: "All tests passed.",
        icon: "success",
      });
      setAllCorrect(true);
    }
  };
  

  // Handle form submission
  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    // Save the current inputs
    setInputs({ ...tempInputs });
    setSubmission(tempInputs); // Update submission in Quiz
    console.log("Submitted answers:", tempInputs);
    console.log(questionId);
    console.log(uitURL)

    try {
      // Prepare the data to send
      const user_response = {
        question_number: questionId,
        submission: tempInputs,
        url: uitURL,
      };

      // Send the data via a POST request
      axios.post("http://localhost:6001/api/solution", user_response).then((res) => {
        console.log("Server response:", res.data);
        handleResults(res.data);
        console.log(res.data)
      });
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };

  // Function to render the question with inputs and highlighted code
  const renderHighlightedCode = () => {
    let inputIndex = 0;

    return question.map((part, index) => {
      const inputMatch = part.match(/Input\((\d+)\)/);
    
      if (inputMatch) {
        const inputLength = parseInt(inputMatch[1], 10);
        const currentIndex = index;
        const boxShadowStyle = inputStyles[currentIndex] || "none";
    
        return (
          <input
            key={currentIndex}
            type="text"
            value={tempInputs[currentIndex] || ""}
            onChange={(e) => handleTempInputChange(currentIndex, e.target.value)}
            maxLength={inputLength}
            style={{
              width: `${inputLength * 10}px`,
              fontFamily: "monospace",
              fontSize: "16px",
              margin: "0 5px",
              padding: "5px",
              borderRadius: "5px",
              outline: "none",
              backgroundColor: "#1e1e1e",
              color: "#f8f8f2",
              border: "1px solid #3a3a3a",
              boxShadow: boxShadowStyle, // Apply the box shadow here
            }}
            disabled={disabledInputs[currentIndex] || false}
          />
        );
      } else {
        const highlightedPart = Prism.highlight(part, Prism.languages.python, "python");
        return <span key={index} dangerouslySetInnerHTML={{ __html: highlightedPart }} />;
      }
    });
    
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Code container with inputs */}
      <div
        className="code-container"
        style={{
          fontFamily: "monospace",
          fontSize: "16px",
          border: "1px solid #ddd",
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: "#282c34",
          color: "#f8f8f2",
          whiteSpace: "pre-wrap",
          textAlign: "left",
          lineHeight: "1.5",
          wordBreak: "break-word",
          marginBottom: "20px",
          height: "600px",
          width: "900px",
          overflowY: "auto",
        }}
      >
        {renderHighlightedCode()}
      </div>

      {/* Submit button */}
      <div className="submit-container">
        <button onClick={handleSubmit} className="button">
          Submit
        </button>
      </div>
    </div>
  );
};

export default Environment;
