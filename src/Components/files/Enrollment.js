import React, { useState, useEffect } from "react";
import axios from "axios";

function Enrollment({ Admin }) {
    const [message, setMessage] = useState({ text: "", type: "" });
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);

    const [selectedEid, setSelectedEid] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("");

    const [totalEnrollments, setTotalEnrollments] = useState(0);
    const [activeEnrollments, setActiveEnrollments] = useState(0);
    const [inactiveEnrollments, setInactiveEnrollments] = useState(0);

    const [formData, setFormData] = useState({
        enrollment_id: "",
        student_id: "",
        course_id: "",
        marks: "",
        remark: "",
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 4;

    // Fetch Data
    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://127.0.0.1:8000/api/get_enrollments/");
            setEnrollments(res.data);

            setTotalEnrollments(res.data.length);
            const active = res.data.filter((e) => e.status === "active" || e.status === "pass").length;
            setActiveEnrollments(active);
            setInactiveEnrollments(res.data.length - active);

        } catch (err) {
            console.error("Error fetching enrollments:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/get_students/");
            setStudents(res.data);
        } catch (err) {
            console.error("Error fetching students:", err);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/get_courses/");
            setCourses(res.data);
        } catch (err) {
            console.error("Error fetching courses:", err);
        }
    };

    useEffect(() => {
        fetchEnrollments();
        fetchStudents();
        fetchCourses();
    }, []);

    // Apply filters
    const filteredEnrollments = enrollments.filter((enr) => {
        const matchSearch =
            enr.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enr.course_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus =
            filterStatus === "" ||
            (filterStatus === "pass" && enr.status === "pass") ||
            (filterStatus === "fail" && enr.status === "fail");

        return matchSearch && matchStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredEnrollments.length / recordsPerPage);
    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRecords = filteredEnrollments.slice(indexOfFirst, indexOfLast);

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    // Add/Edit
    const handleAdd = () => {
        setFormData({
            enrollment_id: "",
            student_id: "",
            course_id: "",
            marks: "",
            remark: "",
        });
        setEditMode(false);
        setShowForm(true);
    };

    const handleEdit = (enr) => {
        setFormData({
            enrollment_id: enr.enrollment_id,
            student_id: enr.student_id,
            course_id: enr.course_id,
            marks: enr.marks || "",
            remark: enr.remark || "",
        });
        setEditMode(true);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`http://127.0.0.1:8000/api/update_enrollment/${formData.enrollment_id}/`, formData);
                setMessage({ text: "Enrollment updated successfully!", type: "success" });
            } else {
                await axios.post("http://127.0.0.1:8000/api/add_enrollment/", formData);
                setMessage({ text: "Enrollment added successfully!", type: "success" });
            }
            setShowForm(false);
            fetchEnrollments();
        } catch (err) {
            console.error("Error saving enrollment:", err);
            setMessage({ text: "Failed to save enrollment", type: "danger" });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/delete_enrollment/${id}/`);
            setMessage({ text: "Enrollment deleted successfully!", type: "success" });
            setDeleteMode(false);
            fetchEnrollments();
        } catch (err) {
            console.error("Error deleting:", err);
            setMessage({ text: "Failed to delete enrollment", type: "danger" });
        }
    };

    if (loading) {
        return <div className="text-center mt-5 text-primary">Loading enrollments...</div>;
    }

    return (
        <div className="container-fluid text-center">
            <h2 className="fw-bold mb-4">Enrollment Info</h2>

            {message.text && (
                <div className={`alert alert-${message.type} fw-bold`}>
                    {message.text}
                    <button
                        className="btn-close float-end"
                        onClick={() => setMessage({ text: "", type: "" })}
                    ></button>
                </div>
            )}

            {/* Search Filters */}
            <div className="bg-green p-2 row g-2 align-items-center">
                <div className="form-floating col-12 col-md-5">
                    <input
                        type="search"
                        className="form-control"
                        id="searchStudentOrCourse"
                        placeholder="search by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <label htmlFor="searchCourse" className="ps-5">
                        search by Student or course
                    </label>
                </div>

                <div className="form-floating col-12 col-md-5">
                    <select
                        className="form-select p-0 ps-5"
                        id="floatingSelectGrid"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">search by status</option>
                        <option value="pass">Activate</option>
                        <option value="fail">Inctivate</option>
                    </select>
                </div>

                <div className="col-12 col-md-2 d-flex gap-2 h-75">
                    <button
                        type="button"
                        className="btn btn-light text-primary w-100"
                        style={{ minHeight: "7.8vh" }}
                        onClick={() => setCurrentPage(1)}
                    >
                        <i className="bi bi-search"></i> search
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary w-100"
                        style={{ minHeight: "7.8vh" }}
                        onClick={() => {
                            setSearchTerm("");
                            setFilterStatus("");
                            setCurrentPage(1);
                        }}
                    >
                        <i className="bi bi-x-circle"></i> clear
                    </button>
                </div>
            </div>

            {Admin === "Admin" && (
                <div className="mt-3 text-md-start text-center">
                    <button className="btn btn-primary" onClick={handleAdd}>
                        + Add New Enrollment
                    </button>
                </div>
            )}

            {/* table */}
            <div className="table-responsive mt-3">
                <table className="table table-secondary align-middle">
                    <thead>
                        <tr>
                            <th className="bg-dark text-light">Enrollment ID</th>
                            <th className="bg-dark text-light">Student</th>
                            <th className="bg-dark text-light">Course</th>
                            <th className="bg-dark text-light">Marks</th>
                            <th className="bg-dark text-light">Remark</th>
                            <th className="bg-dark text-light">Status</th>
                            {Admin === "Admin" && <th className="bg-dark text-light">Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.length > 0 ? (
                            currentRecords.map((enr) => (
                                <tr key={enr.enrollment_id}>
                                    <td>{enr.enrollment_id}</td>
                                    <td>{enr.student_name}</td>
                                    <td>{enr.course_name}</td>
                                    <td>{enr.marks}</td>
                                    <td>{enr.remark || 'No Remark'}</td>
                                    <td className={enr.status === "pass" ? "text-success fw-bold" : "text-danger fw-bold"}>
                                        {enr.status === "pass" ? "Activate" : "Inactivate"}
                                    </td>
                                    {Admin === "Admin" && (
                                        <td>
                                            <button className="btn btn-success me-2" onClick={() => handleEdit(enr)}>
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => {
                                                    setDeleteMode(true);
                                                    setSelectedEid(enr.enrollment_id);
                                                    setSelectedStudent(enr.student_name);
                                                }}
                                            >
                                                Delete
                                            </button>
                                            <button type='button'>
                                                Marks
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={Admin === "Admin" ? 7 : 6}>No enrollments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <nav className="d-flex justify-content-center mt-3">
                <ul className="pagination flex-wrap">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i + 1} className="page-item">
                            <button
                                className={`page-link rounded-4 text-light me-2 ${currentPage === i + 1 ? "active bg-primary" : "bg-dark"}`}
                                onClick={() => goToPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Stats Cards */}
            <div className="row text-center mt-4">
                <div className="col-md-4 mb-4">
                    <div className="shadow-sm bg-white p-4 rounded-4">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <i className="bi bi-people-fill text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Total Enrollments</h5>
                            <p className="fs-4 fw-bold text-secondary">{totalEnrollments}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-4">
                    <div className="shadow-sm bg-white p-4 rounded-4">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <i className="bi bi-check-circle-fill text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Active Enrollments</h5>
                            <p className="fs-4 fw-bold text-secondary">{activeEnrollments}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-4">
                    <div className="shadow-sm bg-white p-4 rounded-4">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <i className="bi bi-x-circle-fill text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Inactive Enrollments</h5>
                            <p className="fs-4 fw-bold text-secondary">{inactiveEnrollments}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>

                    <div className="text-light p-4 rounded-4 shadow-lg" style={{ width: "90%", maxWidth: "400px", backgroundColor: "#1d3557" }}>

                        <button className="btn-close btn-close-white float-end" onClick={() => setShowForm(false)}></button>

                        <h5 className="text-warning fw-bold mb-4">{editMode ? "Edit Enrollment" : "Add Enrollment"}</h5>

                        <form onSubmit={handleSubmit}>
                            <div className="form-floating mb-3">
                                <select className="form-select" value={formData.student_id} onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} required>
                                    <option value="">Select Student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <label>Student</label>
                            </div>
                            <div className="form-floating mb-3">
                                <select className="form-select" value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} required>
                                    <option value="">Select Course</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <label>Course</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Marks"
                                    max={100}
                                    value={formData.marks || ""}
                                    onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                                />
                                <label>Marks</label>
                            </div>
                            <div className="form-floating mb-3">
                                <textarea
                                    className="form-control"
                                    placeholder="Remark"
                                    value={formData.remark || ""}
                                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                                ></textarea>
                                <label>Remark</label>
                            </div>
                            <button type="submit" className="btn btn-primary w-100">{editMode ? "Update" : "Add"}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete modal */}
            {deleteMode && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
                    <div className="text-light p-4 rounded-4 shadow-lg" style={{ width: "90%", maxWidth: "400px", backgroundColor: "#1d3557" }}>
                        <button className="btn-close btn-close-white float-end" onClick={() => setDeleteMode(false)}></button>
                        <h4 className="text-warning mb-3">Delete Enrollment</h4>
                        <p>Are you sure you want to delete enrollment for <b>{selectedStudent}</b>?</p>
                        <button className="btn btn-danger w-100" onClick={() => handleDelete(selectedEid)}>
                            Delete Enrollment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Enrollment;
