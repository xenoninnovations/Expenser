import React, { useState, useEffect } from 'react';
import { PublicClientApplication } from "@azure/msal-browser";
import { db } from "../../config";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import Navbar from "../NavBar/NavBar";
import "../../pages/assets/styles/global.css";
import "./EmailViewer.css";

const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

function EmailViewer() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Initialize MSAL
        const initializeMsal = async () => {
            try {
                await msalInstance.initialize();
                // Check if user is already signed in
                const accounts = msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    setIsAuthenticated(true);
                    await fetchEmails(accounts[0].accessToken);
                }
            } catch (error) {
                console.error('MSAL initialization error:', error);
                setError('Failed to initialize Microsoft authentication');
            }
        };

        initializeMsal();
    }, []);

    const handleLogin = async () => {
        try {
            // Check if there's already an interaction in progress
            if (msalInstance.getActiveAccount()) {
                return;
            }

            const loginRequest = {
                scopes: ["Mail.Read", "Mail.Send", "offline_access"]
            };

            const response = await msalInstance.loginPopup(loginRequest);
            
            // Store the access token in Firestore
            const userDoc = await addDoc(collection(db, 'users'), {
                uid: response.account.username,
                email: response.account.username,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                createdAt: new Date().toISOString()
            });

            setIsAuthenticated(true);
            await fetchEmails(response.accessToken);
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to login with Microsoft account. Please try again.');
        }
    };

    const handleLogout = async () => {
        try {
            await msalInstance.logoutPopup();
            setIsAuthenticated(false);
            setEmails([]);
        } catch (error) {
            console.error('Logout error:', error);
            setError('Failed to logout. Please try again.');
        }
    };

    const fetchEmails = async (accessToken) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=10', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch emails');
            }

            const data = await response.json();
            setEmails(data.value);
        } catch (error) {
            console.error('Error fetching emails:', error);
            setError('Failed to fetch emails');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <Navbar />
            <div className="page-content">
                <div className="header">
                    <h3>Email Viewer</h3>
                    {isAuthenticated && (
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    )}
                </div>

                <div className="email-viewer">
                    {!isAuthenticated ? (
                        <button onClick={handleLogin} className="login-button">
                            Connect Microsoft Account
                        </button>
                    ) : (
                        <div className="email-list">
                            {loading && <div className="loading">Loading emails...</div>}
                            {error && <div className="error">{error}</div>}
                            
                            {emails.map((email) => (
                                <div key={email.id} className="email-item">
                                    <h3>{email.subject}</h3>
                                    <p>From: {email.from.emailAddress.address}</p>
                                    <p>Received: {new Date(email.receivedDateTime).toLocaleString()}</p>
                                    <p>{email.bodyPreview}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EmailViewer; 