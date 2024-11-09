import React, { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";
import axios from "axios";

interface EnvironmentProps {
  question: string[];
  questionId: number;
}

type InputsState = {
  [key: number]: string;
};

const Environment: React.FC<EnvironmentProps> = ({ question, questionId }) => {
  const [inputs, setInputs] = useState<InputsState>({});
  const [tempInputs, setTempInputs] = useState<InputsState>({});

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

  // Handle form submission
  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  
    // Save the current inputs
    setInputs({ ...tempInputs });
    console.log("Submitted answers:", tempInputs);
  
    try {
      // Prepare the data to send
      const user_response = {
        question_number: questionId,
        submission: tempInputs
      };
  
      // Send the data via a POST request
      axios.post("http://localhost:6001/api/solution", user_response).then((res) => {
        console.log("Server response:", res.data);
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
        const currentIndex = inputIndex; // Capture the current index
        inputIndex++;

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
              padding: "2px",
              backgroundColor: "#1e1e1e",
              color: "#f8f8f2",
              border: "1px solid #ccc"
            }}
          />
        );
      } else {
        // Highlight non-input parts using Prism
        const highlightedPart = Prism.highlight(
          part,
          Prism.languages.python,
          "python"
        );
        return (
          <span
            key={index}
            dangerouslySetInnerHTML={{ __html: highlightedPart }}
          />
        );
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
          overflowY: "auto"
        }}
      >
        {renderHighlightedCode()}
      </div>

      {/* Submit button */}
      <div className="submit-container">
        <button onClick={handleSubmit} className="button-right-arrow">
          Submit
        </button>
      </div>
    </div>
  );
};

export default Environment;
