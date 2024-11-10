import React from 'react';
import '../App.css';
import GithubForm from './GithubForm';
import logo from "./logo_lp.png";

function LandingPage(){
    const goQuiz = () => {

    }
    return(
        <div className="landing-page">
            <img src={logo} alt="Onboard Logo" className="logo"/>
            <GithubForm />
        </div>
    );
}

export default LandingPage