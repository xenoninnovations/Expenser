import React, { useState } from 'react'
import dots from "../../images/dots.svg";
import Navbar from "../../components/NavBar/NavBar";
import { FaPen, FaTrash } from "react-icons/fa";

function Users() {
    // Dummy array of 4 people
    const [usersData, setUsersData] = useState([
        { id: 1, firstName: "John", lastName: "Doe", role: "admin" },
        { id: 2, firstName: "Jane", lastName: "Smith", role: "guest" },
        { id: 3, firstName: "Michael", lastName: "Johnson", role: "editor" },
        { id: 4, firstName: "Emily", lastName: "Williams", role: "guest" }
    ]);

    const handleRoleChange = (userId, newRole) => {
        setUsersData(usersData.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
        ));
    };

    return (
        <div className="page">
            <Navbar />
            <div className="page-content">
                <div className="header">
                    <h3>User roles and privileges</h3>
                    <img src={dots} alt="dots" className="dots" />
                </div>

                <div className="table-container">
                    <div className="table-header rev">
                        <div className="rev-spaced">
                            <span className="yellow-bar rev"></span>
                            <h2 className="table-title">Users</h2>
                        </div>
                    </div>
                    <table className="global-table">
                        <thead>
                            <tr>
                                {[
                                    "First Name",
                                    "Last Name",
                                    "Roles",
                                    "Actions",
                                ].map((head) => (
                                    <th key={head}>{head} ⬍</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {usersData.length > 0 ? (
                                usersData.map((user) => (
                                    <tr key={user.id} className="table-row">
                                        <td>{user.firstName}</td>
                                        <td>{user.lastName}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                style={{
                                                    padding: "8px 12px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ddd",
                                                    fontSize: "14px",
                                                    cursor: "pointer",
                                                    backgroundColor: "#fff"
                                                }}
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="guest">Guest</option>
                                                <option value="editor">Editor</option>
                                            </select>
                                        </td>
                                        <td>
                                            <FaPen
                                                className="icon edit-icon"
                                                onClick={() => console.log("Edit user:", user.id)}
                                            />
                                            <FaTrash
                                                className="icon delete-icon"
                                                onClick={() => console.log("Delete user:", user.id)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No users available...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Users