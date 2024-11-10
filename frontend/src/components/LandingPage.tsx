import React from 'react';
import '../App.css';
import GithubForm from './GithubForm';

function LandingPage(){
    const goQuiz = () => {

    }
    return(
        <div className="overlay">
            <div className="landing-page">
                <div className = "lp-heading">Welcome to Onboard!</div>
                <GithubForm />
            </div>
        </div>
    );
}

export default LandingPage