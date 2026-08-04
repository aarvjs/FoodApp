"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BranchManagerRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/branch-manager/dashboard");
  }, [router]);

  return null;
}
