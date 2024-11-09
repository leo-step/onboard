import React, { useEffect, useState } from 'react';
import '../App.css';
import Environment from "./Environment";
import ProblemStatement from "./ProblemStatement";
import Progress from "./Progress";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "./onboard.jpg";
import axios from 'axios';

// const sample_data = [
//   {
//     title: "1. Data Cleaning",
//     description: "Fill in the missing code to clean the dataset.",
//     question: [
//       "def clean_data(df):\n",
//       "    # Remove rows with missing values\n",
//       "    df.dropna(",
//       "Input(15)",
//       ")\n",
//       "    # Reset index after dropping rows\n",
//       "    df.reset_index(inplace=True)\n",
//       "    return df\n",
//       "Input(15)",
//       ")\n",
//       "    # Reset index after dropping rows\n",
//       "    df.reset_index(inplace=True)\n",
//       "    return df\n"
//     ]
//   },
//   {
//     title: "2. Data Analysis",
//     description: "Complete the function to perform basic analysis on a DataFrame.",
//     question: [
//       "def analyze_data(df):\n",
//       "    # Calculate the mean of the 'sales' column\n",
//       "    mean_sales = df['sales'].mean()\n",
//       "    # Filter rows where sales are above average\n",
//       "    filtered_df = df[df['sales'] > ",
//       "Input(10)",
//       "]\n",
//       "    return filtered_df\n"
//     ]
//   },
//   {
//     title: "3. Methodology",
//     description: "Implement the function to interact with the database.",
//     question: [
//       "def get_db_stuff():\n",
//       "    connection = connect_to_db()\n",
//       "    # Execute a query\n",
//       "    result = connection.execute('SELECT * FROM users WHERE age > ', ",
//       "Input(20)",
//       ")\n",
//       "    return result\n",
//       "print(get_db_stuff())"
//     ]
//   }
// ];

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
      <img 
        src={logo} 
        alt="Onboard Logo" 
        style={{
          marginTop: '50px',
          width: "220px",              // Adjusted width to be slightly larger
          height: "70px",              // Adjusted height
          objectFit: "cover",          // Ensures the image fills the container while cropping
          objectPosition: "center",    // Keeps it centered
          display: 'block',
          margin: '0 auto',            // Centers the logo
          transform: 'scale(1.1)',     // Zoom in by 10%
          borderRadius: '8px'          // Optional: Rounds the corners slightly
        }}
      />
        <div className="pagination-container" style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="button-left-arrow" onClick={goPrev}  style={{padding: '5px 15px',fontSize: '1em'}}> prev </button>
          <button className="button-right-arrow" onClick={goNext}  style={{
      padding: '5px 15px',
      fontSize: '1em'
    }}> next </button>
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