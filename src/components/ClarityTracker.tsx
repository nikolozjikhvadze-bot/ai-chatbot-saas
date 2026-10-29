"use client";

import { useEffect } from "react";
import clarity from "@microsoft/clarity";

export default function ClarityTracker() {
  useEffect(() => {
    clarity.init("z4rld1d7cy");
  }, []);

  return null;
}