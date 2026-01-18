import React, { useState, useEffect } from 'react';
import Navbar from '../../components/NavBar/NavBar';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Client } from '@microsoft/microsoft-graph-client';
import { PublicClientApplication } from '@azure/msal-browser';
import './calendar.css';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    title: '',
    start: '',
    end: '',
    description: '',
  });
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [isOutlookAuthenticated, setIsOutlookAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Microsoft Graph configuration
  const msalConfig = {
    auth: {
      clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.REACT_APP_MICROSOFT_TENANT_ID}`,
      redirectUri: window.location.origin,
    },
  };

  const msalInstance = new PublicClientApplication(msalConfig);

  useEffect(() => {
    // Check for tokens in URL (after OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const tokens = params.get('tokens');
    const error = params.get('error');

    if (tokens) {
      try {
        const parsedTokens = JSON.parse(decodeURIComponent(tokens));
        localStorage.setItem('googleTokens', JSON.stringify(parsedTokens));
        setIsGoogleAuthenticated(true);
        // Remove tokens from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Error parsing tokens:', err);
        setError('Failed to parse authentication tokens');
      }
    }

    if (error) {
      setError(decodeURIComponent(error));
      // Remove error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check authentication status
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/status`, {
        credentials: 'include',
      });
      const data = await response.json();
      setIsGoogleAuthenticated(data.google);
      setIsOutlookAuthenticated(data.outlook);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to initiate Google authentication');
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      setError('Failed to connect to Google Calendar');
    }
  };

  const handleOutlookAuth = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ['Calendars.ReadWrite']
      });
      
      if (loginResponse) {
        setIsOutlookAuthenticated(true);
        // Fetch Outlook calendar events
        const graphClient = Client.init({
          authProvider: (done) => {
            done(null, loginResponse.accessToken);
          }
        });

        const outlookEvents = await graphClient
          .api('/me/events')
          .get();

        // Convert Outlook events to FullCalendar format
        const formattedEvents = outlookEvents.value.map(event => ({
          title: event.subject,
          start: event.start.dateTime,
          end: event.end.dateTime,
          description: event.bodyPreview
        }));

        setEvents(prevEvents => [...prevEvents, ...formattedEvents]);
      }
    } catch (error) {
      console.error('Outlook authentication error:', error);
    }
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo);
    setShowBookingModal(true);
  };

  const handleEventClick = (clickInfo) => {
    if (window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const newEvent = {
      title: bookingDetails.title,
      start: bookingDetails.start,
      end: bookingDetails.end,
      description: bookingDetails.description,
    };

    try {
      // Save event to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        setEvents([...events, newEvent]);
        
        // If Google Calendar is connected, sync the event
        if (isGoogleAuthenticated) {
          await fetch(`${process.env.REACT_APP_API_URL}/events/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(newEvent),
          });
        }

        // If Outlook is connected, sync the event
        if (isOutlookAuthenticated) {
          const graphClient = Client.init({
            authProvider: (done) => {
              done(null, msalInstance.getActiveAccount()?.accessToken);
            }
          });

          await graphClient
            .api('/me/events')
            .post({
              subject: newEvent.title,
              start: {
                dateTime: newEvent.start,
                timeZone: 'UTC'
              },
              end: {
                dateTime: newEvent.end,
                timeZone: 'UTC'
              },
              body: {
                content: newEvent.description,
                contentType: 'text'
              }
            });
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }

    setShowBookingModal(false);
    setBookingDetails({
      title: '',
      start: '',
      end: '',
      description: '',
    });
  };

  return (
    <div className="calendar-page">
      <Navbar />
      <div className="page-content">
        <div className="calendar-container">
          <div className="calendar-header">
            <h1>Calendar</h1>
            <div className="calendar-actions">
              <button 
                className="btn-google" 
                onClick={handleGoogleAuth}
                disabled={isGoogleAuthenticated}
              >
                {isGoogleAuthenticated ? 'Google Calendar Connected' : 'Connect Google Calendar'}
              </button>
              <button 
                className="btn-outlook" 
                onClick={handleOutlookAuth}
                disabled={isOutlookAuthenticated}
              >
                {isOutlookAuthenticated ? 'Outlook Connected' : 'Connect Outlook'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          <div className="calendar-main">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
            />
          </div>
        </div>

        {showBookingModal && (
          <div className="booking-modal">
            <div className="modal-content">
              <h2>Book Appointment</h2>
              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={bookingDetails.title}
                    onChange={(e) => setBookingDetails({...bookingDetails, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start Time:</label>
                  <input
                    type="datetime-local"
                    value={bookingDetails.start}
                    onChange={(e) => setBookingDetails({...bookingDetails, start: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time:</label>
                  <input
                    type="datetime-local"
                    value={bookingDetails.end}
                    onChange={(e) => setBookingDetails({...bookingDetails, end: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={bookingDetails.description}
                    onChange={(e) => setBookingDetails({...bookingDetails, description: e.target.value})}
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Book Appointment</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowBookingModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;