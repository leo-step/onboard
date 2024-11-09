import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';


const GitHubUrlForm: React.FC = () => {
    const [url, setUrl] = useState<string>("");
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [buttonText, setButtonText] = useState<string>("Submit");
    const navigate = useNavigate();

    const githubApiRegex = /^https:\/\/(www\.)?github\.com\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)$/;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
        setIsValid(null); // Reset validity check on input change
        setErrorMessage("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setButtonText("Loading...");
        const match = url.match(githubApiRegex);
        if (!match) {
            setIsValid(false);
            setErrorMessage("Please enter a valid GitHub repository URL.");
            setButtonText("Submit");
            return;
        }

        const [_, __, username, repository] = match; // Extract username and repository from URL
        const apiUrl = `https://api.github.com/repos/${username}/${repository}`;

        try {
            const response = await axios.get(apiUrl);
            if (response.status === 200) {
                const uitHubURL = url.substring(0, 8) + "u" + url.substring(9, url.length);
                try {
                    console.log(uitHubURL);
                    const backend_response = await axios.post('http://localhost:6001/api/initialize', {"url": uitHubURL});
                    if(backend_response.status == 200){
                        navigate("/quiz");
                        setButtonText("Submit");
                    }
                }
                catch (error){
                    setIsValid(false);
                    console.log(error);
                    setErrorMessage("The server isn't running right now");
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setButtonText("Submit");
                setIsValid(false);
                setErrorMessage("GitHub repository not found (404).");
            } else {
                setIsValid(false);
                setButtonText("Submit");
                setErrorMessage("An error occurred while checking the repository.");
            }
        }
    };

    return (
        <div>
            <h2 className="lp-text">Please Enter Valid GitHub URL Below To Get Started</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    GitHub URL:
                    <input
                        className="lp-form"
                        type="url"
                        value={url}
                        onChange={handleChange}
                        placeholder="https://github.com/username/repository"
                        required
                    />
                </label>
                <button type="submit">{buttonText}</button>
            </form>
            {isValid === false && (
                <p style={{ color: "red" }}>{errorMessage}</p>
            )}
        </div>
    );
};

export default GitHubUrlForm;
