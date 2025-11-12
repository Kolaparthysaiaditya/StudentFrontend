import React, { useState, useEffect } from "react";
import axios from "axios";

function Courses({ Admin }) {
    const [message, setMessage] = useState({ text: "", type: "" });
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchLevel, setSearchLevel] = useState("");
    const [loading, setLoading] = useState(false);
    const [enrollments, setEnrollments] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [totalCourses, setTotalCourses] = useState();
    const [totalDuration, setTotalDuration] = useState();
    const [popular, setPopular] = useState();
    const [marksmode, setMarksmode] = useState(false);


    const [Cid, setCid] = useState();
    const [CourseName, setCourseName] = useState();
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deletemode, setDeletemode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        duration: "",
        instructor: "",
        level: "",
        fee: ""
    });

    const [enrollmentData, setEnrollmentData] = useState({
        enrollment_id: "",
        marks: "",
        status: "",
        remark: "",
    });



    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 4;
    // Fetch courses
    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://127.0.0.1:8000/api/courses/");
            const data = res.data.courses || [];
            setCourses(data);
            setFilteredCourses(data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseSummery = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/courses/summary/");
            setTotalCourses(res.data.total_courses);
            setTotalDuration(res.data.total_enrolled_duration);
            setPopular(res.data.most_popular_course);
        } catch (error) {
            console.error("Error fetching course summary:", error);
        }
    };


    useEffect(() => {
        fetchCourses();
        fetchCourseSummery();
    }, []);

    // Filter
    const handleFilter = () => {
        let filtered = courses;

        if (searchName.trim() !== "") {
            filtered = filtered.filter((c) =>
                c.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        if (searchLevel !== "" && searchLevel !== "search by level") {
            filtered = filtered.filter(
                (c) => c.level.toLowerCase() === searchLevel.toLowerCase()
            );
        }

        setFilteredCourses(filtered);
        setCurrentPage(1); // reset to first page
    };

    const handleClear = () => {
        setSearchName("");
        setSearchLevel("");
        setFilteredCourses(courses);
        setCurrentPage(1);
    };

    const handleViewEnrollments = async (courseName) => {
        try {
            setSelectedCourse(courseName);
            const res = await axios.get(
                `http://127.0.0.1:8000/api/enrollments/by-course/${courseName}/`
            );
            setEnrollments(res.data.students || []);
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            setEnrollments([]);
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredCourses.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredCourses.slice(indexOfFirstRecord, indexOfLastRecord);

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    const handleAdd = () => {
        setFormData({
            name: "",
            description: "",
            duration: "",
            instructor: "",
            level: "",
            fee: ""
        });
        setEditMode(false);
        setShowForm(true);
    };

    const handleEdit = (course) => {
        setFormData(course);
        setEditMode(true);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editMode) {
                res = await axios.put(
                    `http://127.0.0.1:8000/api/courses/update/${formData.courseId}/`,
                    formData
                );
                setMessage({
                    text: res.data.message || "Course updated successfully!",
                    type: "success",
                });
            } else {
                res = await axios.post(
                    `http://127.0.0.1:8000/api/courses/add/`,
                    formData
                );
                setMessage({
                    text: res.data.message || "Course added successfully!",
                    type: "success",
                });
            }

            setShowForm(false);
            fetchCourses();
        } catch (error) {
            console.error(error);
            if (
                error.response &&
                error.response.data.message === "Course name already exists"
            ) {
                setMessage({ text: "This Course name already exists", type: "danger" });
                setShowForm(false)
            } else {
                setMessage({ text: "Something went wrong!", type: "danger" });
                setShowForm(false)
            }
        }
    };


    const handleDelete = async (Cid) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/courses/delete/${Cid}/`);
            alert("Course deleted successfully!");
            fetchCourses();
            setDeletemode(false);
        } catch (error) {
            console.error(error);
            setDeletemode(false)
            alert("Failed to delete course!");
        }
    };

    const handleAddMarks = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                marks: enrollmentData.marks,
                remark: enrollmentData.remark,
            };

            const res = await axios.put(
                `http://127.0.0.1:8000/api/updatemarks/${enrollmentData.enrollment_id}/`,
                payload
            );

            setMessage({
                text: res.data.message || "Marks updated successfully!",
                type: "success",
            });
            setMarksmode(false);
            handleViewEnrollments(selectedCourse); // refresh enrollments
        } catch (error) {
            console.error("Error updating marks:", error);
            setMessage({ text: "Failed to update marks", type: "danger" });
        }
    };



    if (loading) {
        return <div className="text-center mt-5 text-primary">Loading courses...</div>;
    }

    return (
        <div className="container-fluid text-center">
            <h2 className="fw-bold mb-4">Courses Info</h2>

            {message.text && (
                <div
                    className={`alert alert-${message.type} text-center fw-bold`}
                    role="alert"
                >
                    <button
                        type="button"
                        className="btn-close float-end"
                        style={{ fontSize: '2vh' }}
                        onClick={() => setMessage({ text: "", type: "" })}
                    ></button>
                    {message.text}
                </div>
            )}

            {/* Search Filters */}
            <div className="bg-green p-2 row g-2 align-items-center">
                <div className="form-floating col-12 col-md-5">
                    <input
                        type="search"
                        className="form-control"
                        id="searchCourse"
                        placeholder="search by name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    <label htmlFor="searchCourse" className="ps-5">
                        search by course
                    </label>
                </div>

                <div className="form-floating col-12 col-md-5">
                    <select
                        className="form-select p-0 ps-5"
                        id="floatingSelectGrid"
                        value={searchLevel}
                        onChange={(e) => setSearchLevel(e.target.value)}
                    >
                        <option value="">search by level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                <div className="col-12 col-md-2 d-flex gap-2 h-75">
                    <button
                        type="button"
                        className="btn btn-light text-primary w-100"
                        style={{ minHeight: "7.8vh" }}
                        onClick={handleFilter}
                    >
                        <i className="bi bi-search"></i> search
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary w-100"
                        style={{ minHeight: "7.8vh" }}
                        onClick={handleClear}
                    >
                        <i className="bi bi-x-circle"></i> clear
                    </button>
                </div>
            </div>

            {Admin === "Admin" ? (
                <div className="mt-3 text-md-start text-center">
                    <button
                        type="button"
                        className="btn btn-primary d-inline-flex align-items-center"
                        onClick={handleAdd}
                    >
                        + ADD New Courses
                    </button>
                </div>
            ) : (
                <div className="mb-5"></div>
            )}

            {/* Table */}
            <div className="p-0 mt-3 table-responsive">
                <table className="table table-secondary align-middle">
                    <thead>
                        <tr>
                            <th className="bg-dark text-light">S.No</th>
                            <th className="bg-dark text-light">Id</th>
                            <th className="bg-dark text-light">Name</th>
                            <th className="bg-dark text-light">Description</th>
                            <th className="bg-dark text-light">Duration(H)</th>
                            <th className="bg-dark text-light">Instructor</th>
                            <th className="bg-dark text-light">Level</th>
                            <th className="bg-dark text-light">Fee($)</th>
                            <th className="bg-dark text-light">Enrolled Students</th>
                            {Admin === "Admin" && (
                                <th className="bg-dark text-light">Action</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.length > 0 ? (
                            currentRecords.map((course, index) => (
                                <tr key={course.courseId}>
                                    <td>{index + 1 + (currentPage - 1) * recordsPerPage}</td>
                                    <td>{course.courseId}</td>
                                    <td>{course.name}</td>
                                    <td className="text-start">{course.description}</td>
                                    <td>{course.duration}</td>
                                    <td>{course.instructor}</td>
                                    <td>{course.level}</td>
                                    <td>{course.fee}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn text-primary text-decoration-underline"
                                            onClick={() => handleViewEnrollments(course.name)}
                                        >View</button>
                                    </td>
                                    {Admin === "Admin" && (
                                        <td>
                                            <button className="btn btn-success me-2" onClick={() => handleEdit(course)}>
                                                <i className="bi bi-pencil-square"></i> Edit
                                            </button>
                                            <button className="btn btn-danger" onClick={() => { setDeletemode(true); setCid(course.courseId); setCourseName(course.name) }}>
                                                <i className="bi bi-trash3"></i> Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={Admin === "Admin" ? 10 : 9} className="text-center">
                                    No courses found.
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

            {/* enrolement table */}
            <div className="p-0 mt-3 table-responsive">

                <table className="table table-secondary align-middle">
                    <thead>
                        <tr>
                            <th className="bg-secondary text-light text-start ps-4">Enrollment ID</th>
                            <th className="bg-secondary text-light text-start ps-4">Student Name</th>
                            <th className="bg-secondary text-light text-start ps-4">Marks</th>
                            {Admin === 'Admin' ? (
                                <th className="bg-secondary text-light text-start ps-4">Actions</th>
                            ) : (
                                <th className="bg-secondary text-light text-start ps-4">Status</th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {enrollments.length > 0 ? (
                            enrollments.map((enr) => (
                                <tr key={enr.enrollment_id}>
                                    <td className="text-start ps-4">{enr.enrollment_id}</td>
                                    <td className="text-start ps-4">{enr.student_name}</td>
                                    <td className="text-start ps-4">{enr.marks}</td>
                                    {Admin === "Admin" ? (
                                        <td className="text-start ps-4">
                                            <button
                                                className="com-btn btn bg-orange text-white"
                                                onClick={() => {
                                                    setEnrollmentData(enr);
                                                    setMarksmode(true);
                                                }}
                                            >
                                                <i className="bi bi-plus-circle-fill" style={{ fontSize: "2vh" }}></i> Set Marks
                                            </button>
                                        </td>
                                    ) : (
                                        <td
                                            className={`text-start ps-4 fw-bold ${enr.status?.toLowerCase() === "pass"
                                                ? "text-success"
                                                : "text-danger"
                                                }`}
                                        >
                                            {enr.status}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={Admin === "Admin" ? 4 : 4}
                                    className="text-center"
                                    onClick={() => setMarksmode(false)}
                                >
                                    {selectedCourse
                                        ? "No enrollments found for this course."
                                        : "Select a course to view enrollments."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="row text-center">
                <div className="col-md-4 mb-4" >
                    <div className="shadow-sm bg-white p-3 rounded-3">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <i className="bi bi-journal-text text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Total Courses</h5>
                            <p className="fs-4 fw-bold text-secondary">{totalCourses || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-4" >
                    <div className="p-3 shadow-sm bg-white rounded-3" >
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <i className="bi bi-clock-fill text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Total Courses Hours</h5>
                            <p className="fs-4 text-secondary fw-bold">{totalDuration || 0} h</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="shadow-sm p-3 bg-white rounded-3">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <i className="bi bi-star-fill text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Popular Course</h5>
                            <p className="fs-5 text-secondary">{popular || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        zIndex: 1050,
                    }}>
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
                            onClick={() => setShowForm(false)}
                        ></button>

                        <h5 className="text-warning fw-bold mb-4">{editMode ? "Edit Course" : "Add New Course"}</h5>

                        <div className="modal-content">
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>

                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Course Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                        <label>Course Name</label>
                                    </div>

                                    <div className="form-floating mb-3">
                                        <textarea className="form-control" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required></textarea>
                                        <label>Description</label>
                                    </div>
                                    <div className="form-floating mb-3">
                                        <input type="number" className="form-control" placeholder="Duration (hours)" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required />
                                        <label>duration</label>
                                    </div>
                                    <div className="form-floating mb-3">
                                        <input type="text" className="form-control" placeholder="Instructor" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} required />
                                        <label>Instructor</label>
                                    </div>
                                    <div className="form-floating mb-3">
                                        <select className="form-select pt-2" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} required>
                                            <option value="">Select Level</option>
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </select>
                                    </div>
                                    <div className="form-floating mb-3">
                                        <input type="number" className="form-control" placeholder="Fee ($)" value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} required />
                                        <label>Fee($)</label>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <button type="submit" className="btn btn-primary p-2 w-100">{editMode ? "Update" : "Add"}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>)}

            {deletemode && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ zIndex: 1050, backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                    onClick={() => setDeletemode(false)}
                >
                    <div
                        className="text-light rounded-4 shadow-lg p-4"
                        style={{ width: "90%", maxWidth: "400px", backgroundColor: "#1d3557", }}
                    >
                        <button
                            type="button"
                            className="btn-close btn-close-white float-end"
                            onClick={() => setDeletemode(false)}
                        ></button>
                        <h4 className="text-warning mb-3 mt-2">Delete Student</h4>
                        <p>Are you sure you want to delete Course {CourseName}?</p>
                        <button
                            type="button"
                            className="btn btn-danger w-100"
                            onClick={() => handleDelete(Cid)}
                        >
                            <i className="bi bi-trash3 me-1"></i> Delete Course
                        </button>
                    </div>
                </div>
            )}

            {marksmode && (
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
                            onClick={() => setMarksmode(false)}
                        ></button>

                        <h4 className="text-warning fw-bold mb-4">Add Marks</h4>

                        <div className="text-start mb-5">
                            <h4>Enrollment ID : {enrollmentData.enrollment_id}</h4>
                            <h3>Status : {enrollmentData.status}</h3>
                        </div>

                        <form onSubmit={handleAddMarks}>
                            <div className="form-floating mb-3">
                                <input
                                    type="number"
                                    placeholder=""
                                    max={100}
                                    value={enrollmentData.marks || ''}
                                    className="form-control"
                                    onChange={(e) => {
                                        let value = parseInt(e.target.value);
                                        if (value > 100) value = 100;
                                        if (value < 0) value = 0;
                                        setEnrollmentData({
                                            ...enrollmentData,
                                            marks: value,
                                        });
                                    }}
                                />
                                <label>Marks</label>
                            </div>

                            <div className="form-floating mb-4">
                                <textarea
                                    placeholder=""
                                    className="form-control"
                                    value={enrollmentData.remark || ''}
                                    onChange={(e) =>
                                        setEnrollmentData({
                                            ...enrollmentData,
                                            remark: e.target.value,
                                        })
                                    }
                                />
                                <label>Remark</label>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 p-3 rounded-4">
                                Add Mark
                            </button>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Courses;
