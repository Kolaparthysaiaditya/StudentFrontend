import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Dashboard.css";

import Students from "./files/Students";

function Sidebar({ setdisplay, currentSection, sid, Admin }) {
    const nav = useNavigate()
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const closeOffcanvas = () => {
        const offcanvasElement = document.getElementById("mobileSidebar");
        const offcanvas = window.bootstrap?.Offcanvas?.getInstance(offcanvasElement);
        if (offcanvas) offcanvas.hide();
    };

    const handleNavClick = (section) => {
        setdisplay(section);
        if (isSmallScreen) closeOffcanvas(); // ✅ only close if small screen
    };

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        nav("/")
    };

    const navItems = [
        { key: "home", icon: "bi bi-house-door-fill", label: "Home" },
        { key: "students", icon: "bi bi-person-fill", label: "Students" },
        { key: "courses", icon: "bi bi-journal-text", label: "Courses" },
        { key: "enrollment", icon: "bi bi-mortarboard-fill", label: "Enrollments" },
    ];

    if (Admin === "Admin") {
        navItems.push({ key: "marks", icon: "bi bi-tag-fill", label: "Marks" });
    }
    navItems.push({ key: "users", icon: "bi bi-people-fill", label: "Users" });

    return (
        <div className="sidebar d-flex flex-column p-3 sticky-top">
            <p className="text-end m-0 d-sm-block d-md-none">
                <button
                    type="button"
                    className="btn-close btn-close-white"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
            </p>
            <h3 className="text-warning fw-bold text-center mb-3 mt-md-3 mt-lg-5">
                Dashboard
            </h3>
            <ul className="nav nav-pills flex-column mb-auto">
                {navItems.map(({ key, icon, label }) => (
                    <li className="nav-item mb-2" key={key}>
                        <button
                            className={`nav-link w-100 text-start d-flex align-items-center ${currentSection === key ? "active" : "text-light"
                                }`}
                            onClick={() => handleNavClick(key)}
                            // ✅ Conditionally include data-bs-dismiss only for small devices
                            {...(isSmallScreen ? { "data-bs-dismiss": "offcanvas" } : {})}
                        >
                            <i className={`${icon} me-2 fs-5`}></i>
                            {label}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="mt-auto mb-5">
                <small className="text-white-75 d-block mb-2 text-center">
                    {sid}, {Admin}
                </small>
                <button className="btn btn-sm btn-purple w-100" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

function Dashboard() {
    const [display, setdisplay] = useState("home");
    const [user, setUser] = useState({})
    const [allstudents, setallstudents] = useState([])
    const [count, setcount] = useState()
    const { sid } = useParams()

    useEffect(() => {
        const fetchstudents = async () => {
            try {
                const respons = await axios.get(
                    "http://127.0.0.1:8000/api/get-all-students/"
                )
                setallstudents(respons.data.students)
                setcount(respons.data.total_students)
            } catch (error) {
                console.error("Error fetching student:", error.response?.data || error.message);
            }
        };
        fetchstudents()
    }, []);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const token = localStorage.getItem("access");
                const res = await axios.get(
                    `http://127.0.0.1:8000/api/get-student-by/${sid}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setUser(res.data);
                console.log("Fetched user:", res.data);
            } catch (error) {
                console.error("Error fetching student:", error.response?.data || error.message);
            }
        };

        fetchStudent();
    }, [sid]);

    return (
        <div className="dashboard-container">
            <div className="row g-0">
                {/* Sidebar for medium & large screens */}
                <div className="col-md-3 col-lg-2 sidebar-container d-none d-md-block">
                    <Sidebar setdisplay={setdisplay} currentSection={display} sid={user.Sid} Admin={user.role} />
                </div>

                {/* Toggle button + offcanvas sidebar for small screens */}
                <div className="d-md-none">
                    <button
                        className="btn btn-warning m-3"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#mobileSidebar"
                        aria-controls="mobileSidebar"
                    >
                        <i className="bi bi-list fs-4"></i>
                    </button>

                    <div
                        className="offcanvas offcanvas-start bg-dark text-light"
                        tabIndex="-1"
                        id="mobileSidebar"
                        aria-labelledby="mobileSidebarLabel"
                    >
                        <div className="offcanvas-body p-0">
                            <Sidebar setdisplay={setdisplay} currentSection={display} />
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="col-md-9 col-lg-10 p-4 main-content">

                    {display === "home" && (
                        <div className="row text-center">

                            <h2 className="fw-bold mb-4">Dashboard</h2>

                            <div className="col-md-4 mb-4" onClick={() => setdisplay("students")}>
                                <div className="card shadow-sm stat-card" style={{ minHeight: "250%" }}>
                                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                        <i className="bi bi-people-fill text-b;ue fs-1 text-primary"></i>
                                        <h5 className="mt-2">Total Students</h5>
                                        <p className="fs-4 text-secondary fw-bold">{count}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4 mb-4" onClick={() => setdisplay("courses")}>
                                <div className="card shadow-sm stat-card" style={{ minHeight: "250%" }}>
                                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                        <i className="bi bi-mortarboard fs-1 text-success"></i>
                                        <h5 className="mt-2">Total Courses</h5>
                                        <p className="fs-4 fw-bold">10</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 mb-4" onClick={() => setdisplay("enrollment")}>
                                <div className="card shadow-sm stat-card" style={{ minHeight: "250%" }}>
                                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                        <i className="bi bi-book fs-1 text-info"></i>
                                        <h5 className="mt-2">Total Enrollments</h5>
                                        <p className="fs-4 fw-bold">3</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {display === "students" && (
                        <Students/>
                    )}

                    {display === "courses" && (
                        <h1>courses</h1>
                    )}

                    {display === "enrollment" && (
                        <h1>enrolement</h1>
                    )}

                    {display === "marks" && (
                        <h1>marks</h1>
                    )}

                    {display === "users" && (
                        <h1>usersF</h1>
                    )}

                </div>
            </div>
        </div>
    );
}

export default Dashboard;
