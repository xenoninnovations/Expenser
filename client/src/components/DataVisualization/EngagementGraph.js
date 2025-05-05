import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import '../../pages/assets/styles/home.css';
function EngagementGraph() {
  return (
    <div className='engagement-graph'>
      <div className='header-notif'>
        <div className='yellow-bar'>

        </div>
        <p className='table-title'>Client Engagement</p>
      </div>
      <LineChart
        xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
        series={[
          {
            data: [2, 5.5, 2, 8.5, 1.5, 5],
          },
        ]}
        height={300}
      />
    </div>
  );
}

export default EngagementGraph;
