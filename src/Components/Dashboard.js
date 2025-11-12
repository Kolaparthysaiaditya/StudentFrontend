import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Dashboard.css";

import Students from "./files/Students";
import Courses from "./files/Courses";
import Enrollment from "./files/Enrollment";
import Marks from "./files/Marks";

function Sidebar({ setdisplay, currentSection, sid, Admin, heading, headingSetter }) {
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

    const handleNavClick = (section, label) => {
        setdisplay(section);
        headingSetter(label);
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
                {heading}
            </h3>
            <ul className="nav nav-pills flex-column mb-auto">
                {navItems.map(({ key, icon, label }) => (
                    <li className="nav-item mb-2" key={key}>
                        <button
                            className={`nav-link w-100 text-start d-flex align-items-center ${currentSection === key ? "active" : "text-light"
                                }`}
                            onClick={() => handleNavClick(key, label)}
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
    const [sidebarHeading, setSidebarHeading] = useState("Dashboard")
    const [display, setdisplay] = useState("home");
    const [user, setUser] = useState({})
    const [count, setcount] = useState()
    const [courses, setCourses] = useState()
    const [enrollments, setEnrollments] = useState()
    const { sid } = useParams()

    useEffect(() => {
        const fetchstudents = async () => {
            try {
                const respons = await axios.get(
                    "http://127.0.0.1:8000/api/get-all-students/"
                )
                setcount(respons.data.total_students)
                setCourses(respons.data.total_courses)
                setEnrollments(respons.data.total_Enrollments)
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
                    <Sidebar 
                        setdisplay={setdisplay} 
                        currentSection={display} 
                        sid={user.Sid} 
                        Admin={user.role} 
                        heading={sidebarHeading}
                        headingSetter={setSidebarHeading}
                    />
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
                            <Sidebar setdisplay={setdisplay} currentSection={display} headingSetter={setSidebarHeading} />
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="col-md-9 col-lg-10 p-4 main-content">

                    {display === "home" && (
                        <div className="row text-center">

                            <h2 className="fw-bold mb-4">Dashboard</h2>

                            <div className="col-md-4 mb-4" onClick={() => {setdisplay("students"); setSidebarHeading("Students")}}>
                                <div className="card shadow-sm stat-card" style={{ minHeight: "250%" }}>
                                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                        <i className="bi bi-people-fill text-primary" style={{fontSize: "10vh"}}></i>
                                        <h5 className="mt-2">Total Students</h5>
                                        <p className="fs-4 text-secondary fw-bold">{count}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4 mb-4" onClick={() => setdisplay("courses")}>
                                <div className="card shadow-sm stat-card" style={{ minHeight: "250%" }}>
                                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                        <i className="bi bi-mortarboard-fill text-primary" style={{fontSize: "10vh"}}></i>
                                        <h5 className="mt-2">Total Courses</h5>
                                        <p className="fs-4 fw-bold text-secondary">{courses}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 mb-4" onClick={() => setdisplay("enrollment")}>
                                <div className="card shadow-sm stat-card" style={{ minHeight: "250%" }}>
                                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                        <i className="bi bi-book-fill text-primary" style={{fontSize: "8vh"}}></i>
                                        <h5 className="mt-2">Total Enrollments</h5>
                                        <p className="fs-4 fw-bold text-secondary">{enrollments}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {display === "students" && (
                        <Students Admin={user.role}/>
                    )}

                    {display === "courses" && (
                        <Courses Admin={user.role}/>
                    )}

                    {display === "enrollment" && (
                        <Enrollment Admin={user.role}/>
                    )}

                    {display === "marks" && (
                        <Marks Admin={user.role}/>
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
