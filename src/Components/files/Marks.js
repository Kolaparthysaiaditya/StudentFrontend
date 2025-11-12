import React, { useEffect, useState } from "react";
import axios from "axios";

function Marks({ Admin }) {
    const [marksData, setMarksData] = useState([]);
    const [filteredMarks, setFilteredMarks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [summary, setSummary] = useState({
        highest_marks: null,
        lowest_marks: null,
        average_marks: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Edit modal states
    const [showEditForm, setShowEditForm] = useState(false);
    const [editForm, setEditForm] = useState({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    useEffect(() => {
        fetchMarksData();
    }, []);

    const fetchMarksData = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://127.0.0.1:8000/api/all_students_marks/");
            if (res.data) {
                const marksList = res.data.students_marks || [];

                const marks = marksList.map((item) => parseFloat(item.marks) || 0);
                const highest = marks.length ? Math.max(...marks) : 0;
                const lowest = marks.length ? Math.min(...marks) : 0;
                const avg = marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;

                setMarksData(marksList);
                setFilteredMarks(marksList);
                setSummary({
                    highest_marks: highest.toFixed(2),
                    lowest_marks: lowest.toFixed(2),
                    average_marks: avg.toFixed(2),
                });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to load marks data", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    useEffect(() => {
        if (!marksData.length) return;

        const filtered = marksData.filter((item) => {
            const student = item.student_name?.toLowerCase() || "";
            const course = item.course_name?.toLowerCase() || "";
            const search = searchTerm.toLowerCase();

            const matchSearch = student.includes(search) || course.includes(search);
            const matchStatus =
                filterStatus === "" || item.status?.toLowerCase() === filterStatus.toLowerCase();

            return matchSearch && matchStatus;
        });

        setFilteredMarks(filtered);
        setCurrentPage(1);
    }, [searchTerm, filterStatus, marksData]);

    const handleClear = () => {
        setSearchTerm("");
        setFilterStatus("");
        setFilteredMarks(marksData);
    };

    // Pagination
    const totalPages = Math.ceil(filteredMarks.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredMarks.slice(indexOfFirstRecord, indexOfLastRecord);

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    // Edit modal logic
    const openEditForm = (record) => {
        setEditForm({ ...record });
        setShowEditForm(true);
    };

    const handleEditChange = (field, value) => {
        setEditForm({ ...editForm, [field]: value });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const res = await axios.put(
                `http://127.0.0.1:8000/api/update_marks_records/${editForm.enrollment_id}/`,
                {
                    marks: editForm.marks,
                    remark: editForm.remark,
                    status: editForm.status,
                    date: editForm.date,
                }
            );

            if (res.status === 200) {
                setMessage({ text: res.data.message, type: "success" });
                fetchMarksData();
                setShowEditForm(false);
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to update record", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (enrollment_id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;

        try {
            setLoading(true);
            const res = await axios.delete(
                `http://127.0.0.1:8000/api/delete_marks/${enrollment_id}/`
            );
            if (res.status === 200) {
                setMessage({ text: res.data.message, type: "success" });
                fetchMarksData();
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to delete record", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid text-center position-relative">
            <h2 className="fw-bold mb-4">Marks Info</h2>

            {message.text && (
                <div
                    className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Filter Section */}
            <div className="bg-green p-2 row g-2 align-items-center">
                <div className="form-floating col-12 col-md-5">
                    <input
                        type="search"
                        className="form-control"
                        id="searchMarks"
                        placeholder="Search by name or course"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <label htmlFor="searchMarks" className="ps-5">
                        Search by Name / Course
                    </label>
                </div>

                <div className="form-floating col-12 col-md-5">
                    <select
                        className="form-select p-0 ps-5"
                        id="statusSelect"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="" hidden>
                            Filter by Status
                        </option>
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                    </select>
                </div>

                <div className="col-12 col-md-2 d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-light text-primary w-100"
                        style={{ minHeight: "7.8vh" }}
                        onClick={() => setFilteredMarks(marksData)}
                    >
                        <i className="bi bi-search"></i> Search
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary w-100"
                        style={{ minHeight: "7.8vh" }}
                        onClick={handleClear}
                    >
                        <i className="bi bi-x-circle"></i> Clear
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="p-0 mt-3 table-responsive">
                <table className="table table-secondary align-middle">
                    <thead>
                        <tr>
                            <th className="bg-dark text-light">S.No</th>
                            <th className="bg-dark text-light">Enrollment Id</th>
                            <th className="bg-dark text-light">Student</th>
                            <th className="bg-dark text-light">Course</th>
                            <th className="bg-dark text-light">Marks</th>
                            <th className="bg-dark text-light">Status</th>
                            <th className="bg-dark text-light">Remark</th>
                            <th className="bg-dark text-light">Date</th>
                            {Admin === "Admin" && (
                                <th className="bg-dark text-light">Action</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="text-center py-3">
                                    Loading...
                                </td>
                            </tr>
                        ) : currentRecords.length > 0 ? (
                            currentRecords.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1 + (currentPage - 1) * recordsPerPage}</td>
                                    <td>{item.enrollment_id}</td>
                                    <td>{item.student_name || "-"}</td>
                                    <td>{item.course_name}</td>
                                    <td>{parseFloat(item.marks).toFixed(2) || "-"}</td>
                                    <td
                                        className={
                                            item.status === "pass"
                                                ? "text-success fw-bold"
                                                : "text-danger fw-bold"
                                        }
                                    >
                                        {item.status ? item.status.toUpperCase() : "-"}
                                    </td>
                                    <td>{item.remark || "-"}</td>
                                    <td>{item.date}</td>
                                    {Admin === "Admin" && (
                                        <td>
                                            <button
                                                className="btn btn-success btn-sm me-2"
                                                onClick={() => openEditForm(item)}
                                            >
                                                <i className="bi bi-pencil-square"></i> Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(item.enrollment_id)}
                                            >
                                                <i className="bi bi-trash"></i> Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center py-3">
                                    No records found
                                </td>
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
                                className={`page-link rounded-4 text-light me-2 ${currentPage === i + 1 ? "active bg-primary" : "bg-dark"
                                    }`}
                                onClick={() => goToPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="row text-center">
                <div className="col-md-4 mb-4" >
                    <div className="shadow-sm bg-white p-3 rounded-3">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <i className="bi bi-people-fill text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Higest Marks</h5>
                            <p className="fs-4 fw-bold text-secondary">{summary.highest_marks}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-4" >
                    <div className="p-3 shadow-sm bg-white rounded-3" >
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <i className="bi bi-cake2-fill text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Total Courses</h5>
                            <p className="fs-4 text-secondary fw-bold">{summary.lowest_marks}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="shadow-sm p-3 bg-white rounded-3">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <i className="bi bi-cake2-fill text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Total Enrollments</h5>
                            <p className="fs-5 text-secondary">{summary.average_marks}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Edit Form */}
            {showEditForm && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        zIndex: 1050,
                    }}
                >
                    <div
                        className="text-light p-4 rounded-4 shadow-lg"
                        style={{
                            width: "90%",
                            maxWidth: "400px",
                            backgroundColor: "#1d3557",
                        }}
                    >
                        <button
                            type="button"
                            className="btn-close btn-close-white float-end"
                            onClick={() => setShowEditForm(false)}
                        ></button>

                        <h4 className="text-warning fw-bold mb-4">
                            Edit Marks - {editForm.enrollment_id}
                        </h4>

                        <div className="form-floating mb-3">
                            <input
                                className="form-control"
                                value={editForm.student_name}
                                onChange={(e) =>
                                    handleEditChange("student_name", e.target.value)
                                }
                            />
                            <label className="form-label fw-semibold">Student</label>
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                className="form-control"
                                value={editForm.course_name}
                                onChange={(e) =>
                                    handleEditChange("course_name", e.target.value)
                                }
                            />
                            <label className="form-label fw-semibold">Course</label>
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                type="number"
                                className="form-control"
                                value={editForm.marks}
                                onChange={(e) =>
                                    handleEditChange("marks", e.target.value)
                                }
                            />
                            <label className="form-label fw-semibold">Marks</label>
                        </div>

                        <div className="form-floating mb-3">
                            <select
                                className="form-select"
                                value={editForm.status}
                                onChange={(e) =>
                                    handleEditChange("status", e.target.value)
                                }
                            >
                                <option value="pass">Pass</option>
                                <option value="fail">Fail</option>
                            </select>
                            <label className="form-label fw-semibold">Status</label>
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                className="form-control"
                                value={editForm.remark}
                                onChange={(e) =>
                                    handleEditChange("remark", e.target.value)
                                }
                            />
                            <label className="form-label fw-semibold">Remark</label>
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                type="date"
                                className="form-control"
                                value={editForm.date}
                                onChange={(e) =>
                                    handleEditChange("date", e.target.value)
                                }
                            />
                            <label className="form-label fw-semibold">Date</label>
                        </div>

                        <div className="d-flex justify-content-center w-100 mt-4">
                            <button className="btn btn-primary w-100" onClick={handleSave}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Marks;
