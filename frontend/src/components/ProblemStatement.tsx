import React, { useState } from "react";
import axios from "axios";

interface ProblemStatementProps {
  title: string;
  description: string;
}

interface Hint {
    data: string;
}

// PASS IN PREVIOUS HINTS

// function ProblemStatement(props: ProblemStatementProps) {
const ProblemStatement: React.FC<ProblemStatementProps> = ({ title , description }) => {
    const [hints, setHints] = useState<Hint[]>([]);
    // const { context } = props;
    const [hintText, setHintText] = useState<string>("Show Hint")
    const handleHint = async () => {
        setHintText("Show Another Hint")
        if(hints.length < 5) { 
            try {
                const response = await axios.get("https://your-api-url.com/hint"); // Replace with your actual API URL
                const newHint = { data: "Hint " + (hints.length + 1) + ": " + response.data.hint }; // Assuming the API returns a JSON object with a 'hint' field
                setHints((prevHints) => [...prevHints, newHint]); // Add the new hint to the array
            } catch (error) {
                console.error("Error fetching hint:", error);
                const errorHint = { data: "Hint " + (hints.length + 1) + ": " + "Be better" };
                setHints((prevHints) => [...prevHints, errorHint]);
            }
        } 
        else if(hints.length == 5) {
            const newHint = { data: "Out of Hints!" }; // Assuming the API returns a JSON object with a 'hint' field
            setHints((prevHints) => [...prevHints, newHint]);
        }
    };

    return (
        <div className="code-container">
        <div className="ps-environment">
            {/* <h2 className="ps-header">Problem Statement</h2> */}
            <h2 className="ps-header">{title}</h2>

            {/* <div className="ps-context">{context.data}</div> */}
            <div className="ps-context">{description}</div>

            <button
            className="button-right-arrow" 
            onClick={handleHint}
            style={{ marginBottom: "20px" }}>
                {hintText}
            </button>
            {hints.map((hint, index) => (
                <div key={index} className="ps-hint">{hint.data}</div>
            ))}

        </div>

        </div>
    );
}

export default ProblemStatement;
