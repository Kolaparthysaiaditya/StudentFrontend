import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState();

    const nav = useNavigate()
   
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            console.log(email)
            const res = await axios.post("http://127.0.0.1:8000/api/login/", {
                email: email,
                password: password,
            });

            if (res.data.access) {
                const Sid = res.data.user.id;
                localStorage.setItem("access", res.data.access);
                localStorage.setItem("refresh", res.data.refresh);

                alert("Login Successful ✅");
                nav(`/Dashboard/${Sid}`)

            } else {
                setError("Invalid email or password");
            }
        } catch (err) {
            console.error(err);
            setError("Login failed. Check your credentials.");
        }
    };

    return (
        <div className="bg-blue min-vh-100 d-flex justify-content-center align-items-center text-center">
            <div className="bg-light p-5 rounded-5">
                <h2 className="text-blue">
                    <i className="bi bi-mortarboard-fill me-2"></i>
                    Students System
                </h2>

                {message && (
                    <div class="alert alert-danger pb-0" role="alert">
                        <p>Message</p>
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className="form-control bg-light-gray"
                            placeholder="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label>Your Email</label>
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className="form-control bg-light-gray"
                            placeholder="Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label>Password</label>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
                {error && <p className="error-text">{error}</p>}
            </div>
        </div>
    );
};

export default Login;