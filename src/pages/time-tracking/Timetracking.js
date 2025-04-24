import React, { useState, useEffect } from "react";
import Navbar from "../../components/NavBar/NavBar";
import "../assets/styles/global.css";
import "../assets/styles/ExpenseTracker.css";
import { db } from "../../config";
import { collection, getDocs, addDoc, query, orderBy, limit } from "firebase/firestore";
import "../assets/styles/global.css";
import dots from "../../images/dots.svg";

function Timetracking() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [currentTask, setCurrentTask] = useState("");
  const [clientName, setClientName] = useState("");

  // Fetch recent tasks
  useEffect(() => {
    const fetchRecentTasks = async () => {
      try {
        const tasksRef = collection(db, "Tasks");
        const q = query(tasksRef, orderBy("timestamp", "desc"), limit(5));
        const querySnapshot = await getDocs(q);
        const tasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentTasks(tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchRecentTasks();
  }, []);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const handleSaveTask = async () => {
    if (currentTask.trim() === "" || projectName.trim() === "" || clientName.trim() === "") {
      alert("Please fill in all fields!");
      return;
    }

    try {
      const now = new Date();
      await addDoc(collection(db, "Tasks"), {
        taskName: currentTask,
        projectName: projectName,
        clientName: clientName,
        date: now,
        timestamp: now.getTime(),
        duration: time, // in seconds
        month: now.getMonth(), // 0-11 for Jan-Dec
        year: now.getFullYear()
      });

      // Refresh the recent tasks list
      const tasksRef = collection(db, "Tasks");
      const q = query(tasksRef, orderBy("timestamp", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentTasks(tasks);

      // Reset form
      setCurrentTask("");
      setProjectName("");
      setClientName("");
      handleReset();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    }
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="header">
          <h3>Time Tracker</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>

        <div className="section-container">
          <div className="time-tracking-form">
            <div className="form-row">
              <input
                type="text"
                className="task-input"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />

              <input
                type="text"
                className="task-input"
                placeholder="Task Description"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
              />

              <input
                type="text"
                className="task-input"
                placeholder="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="timer-section">
              <div className="timer-display">{formatTime(time)}</div>
              <div className="timer-controls">
                <button
                  onClick={handleStartStop}
                  className={`timer-button ${isRunning ? 'running' : ''}`}
                >
                  {isRunning ? "Pause" : "Start"}
                </button>
                <button
                  onClick={handleSaveTask}
                  disabled={time === 0}
                  className="timer-button save"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="recent-tasks">
            <h4>Recent Tasks</h4>
            <table className="section-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Task</th>
                  <th>Client</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{new Date(task.date.seconds * 1000).toLocaleDateString()}</td>
                    <td>{task.projectName}</td>
                    <td>{task.taskName}</td>
                    <td>{task.clientName}</td>
                    <td>{formatTime(task.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timetracking;
