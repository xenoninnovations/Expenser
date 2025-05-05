import React from 'react'
import Navbar from '../components/NavBar/NavBar'
import './assets/styles/home.css'
import './assets/styles/global.css'
import { FaCalculator } from 'react-icons/fa';
import EngagementGraph from '../components/DataVisualization/EngagementGraph';
import Clients from '../components/Clients';

function Home() {
  return (
    <div className='page'>
      <Navbar />

      <div className='page-content'>
        <div className='row1'>
          <div className='col1'>
            <div className='row-pill'>
              <div className='pill'>
                <div className='pill-icon'>
                  <FaCalculator id='icon' />
                </div>

                <div className='pill-text'>
                  <p className='pill-title'>Total Revenue</p>
                  <p className='pill-subtitle'>$100,000</p>
                </div>
              </div>

              <div className='pill'>
                <div className='pill-icon'>
                  <FaCalculator id='icon' />
                </div>

                <div className='pill-text'>
                  <p className='pill-title'>Total Revenue</p>
                  <p className='pill-subtitle'>$100,000</p>
                </div>
              </div>
            </div>

            <div className='row-notifs'>
              <div className='header-notif'>
                <div className='yellow-bar'>

                </div>
                <p className='table-title'>Notifications</p>
              </div>

              <div className='notif-body'>
                <div className='column-notif'>
                  <div className='notif-item'>
                    <div className='notif-icon'></div>Test Notification
                  </div>
                  <div className='notif-item'>
                    <div className='notif-icon'></div>Test Notification
                  </div>
                  <div className='notif-item'>
                    <div className='notif-icon'></div>Test Notification
                  </div>
                </div>

                <div className='column-notif'>
                  <div className='notif-count'>
                    40
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='col2'>
            <EngagementGraph />
          </div>
        </div>

        <div className='row-invoices'>
            <div className='table-container'>
              <div className='table-header'>
                <div className='yellow-bar'>

                </div>
                <p className='table-title'>Latest Invoices</p>
              </div>
              <div className='table-body invoice-overview'>
              <thead id='table-headings'>
              <tr>
                {[
                  "Date",
                  "Client Name",
                  "Amount",
                  "Status",
                  "Download",
                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>
              </div>
            </div>
        </div>

        <div className='row3'>
        <Clients />

        </div>
      </div>
    </div>
  )
}

export default Home