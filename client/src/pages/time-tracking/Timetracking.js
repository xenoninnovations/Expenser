import React, { useState, useEffect } from "react";
import Navbar from "../../components/NavBar/NavBar";
import "../assets/styles/global.css";
import "../assets/styles/ExpenseTracker.css";
import { db } from "../../config";
import { CSVLink } from "react-csv";
import { collection, getDocs, addDoc } from "firebase/firestore";
import "../assets/styles/global.css";
import { useNavigate } from "react-router-dom";
import dots from "../../images/dots.svg";
import play from "../../images/play-button.svg";

function Timetracking() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // Time in seconds
  const [tasks, setTasks] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [currentProject, setCurrentProject] = useState([]);
  const [currentTask, setCurrentTask] = useState("");
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [formattedDate, setFormattedDate] =  useState("");

  useEffect(() => {
    const getFormattedDate = () => {
      const now = new Date();
      const day = now.getDate();
      const ordinalSuffix = ["st", "nd", "rd"][(day % 10) - 1] || "th";
      const formatted = now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).replace(/\b(\d{1,2})\b/, `${day}${ordinalSuffix}`);
      setFormattedDate(formatted);
    };

    getFormattedDate();
  }, []); // Run only once when the component mounts

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
    if (currentTask.trim() === "") {
      alert("Please enter a task name!");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "Tasks"), {
        TaskName: currentTask,
        ProjectName: projectName,
        // CurrentProject: currentProject,
        clientName: clientName,
        Date: formattedDate,
        Duration: time,
      });
    } catch (error) {
      console.log(error);
    }
    // const newTask = {
    //   name: currentTask,
    //   projectName: projectName,
    //   duration: time,
    // };

    // setTasks((prevTasks) => [...prevTasks, newTask]);
    // setTasks(newTask);
    setCurrentTask("");
    handleReset();
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
          <table className="section-table">
            <thead className="section-header">
              <tr className="header-row">
                {[
                  "Day",
                  "Project Name",
                  "Task Description",
                  "Client Name",
                  "Time Tracked",
                  "Time Control"
                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>
            <tbody className="table-body">
              <div style={{ cursor: "pointer" }} className="date-display">
                <span>
                    {formattedDate}
                </span>
              </div>

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
                placeholder="Task Name"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
              />

              <input
                type="text"
                className="task-input"
                placeholder="Project Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />

              <div className="timer-display">{formatTime(time)}</div>

              <div className="timer">
                <div className="buttons-row">
                  <div
                    onClick={handleStartStop}
                    style={{ cursor: "pointer" }}
                    className="timer-button"
                  >
                    <span>{isRunning ? "Pause" : "Start"}</span>
                  </div>

                  <div
                    onClick={handleSaveTask}
                    disabled={time === 0}
                    className="timer-button"
                  >
                    <span>Save</span>
                  </div>
                </div>
              </div>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Timetracking;
