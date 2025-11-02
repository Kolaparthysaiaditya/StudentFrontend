import axios from "axios";
import React, { useState, useEffect } from "react";

function Students() {
    const [students, setstudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deletemode, setDeletemode] = useState(false);
    const [Sid, setSid] = useState();
    const [loading, setLoading] = useState(false);

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

    // ✅ Fetch Students from API
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
    }, []);

    const totalPages = Math.ceil(students.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = students.slice(indexOfFirstRecord, indexOfLastRecord);

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    // 🟢 Open Add/Edit Form
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

    // 🟣 Handle Add or Update
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

    // 🔴 Handle Delete
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

    // 🕓 Show loading spinner
    if (loading) {
        return <div className="text-center mt-5 text-primary">Loading students...</div>;
    }

    return (
        <div className="container-fluid text-center">
            <h2 className="fw-bold mb-4">Students Info</h2>

            {/* 🔍 Search Filters */}
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

            <div className="mt-3 text-md-start text-center">
                <button
                    type="button"
                    className="btn btn-primary d-inline-flex align-items-center"
                    onClick={() => openForm()}
                >
                    + ADD New Student
                </button>
            </div>

            {/* 🧾 Student Table */}
            <div className="p-0 mt-3 table-responsive">
                <table className="table table-secondary align-middle">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Id</th>
                            <th>Profile</th>
                            <th>Name</th>
                            <th>DOB</th>
                            <th>Gender</th>
                            <th>Address</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Enroll</th>
                            <th>Action</th>
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
                                <td>{student.Sid}</td>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🔢 Pagination */}
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
                        className="bg-dark text-light p-4 rounded-4 shadow-lg"
                        style={{ width: "90%", maxWidth: "400px" }}
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
                        className="bg-dark text-light rounded-4 shadow-lg p-4"
                        style={{ width: "90%", maxWidth: "400px" }}
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
        </div>
    );
}

export default Students;
