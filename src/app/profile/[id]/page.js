"use client";
import AddressPage from "@/components/tab/Address/Address";
import BackOffice from "@/components/tab/BackOffice/BackOffice";
import BankPage from "@/components/tab/Bank/Bank";
import Exchange from "@/components/tab/Exchange/Exchange";
import Ipv from "@/components/tab/Ipv/Ipv";
import Pdf from "@/components/tab/Pdf/Pdf";
import ProfilePage from "@/components/tab/Profile/Profile";
import RejectionReason from "@/components/tab/RejectionReason/RejectionReason";
import Signature from "@/components/tab/Signature/Signature";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function SupervisorEsignPage() {
  const searchParams = useSearchParams();
  const activePage = searchParams.get("tab") || "address";

  return (
    <div className="flex">
      <div className="flex-1 p-0">
        {activePage === "address" && (
          <>
            <AddressPage />
          </>
        )}
        {activePage === "profile" && (
          <>
            <ProfilePage />
          </>
        )}
        {activePage === "bank" && (
          <>
            <BankPage />
          </>
        )}
        {activePage === "exchange" && (
          <>
            <Exchange />
          </>
        )}
        {activePage === "ipv" && (
          <>
            <Ipv />
          </>
        )}
        {activePage === "signature" && (
          <>
            <Signature />
          </>
        )}
        {activePage === "pdf" && (
          <>
            <Pdf />
          </>
        )}
        {activePage === "pushedToBO" && (
          <>
            <BackOffice />
          </>
        )}
          {activePage === "rejection" && (
          <>
            <RejectionReason />
          </>
        )}
      </div>
    </div>
  );
}
