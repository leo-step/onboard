import React, {useState} from 'react';
import '../App.css';
import GithubForm from './GithubForm';
import logo from "./logo_lp.png";
import { showInfoState } from './Global_States';
import { useAtom } from 'jotai';

function LandingPage(){
    const [showInfo, setShowInfo] = useAtom(showInfoState);
    const changeShowInfo = () => {
        setShowInfo(false);
    }
    return(
        <div className="landing-page">
            <img src={logo} alt="Onboard Logo" className="logo"/>
            <GithubForm />
            {showInfo && (<div className="popup">
                <button className="close-button" onClick={changeShowInfo}>X</button> 
                <text>
                Learning a new codebase is tough-- whether you're a new hire at a company or trying to contribute to an 
                open-source repository, getting used to a new tech stack for the first couple weeks of a project is often confusing. But, what if you could fix this-- what if there was an app to teach you any GitHub repository's tech stack?
                <br/>
                OnBoard is a generative AI-powered development tool that teaches programmers to quickly become contributors to any new 
                codebase-- period. Given any respository, OnBoard generates fill in the blank coding questions on existing code; users
                are interactively guided through these exercises, empowering with the fundamental knowledge of how the libraries and
                functions in their codebase work. For creating exerices, OnBoard strategically selects files from the repository that maximize user learning-- users must complete fill-in-the-blanks for at least 10 files to finish their training. 
                <br/>
                Users are asked to fill-in-the-blanks on existing code in a GitHub repository; every time our 
                program is run, our develpment tool generates completely new questions for the user; for each file the user can get up to 7 hints.
                <br/>
                To get started, enter any public GitHub repository above - happy learning!
                </text>
            </div>)}
        </div>
    );
}

export default LandingPage