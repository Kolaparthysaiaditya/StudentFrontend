import axios from "axios";
import React, { useState, useEffect } from "react";
import gender from '../../images/gender.png'

function Students({ Admin }) {
    const [students, setstudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deletemode, setDeletemode] = useState(false);
    const [marksmode, setMarksmode] = useState(false);
    const [Sid, setSid] = useState();
    const [loading, setLoading] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [enrollmentLoading, setEnrollmentLoading] = useState(false);
    const [Average, setAverage] = useState()
    const [totalstudents, setTotalStudents] = useState()
    const [malepercentage, setmalepercentage] = useState()
    const [femalepercentage, setfemalepercetage] = useState()


    const [formData, setFormData] = useState({
        id: "",
        name: "",
        DOB: "",
        gender: "",
        Address: "",
        phone_number: "",
        email: "",
        profile_pic: null,
    });

    const recordsPerPage = 4;

    // Fetch Students from API
    const fetchstudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://127.0.0.1:8000/api/get-all-students/");
            setstudents(res.data.students || []);
        } catch (error) {
            console.error("Error fetching students:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchstudents();
        fetchAverageAge();
    }, []);

    const fetchAverageAge = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/average-age/");
            console.log("Average Age API Response:", res.data);
            setAverage(res.data.average);
            setTotalStudents(res.data.students);
            setmalepercentage(res.data.male);
            setfemalepercetage(res.data.female);
        } catch (error) {
            console.error("Error fetching average age:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(students.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = students.slice(indexOfFirstRecord, indexOfLastRecord);

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    // Open Add/Edit Form
    const openForm = (student = null) => {
        if (student) {
            setEditMode(true);
            setFormData({
                id: student.id,
                name: student.name,
                DOB: student.DOB,
                gender: student.gender,
                Address: student.Address,
                phone_number: student.phone_number,
                email: student.email,
                profile_pic: null,
            });
        } else {
            setEditMode(false);
            setFormData({
                id: "",
                name: "",
                DOB: "",
                gender: "",
                Address: "",
                phone_number: "",
                email: "",
                profile_pic: null,
            });
        }
        setShowForm(true);
    };

    const handleClose = () => setShowForm(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    // Handle Add or Update
    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("name", formData.name);
        data.append("DOB", formData.DOB);
        data.append("gender", formData.gender);
        data.append("Address", formData.Address);
        data.append("phone_number", formData.phone_number);
        data.append("email", formData.email);
        if (formData.profile_pic) {
            data.append("profile_pic", formData.profile_pic);
        }

        try {
            if (editMode) {
                await axios.put(
                    `http://127.0.0.1:8000/api/update-student/${formData.id}/`,
                    data,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                alert("Student updated successfully!");
            } else {
                await axios.post("http://127.0.0.1:8000/api/register/", data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Student registered successfully!");
            }

            setShowForm(false);
            setFormData({
                id: "",
                name: "",
                DOB: "",
                gender: "",
                Address: "",
                phone_number: "",
                email: "",
                profile_pic: null,
            });

            // ✅ Refresh data after save
            await fetchstudents();

        } catch (error) {
            console.error("Error submitting form:", error.response?.data || error);
            if (error.response && error.response.data?.errors) {
                const errors = error.response.data.errors;

                if (errors.email) {
                    alert(errors.email[0]);
                } else if (errors.phone_number) {
                    alert(errors.phone_number[0]);
                } else {
                    alert("Please check your form data.");
                }
            } else {
                alert("Something went wrong while saving the student.");
            }

        }
    };

    // Handle Delete
    const handelDelete = async () => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/remove-student/${Sid}/`);
            alert(`Student ${Sid} deleted successfully.`);
            setSid("");
            setDeletemode(false);

            // ✅ Refresh table after delete
            await fetchstudents();
        } catch (error) {
            alert("Error deleting student: " + error);
        }
    };

    const fetchEnrollment = async (Sid) => {
        try {
            setEnrollmentLoading(true);
            const res = await axios.get(`http://127.0.0.1:8000/api/enrollment/${Sid}/`);
            setEnrollmentData(res.data);
        } catch (error) {
            setEnrollmentData({ error: "No enrollment found for this student." });
        } finally {
            setEnrollmentLoading(false);
        }
    };

    const handleAddMarks = async (e) => {
        e.preventDefault();

        if (!enrollmentData.marks) {
            alert("Please enter marks");
            return;
        }

        try {
            const payload = {
                marks: enrollmentData.marks,
                remark: enrollmentData.remark || ""
            };

            const res = await axios.put(
                `http://127.0.0.1:8000/api/updatemarks/${enrollmentData.id}/`,
                payload
            );

            console.log("Response from server:", res.data);
            alert("Marks updated successfully!");
            setMarksmode(false);
            fetchEnrollment(enrollmentData.student_Sid);  // refresh
        } catch (error) {
            console.error("Update marks error:", error.response?.data || error.message);
            alert("Failed to update marks.");
        }
    };



    // Show loading spinner
    if (loading) {
        return <div className="text-center mt-5 text-primary">Loading students...</div>;
    }

    return (
        <div className="container-fluid text-center">
            <h2 className="fw-bold mb-4">Students Info</h2>

            {/* Search Filters */}
            <div className="bg-green p-2 row g-2 align-items-center">
                <div className="form-floating col-12 col-md-5">
                    <input
                        type="search"
                        className="form-control"
                        id="searchName"
                        placeholder="search by name"
                    />
                    <label htmlFor="searchName" className="ps-5">
                        search by name
                    </label>
                </div>

                <div className="form-floating col-12 col-md-5">
                    <select className="form-select p-0 ps-5" id="floatingSelectGrid">
                        <option selected hidden>Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                <div className="col-12 col-md-2 d-flex h-75">
                    <button
                        type="submit"
                        className="btn btn-light text-primary w-100"
                        style={{ minHeight: "7.8vh" }}
                    >
                        <i className="bi bi-search"></i> search
                    </button>
                </div>
            </div>

            {Admin === 'Admin' ? (
                <div className="mt-3 text-md-start text-center">
                    <button
                        type="button"
                        className="btn btn-primary d-inline-flex align-items-center"
                        onClick={() => openForm()}
                    >
                        + ADD New Student
                    </button>
                </div>
            ) :
                (
                    <div className="mb-5"></div>
                )}

            {/* Student Table */}
            <div className="p-0 mt-3 table-responsive">
                <table className="table table-secondary align-middle">
                    <thead>
                        <tr>
                            <th className="bg-dark text-light">S.No</th>
                            <th className="bg-dark text-light">Id</th>
                            <th className="bg-dark text-light">Profile</th>
                            <th className="bg-dark text-light">Name</th>
                            <th className="bg-dark text-light">DOB</th>
                            <th className="bg-dark text-light">Gender</th>
                            <th className="bg-dark text-light">Address</th>
                            <th className="bg-dark text-light">Phone</th>
                            <th className="bg-dark text-light">Email</th>
                            <th className="bg-dark text-light">Enroll</th>
                            {Admin === 'Admin' && (
                                <th className="bg-dark text-light">Action</th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {currentRecords.map((student, index) => (
                            <tr key={student.id}>
                                <td>{index + 1 + (currentPage - 1) * recordsPerPage}</td>
                                <td>{student.Sid}</td>
                                <td>
                                    <img
                                        src={`http://127.0.0.1:8000/${student.profile_pic}`}
                                        alt="profile"
                                        className="rounded-circle"
                                        style={{ maxHeight: "10vh" }}
                                    />
                                </td>
                                <td>{student.name}</td>
                                <td>{student.DOB}</td>
                                <td>{student.gender}</td>
                                <td>{student.Address}</td>
                                <td>{student.phone_number}</td>
                                <td>{student.email}</td>
                                <td> <button
                                    className="btn text-primary text-decoration-underline"
                                    onClick={() => fetchEnrollment(student.Sid)}
                                >
                                    View
                                </button></td>
                                {Admin === 'Admin' && (
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-success me-2 mb-1 mb-md-0"
                                            onClick={() => openForm(student)}
                                        >
                                            <i className="bi bi-pencil-square"></i> Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={() => { setDeletemode(true); setSid(student.Sid); }}
                                        >
                                            <i className="bi bi-trash3"></i> Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
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

            {/* enrolement table */}
            <div className="p-0 mt-3 table-responsive">

                <table className="table table-secondary align-middle">
                    <thead>
                        <tr>
                            <th className="bg-secondary text-light text-start ps-4">Enrollment ID</th>
                            <th className="bg-secondary text-light text-start ps-4">Student</th>
                            <th className="bg-secondary text-light text-start ps-4">Course</th>
                            <th className="bg-secondary text-light text-start ps-4">Marks</th>
                            {Admin === 'Admin' ? (
                                <th className="bg-secondary text-light text-start ps-4">Actions</th>
                            ):(
                                <th className="bg-secondary text-light text-start ps-4">Status</th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {enrollmentData && !enrollmentData.error ? (
                            <tr>
                                <td className="text-start ps-5">{enrollmentData.enrollment_id}</td>
                                <td className="text-start ps-5">{enrollmentData.student}</td>
                                <td className="text-start ps-5">{enrollmentData.course}</td>
                                <td className="text-start ps-5">{enrollmentData.marks || 0}</td>
                                {Admin === 'Admin' ? (
                                    <td className="text-start ps-5">
                                        <button
                                            className="com-btn btn bg-orange text-white"
                                            onClick={() => setMarksmode(true)}>
                                            <i class="bi bi-plus-circle-fill" style={{ fontSize: "2vh" }}></i> Set Marks
                                        </button>
                                    </td>
                                ):(
                                    <td className="text-start ps-2">
                                        <p className={enrollmentData.status.toLowerCase() === "pass" ? "w-50 btn btn-success" : "w-50 btn btn-danger"}>
                                            {enrollmentData.status}
                                        </p>
                                    </td>
                                )}
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-muted">
                                    No enrollment data available.
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
                            <i className="bi bi-people-fill text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Total Students</h5>
                            <p className="fs-4 fw-bold text-secondary">{totalstudents}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-4" >
                    <div className="p-3 shadow-sm bg-white rounded-3" >
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <i className="bi bi-cake2-fill text-primary" style={{ fontSize: "6vh" }}></i>
                            <h5 className="mt-2">Total Courses</h5>
                            <p className="fs-4 text-secondary fw-bold">{Average}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="shadow-sm p-3 bg-white rounded-3">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <img src={gender} alt="photo" style={{ maxHeight: "9vh" }}></img>
                            <h5 className="mt-2">Total Enrollments</h5>
                            <p className="fs-5 text-secondary">
                                <i class="bi bi-gender-male text-gold fs-4"></i>: {malepercentage}%
                                <i class="bi bi-gender-female text-gold fs-4 ms-2"></i>: {femalepercentage}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟣 Form Modal */}
            {showForm && (
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
                            onClick={handleClose}
                        ></button>
                        <h4 className="text-warning fw-bold mb-4">
                            {editMode ? "Edit Student" : "Add Student"}
                        </h4>

                        <form onSubmit={handleSubmit} method="POST">
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="example.@com"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="form-label">Student Name</label>
                            </div>

                            <div className="form-floating mb-3">
                                <input
                                    type="date"
                                    name="DOB"
                                    className="form-control"
                                    value={formData.DOB}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="form-label">Birthdate</label>
                            </div>

                            <div className="form-floating mb-3">
                                <select
                                    name="gender"
                                    className="form-select p-0 ps-3"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option hidden>Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    name="Address"
                                    className="form-control"
                                    value={formData.Address}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="form-label">Address</label>
                            </div>

                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    name="phone_number"
                                    className="form-control"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="form-label">Phone Number</label>
                            </div>

                            <div className="form-floating mb-3">
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="form-label">Email</label>
                            </div>

                            {!editMode && (
                                <div className="d-flex mb-3">
                                    <label className="p-2">Profile:</label>
                                    <input
                                        type="file"
                                        name="profile_pic"
                                        className="form-control"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary w-100">
                                {editMode ? "Update" : "Add Student"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 🔴 Delete Confirmation */}
            {deletemode && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ zIndex: 1050, backgroundColor: "rgba(0, 0, 0, 0.6)" }}
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
                        <p>Are you sure you want to delete student {Sid}?</p>
                        <button
                            type="button"
                            className="btn btn-danger w-100"
                            onClick={handelDelete}
                        >
                            <i className="bi bi-trash3 me-1"></i> Delete Student
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
                        <form onSubmit={(e) => handleAddMarks(e)}>

                            <div className="form-floating mb-3">
                                <input type="number"
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
                                ></input>
                                <label>Marks</label>
                            </div>

                            <div className="form-floating mb-4">
                                <textarea placeholder="" className="form-control"></textarea>
                                <label>Remark</label>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 p-3 rounded-4">Add Mark</button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Students;
