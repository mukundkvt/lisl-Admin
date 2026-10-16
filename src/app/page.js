// export default function Home() {
//   return (
//     <div>Dashboard</div>
//   );
// }

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ShimmerLogin from "@/components/ShimmerLogin";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, []);

  return <ShimmerLogin />; // ya ShimmerLogin
}