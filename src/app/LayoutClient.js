// "use client";

// import { useEffect, useRef, useState } from "react";
// import Sidebar from "@/components/Sidebar/Sidebar";
// import Navbar from "@/components/Navbar";
// import { ToastContainer, toast } from "react-toastify";
// import { usePathname, useRouter } from "next/navigation";
// import axios from "axios";
// import Sidebar2 from "@/components/Sidebar2/Sidebar2";

// export default function LayoutClient({ children }) {
//   const [collapsed, setCollapsed] = useState(false);
//   const pathname = usePathname();
//   const router = useRouter();

//   // Hide Sidebar and Navbar on these routes
//   const hideLayout = ["/login"];
//   const shouldHideLayout = hideLayout.includes(pathname);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [countdown, setCountdown] = useState(10);
//   const timeoutRef = useRef(null);
//   const countdownRef = useRef(null);

//   // 🔑 Check token validity
//   const checkAuthStatus = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       router.push("/login");
//       return;
//     }

//     try {
//       const res = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/admin/check_auth_status`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (!res.data.success) {
//         toast.error("Session expired. Please login again.");
//         handleLogout();
//       }
//     } catch (err) {
//       console.error("Auth check failed:", err);
//       toast.error("Session expired. Please login again.");
//       handleLogout();
//     }
//   };

//   const startInactivityTimer = () => {
//     clearTimeout(timeoutRef.current);
//     timeoutRef.current = setTimeout(() => {
//       setIsModalOpen(true);
//       startCountdown();
//     }, 5 * 60 * 1000); // 5 minutes
//   };

//   const resetTimer = () => {
//     if (!isModalOpen) {
//       startInactivityTimer();
//     }
//   };

//   const startCountdown = () => {
//     let timeLeft = 10;
//     setCountdown(timeLeft);
//     countdownRef.current = setInterval(() => {
//       timeLeft -= 1;
//       setCountdown(timeLeft);
//       if (timeLeft <= 0) {
//         handleLogout();
//       }
//     }, 1000);
//   };

//   const stopCountdown = () => {
//     clearInterval(countdownRef.current);
//   };

//   const handleLogout = () => {
//     stopCountdown();
//     setIsModalOpen(false);
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     router.push("/login");
//   };

//   const handleStay = () => {
//     stopCountdown();
//     setIsModalOpen(false);
//     startInactivityTimer();
//   };

//   useEffect(() => {
//     // ✅ Bootstrap JS load (browser me hi chalega)
//     import("bootstrap/dist/js/bootstrap.bundle.min.js");

//     const handleResize = () => {
//       setCollapsed(window.innerWidth < 1300);
//     };
//     window.addEventListener("resize", handleResize);
//     handleResize();

//     // ✅ Check token validity on initial render
//     if (!shouldHideLayout) {
//       checkAuthStatus(); // 🔑 yaha token check hoga
//       startInactivityTimer();
//       window.addEventListener("mousemove", resetTimer);
//       window.addEventListener("keydown", resetTimer);
//       window.addEventListener("scroll", resetTimer);
//     }

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (!shouldHideLayout) {
//         window.removeEventListener("mousemove", resetTimer);
//         window.removeEventListener("keydown", resetTimer);
//         window.removeEventListener("scroll", resetTimer);
//       }
//       clearTimeout(timeoutRef.current);
//       clearInterval(countdownRef.current);
//     };
//   }, [shouldHideLayout]);

//   return (
//     <div className="app-container">
//       {/* {!shouldHideLayout && (
//         <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
//       )} */}
//       {!shouldHideLayout &&
//         (pathname.startsWith("/esigned/") &&
//         pathname.split("/").length === 3 ? (
//           <Sidebar2
//             userId={pathname.split("/")[2]}
//             onClose={() => router.push("/esigned")}
//             collapsed={collapsed}
//             setCollapsed={setCollapsed}
//           />
//         ) : (
//           <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
//         ))}
//       <div className="main-section">
//         {!shouldHideLayout && (
//           <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
//         )}
//         <main className="main-content">{children}</main>
//       </div>

//       {/* Toast notifications */}
//       <ToastContainer position="top-right" autoClose={3000} />

//       {/* Inactivity Modal */}
//       {isModalOpen && (
//         <div
//           className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center"
//           style={{ zIndex: 9999 }}
//         >
//           <div
//             className="bg-white p-4 rounded shadow"
//             style={{ width: "400px" }}
//           >
//             <h5 className="mb-3">Session Expiring</h5>
//             <p className="mb-2">
//               You will be logged out in <strong>{countdown}</strong> seconds.
//             </p>
//             <div className="d-flex justify-content-between mt-3">
//               <button className="btn btn-danger" onClick={handleStay}>
//                 Stay Logged In
//               </button>
//               <button
//                 className="btn btn-outline-secondary"
//                 onClick={handleLogout}
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Navbar from "@/components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Sidebar2 from "@/components/Sidebar2/Sidebar2";
import ShimmerLogin from "@/components/ShimmerLogin";
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false,
  minimum: 0.25, // 👈 click pe turant 25%
  trickle: true,
  trickleSpeed: 200,
  speed: 500,
});

