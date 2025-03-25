import React, { useState, useEffect } from 'react';
import { PublicClientApplication, LogLevel } from "@azure/msal-browser";
import { db } from "../../config";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import Navbar from "../NavBar/NavBar";
import "../../pages/assets/styles/global.css";
import "./EmailViewer.css";

const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
        authority: "https://login.microsoftonline.com/common",
        redirectUri: "https://expenser-2335.web.app"
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
    system: {	
        loggerOptions: {	
            loggerCallback: (level, message, containsPii) => {	
                if (containsPii) {		
                    return;		
                }		
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }	
            }	
        }	
    }
};

const loginRequest = {
    scopes: ["User.Read", "Mail.Read", "Mail.Send", "offline_access"]
};

const msalInstance = new PublicClientApplication(msalConfig);

function EmailViewer() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initializeMsal = async () => {
            try {
                await msalInstance.initialize();
                // Handle the response from auth redirect
                await msalInstance.handleRedirectPromise();
                
                // Check if user is already signed in
                const accounts = msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    msalInstance.setActiveAccount(accounts[0]);
                    setIsAuthenticated(true);
                    await fetchEmails();
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
            const response = await msalInstance.loginPopup(loginRequest);
            msalInstance.setActiveAccount(response.account);
            
            // Store the account info in Firestore
            await addDoc(collection(db, 'users'), {
                uid: response.account.username,
                email: response.account.username,
                createdAt: new Date().toISOString()
            });

            setIsAuthenticated(true);
            await fetchEmails();
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to login with Microsoft account. Error: ' + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await msalInstance.logoutPopup({
                postLogoutRedirectUri: window.location.origin,
            });
            setIsAuthenticated(false);
            setEmails([]);
        } catch (error) {
            console.error('Logout error:', error);
            setError('Failed to logout. Please try again.');
        }
    };

    const getAccessToken = async () => {
        try {
            const account = msalInstance.getActiveAccount();
            if (!account) {
                throw new Error('No active account! Please sign in.');
            }
            
            const response = await msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: account
            });
            
            return response.accessToken;
        } catch (error) {
            if (error.name === "InteractionRequiredAuthError") {
                return msalInstance.acquireTokenPopup(loginRequest)
                    .then(response => {
                        return response.accessToken;
                    });
            }
            throw error;
        }
    };

    const fetchEmails = async () => {
        setLoading(true);
        setError(null);

        try {
            const accessToken = await getAccessToken();
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
            setError('Failed to fetch emails: ' + error.message);
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