import React, { useState, useEffect } from 'react';
import Navbar from '../components/NavBar/NavBar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config';
import './assets/styles/home.css';
import './assets/styles/global.css';
import { FaDownload } from 'react-icons/fa';

// Sample invoice data
const sampleInvoices = [
  { date: '2024-07-10', clientName: 'Arc Roofing', amount: 2365.00, status: 'Processing' },
  { date: '2024-06-22', clientName: 'Paragon Security', amount: 4235.00, status: 'Past Due' },
  { date: '2024-05-16', clientName: "Ed's Restaurant", amount: 6324.00, status: 'Paid' },
  { date: '2024-04-13', clientName: "Egg Maker's", amount: 2434.00, status: 'Paid' },
  { date: '2024-03-20', clientName: "T's Pizza", amount: 6324.00, status: 'Paid' }
];

function Home() {
  const [stats, setStats] = useState({
    moneyEarned: 4234537.40,
    hoursWorked: 0,
    notifications: [
      { type: 'New Invoice', message: 'New Invoice' },
      { type: 'Past Due', message: 'Client has past due invoice' },
      { type: 'Report', message: 'Monthly Report Available' }
    ]
  });

  const [monthlyHours, setMonthlyHours] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: Array(12).fill(0)
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const tasksRef = collection(db, "Tasks");
        const yearQuery = query(tasksRef, where("year", "==", currentYear));
        const querySnapshot = await getDocs(yearQuery);
        
        // Calculate total hours and monthly distribution
        let totalSeconds = 0;
        const monthlySeconds = Array(12).fill(0);
        
        querySnapshot.docs.forEach(doc => {
          const task = doc.data();
          totalSeconds += task.duration || 0;
          if (task.month !== undefined) {
            monthlySeconds[task.month] += task.duration || 0;
          }
        });

        // Convert seconds to hours for the graph
        const monthlyHoursData = monthlySeconds.map(seconds => Math.round((seconds / 3600) * 100) / 100);
        
        setMonthlyHours(prev => ({
          ...prev,
          data: monthlyHoursData
        }));

        // Update total hours worked
        setStats(prev => ({
          ...prev,
          hoursWorked: Math.round((totalSeconds / 3600) * 100) / 100
        }));

      } catch (error) {
        console.error("Error fetching time data:", error);
      }
    };

    fetchTimeData();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsRef = collection(db, 'clients');
        const clientsSnapshot = await getDocs(clientsRef);
        const clientsList = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients');
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className='page'>
      <Navbar />
      <div className='page-content'>
        <div className="dashboard-header">
          <h1>Hello Fizikes</h1>
          <p>Welcome Back!</p>
        </div>

        <div className="stats-container">
          <div className="stat-card money">
            <div className="stat-icon money-icon">💵</div>
            <div className="stat-info">
              <h3>${stats.moneyEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              <p>Money Earned</p>
            </div>
          </div>
          <div className="stat-card hours">
            <div className="stat-icon hours-icon">⏱️</div>
            <div className="stat-info">
              <h3>{stats.hoursWorked.toLocaleString()} hrs</h3>
              <p>Hours Worked</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="notifications-card">
            <h2>Notifications</h2>
            <div className="notification-count">46</div>
            <ul>
              {stats.notifications.map((notif, index) => (
                <li key={index} className={notif.type.toLowerCase().replace(' ', '-')}>
                  {notif.message}
                </li>
              ))}
            </ul>
          </div>

          <div className="engagement-card">
            <h2>Hours Tracked</h2>
            <div className="chart">
              <div className="chart-placeholder">
                {monthlyHours.data.map((value, index) => {
                  // Calculate percentage for visualization (max 100%)
                  const maxHours = Math.max(...monthlyHours.data);
                  const percentage = maxHours > 0 ? (value / maxHours) * 100 : 0;
                  
                  return (
                    <div 
                      key={index} 
                      className="chart-bar" 
                      style={{ height: `${percentage}%` }}
                      title={`${value} hours`}
                    />
                  );
                })}
              </div>
              <div className="chart-labels">
                {monthlyHours.labels.map(label => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="invoices-card">
            <h2>Latest Invoices</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client Name</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {sampleInvoices.map((invoice, index) => (
                  <tr key={index}>
                    <td>{new Date(invoice.date).toLocaleDateString('en-US', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</td>
                    <td>{invoice.clientName}</td>
                    <td>${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`status ${invoice.status.toLowerCase().replace(' ', '-')}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <button className="download-btn">
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="clients-card">
            <h2>Your clients</h2>
            {loading && <div className="loading">Loading clients...</div>}
            {error && <div className="error">{error}</div>}
            {!loading && !error && (
              <div className="client-avatars">
                {clients.map((client) => (
                  <div key={client.id} className="client-avatar" title={client.name}>
                    <div className="avatar-placeholder">
                      {client.name ? client.name.charAt(0) : '?'}
                    </div>
                    <span className="client-name">{client.name || 'Unnamed Client'}</span>
                  </div>
                ))}
                <div className="add-client-btn">+</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;