"use client";

// pages/login.js (or any component file)
import React, { useState } from "react";
import Head from "next/head";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
        {
          loginName: email,
          password: password,
        },
      );
      console.log(response);
      const { token, user } = response.data;

      // Store token & user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!");
      // router.push("/dashboard");
      if (user?.role === "Admin") {
        router.push("/user-management");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Dr. Alankar Clinic</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </Head>

      <div className="container-fluid min-vh-100 d-flex flex-column flex-md-row p-0">
        {/* Left Section */}
        <div
          className="d-none d-md-flex col-md-7 align-items-center justify-content-center text-white"
          style={{
            backgroundImage: "url('/LISL_Left_Login_image.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="text-center p-4">
            <p className="mt-4 small">
              Powered by <strong>KV Tech Media</strong>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-12 col-md-5 d-flex align-items-center justify-content-center p-4 bg-white">
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <div className="text-center mb-4">
              <img
                // src="https://dralankartiwari.com/frontend/img/dr-alankar-tiwari-new-logo.png"
                src="./logo-lakshmishree.png"
                alt="Ellora Logo"
                className="img-fluid"
                style={{ width: "", height: "" }}
              />
              <h2 className="h5 mt-3 fw-semibold" style={{ color: "#5e5d5d" }}>
                Welcome to Lakshmishree Investment & Securities Ltd
              </h2>
              <p className="text-muted small">
                Enter your email below to continue
              </p>
            </div>

            <div className="card shadow">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Username
                    </label>
                    <input
                      // type="email"
                      id="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="form-control"
                        placeholder="••••••••"
                        style={{ paddingRight: "42px" }}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-3 d-flex align-items-center justify-content-center"
                        style={{
                          textDecoration: "none",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-danger small mb-2">{error}</div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                    style={{
                      background: "linear-gradient(180deg, #FF2200, #FF7700)",
                      boxShadow: "none",
                      outline: "none",
                      border: "none",
                    }}
                  >
                    {loading ? "Logging in..." : "Continue"}
                  </button>
                </form>
              </div>
            </div>

            <p className="text-muted text-center small mt-4">
              Powered by{" "}
              <a
                href="https://kvtechmedia.in"
                className="text-decoration-underline"
              >
                KV Tech Media Pvt. Ltd.
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
