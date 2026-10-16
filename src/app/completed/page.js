"use client";

import Breadcrumb from "@/components/Breadcrumb";
import EsignUserStatus from "@/components/EsignUserStatus/EsignUserStatus";
import axios from "axios";
import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const CompletedPage = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [token, setToken] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const path = usePathname();
  const userStatus = path.replace("/", "");
  console.log(userStatus);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const esignUser = async (req, res) => {
    setLoading(true)
    const start = startDate ? format(startDate, "yyyy/MM/dd") : "";
    const end = endDate ? format(endDate, "yyyy/MM/dd") : "";
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users?&userStatus=${userStatus}&search=${debouncedSearch}&page=${page}&limit=${limit}&startDate=${start}&endDate=${end}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalUsers(res.data.totalUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (token) {
      esignUser();
    }
  }, [token, page, limit, startDate, endDate, debouncedSearch]);

  // Debounce only for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler); // cleanup old timeout
  }, [token, page, limit, search]); // dependencies
  return (
    <>
      <Breadcrumb
        title="Completed"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Completed" },
        ]}
      />
      <EsignUserStatus
        title="Completed"
        onDateChange={handleDateChange}
        users={users}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalUsers={totalUsers}
        limit={limit}
        setPage={setPage}
        setLimit={setLimit}
        handleClick={(user) => {
          router.push(`/profile/${user._id}`); //redirect user detail page
        }}
        search={search}
        setSearch={setSearch}
      />
    </>
  );
};

export default CompletedPage;
