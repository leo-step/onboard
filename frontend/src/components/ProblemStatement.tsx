import React, { useState } from "react";
import axios from "axios";
import Spinner from 'react-bootstrap/Spinner';

interface ProblemStatementProps {
  title: string;
  descriptions: string[]; // Array of descriptions passed as a prop
  submission: { [key: number]: string };
  questionId: number;

}

interface Hint {
    data: string;
}

// PASS IN PREVIOUS HINTS

// function ProblemStatement(props: ProblemStatementProps) {
const ProblemStatement: React.FC<ProblemStatementProps> = ({ title , descriptions , questionId , submission }) => {
    const [loading, setLoading] = useState<boolean>(false); // New loading state

    const [hints, setHints] = useState<Hint[]>([]);
    // const { context } = props;
    const [hintText, setHintText] = useState<string>("Show Hint")
    const handleHint = async () => {
        setHintText("Show Another Hint");

        if (hints.length < 5) {
          try {
            // Prepare the data to send
            const payload = {
              question_number: questionId,
              submission: submission,
              previous_hints: hints.map((hint) => hint.data),
              url: "https://uithub.com/TigerAppsOrg/PrincetonCourses",
            };
      
            // Log the payload being sent
            console.log("Sending hint request with payload:", payload);
      
            // Send data to the API endpoint
            setLoading(true);
            const response = await axios.post("http://localhost:6001/api/hint", payload);
      
            // Check if response and hint data are valid
            if (response.data) {
              // Extract the hints from the response object
              const hintsArray = Object.values(response.data);
              console.log("Received hints:", hintsArray);
            
              // Add each new hint to the hints state
              hintsArray.forEach((hintText, index) => {
                const newHint = { data: `Hint ${hints.length + 1 + index}: ${hintText}` };
                setHints((prevHints) => [...prevHints, newHint]);
                setLoading(false);
              });
            } else {
              console.error("Invalid response format:", response.data);
              const errorHint = { data: `Hint ${hints.length + 1}: No valid hint received` };
              setHints((prevHints) => [...prevHints, errorHint]);
              setLoading(false);

            }
          } catch (error) {
            console.error("Error fetching hint:", error);
            const errorHint = { data: `Hint ${hints.length + 1}: Be better` };
            setHints((prevHints) => [...prevHints, errorHint]);
            setLoading(false);

          }
        } else {
            setHintText("Out of hints!");
            setLoading(false);

        }
      };
      

      return (
        <div className="code-container">
          <div className="ps-environment">
            <h2 className="ps-header">{title}</h2>
            {/* Render the existing descriptions */}
            {descriptions && descriptions.length > 0 && (
              <ol className="descriptions">
                {descriptions.map((desc, index) => (
                  <li key={index} className="description-item">
                    {desc}
                  </li>
                ))}
              </ol>
            )}
            <button
              className="button-right-arrow"
              onClick={handleHint}
              style={{ marginBottom: "20px" }}
              disabled={loading}
            >
              {loading ? "Loading..." : hintText}
            </button>
      
            {/* Loading Overlay */}
            {loading && (
              <div className="loading-overlay">
                <Spinner animation="border" role="status" className="spinner">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
      
            {hints.map((hint, index) => (
              <div key={index} className="ps-hint">
                {hint.data}
                <br />
              </div>
            ))}
          </div>
        </div>
      );
}

export default ProblemStatement;