export default function LayoutClient({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Hide Sidebar and Navbar on these routes
  const hideLayout = ["/login"];
  const shouldHideLayout = hideLayout.includes(pathname);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const timeoutRef = useRef(null);
  const countdownRef = useRef(null);

  // NEW: track whether auth check is in progress
  const [checkingAuth, setCheckingAuth] = useState(true);

  // --- Progress bar automatically triggered on route change ---
  const searchParams = useSearchParams();
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // 🔑 Check token validity
  const checkAuthStatus = async () => {
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   router.push("/login");
    //   return;
    // }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      setCheckingAuth(false);
      return false;
    }

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/check_auth_status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.data.success) {
        toast.error("Session expired. Please login again.");
        handleLogout();
        setCheckingAuth(false);
        return false;
      }
      setCheckingAuth(false);
      return true;
    } catch (err) {
      console.error("Auth check failed:", err);
      toast.error("Session expired. Please login again.");
      handleLogout();
      setCheckingAuth(false);
      return false;
    }
  };

  const startInactivityTimer = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(
      () => {
        setIsModalOpen(true);
        startCountdown();
      },
      15 * 60 * 1000,
    ); // 5 minutes
  };

  const resetTimer = () => {
    if (!isModalOpen) {
      startInactivityTimer();
    }
  };

  const startCountdown = () => {
    let timeLeft = 10;
    setCountdown(timeLeft);
    countdownRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        handleLogout();
      }
    }, 1000);
  };

  const stopCountdown = () => {
    clearInterval(countdownRef.current);
  };

  const handleLogout = () => {
    stopCountdown();
    setIsModalOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCheckingAuth(false);
    router.push("/login");
  };

  const handleStay = () => {
    stopCountdown();
    setIsModalOpen(false);
    startInactivityTimer();
  };

  useEffect(() => {
    // ✅ Bootstrap JS load (browser me hi chalega)
    import("bootstrap/dist/js/bootstrap.bundle.min.js");

    const handleResize = () => {
      setCollapsed(window.innerWidth < 1300);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // If layout is hidden (login page), skip auth check
    if (shouldHideLayout) {
      setCheckingAuth(false);
    } else {
      // quick sync check for token to avoid flash of "/" before redirect
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        setCheckingAuth(false);
      } else {
        // asynchronous full check
        checkAuthStatus();
        startInactivityTimer();
        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keydown", resetTimer);
        window.addEventListener("scroll", resetTimer);
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (!shouldHideLayout) {
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("keydown", resetTimer);
        window.removeEventListener("scroll", resetTimer);
      }
      clearTimeout(timeoutRef.current);
      clearInterval(countdownRef.current);
    };
  }, [shouldHideLayout]);

  // while checking auth, don't render app shell (prevents showing "/" before redirect)
  if (checkingAuth)
    return (
      <>
        <ShimmerLogin />
      </>
    );

  return (
    <div className="app-container">
      {/* {!shouldHideLayout && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )} */}
      {!shouldHideLayout &&
        (pathname.startsWith("/profile/") &&
        pathname.split("/").length === 3 ? (
          <Suspense fallback={null}>
            <Sidebar2
              userId={pathname.split("/")[2]}
              onClose={() => router.back()}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
          </Suspense>
        ) : (
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        ))}
      <div className="main-section">
        {!shouldHideLayout && (
          <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <main className="main-content">{children}</main>
      </div>

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Inactivity Modal */}
      {isModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center"
          style={{ zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "400px" }}
          >
            <h5 className="mb-3">Session Expiring</h5>
            <p className="mb-2">
              You will be logged out in <strong>{countdown}</strong> seconds.
            </p>
            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-danger" onClick={handleStay}>
                Stay Logged In
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
