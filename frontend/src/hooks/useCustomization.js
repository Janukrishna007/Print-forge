import { useEffect, useRef, useState } from "react";

import { customizeProduct, fetchCustomizationResult, fetchCustomizationStatus } from "../services/api";

export function useCustomization() {
  const [job, setJob] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  async function startCustomization(payload) {
    setError("");
    setResult(null);
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    const response = await customizeProduct(payload);
    setJob(response);
    pollRef.current = window.setInterval(async () => {
      try {
        const status = await fetchCustomizationStatus(response.id);
        setJob(status);
        if (status.status === "completed") {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
          const output = await fetchCustomizationResult(response.id);
          setResult(output);
        }
        if (status.status === "failed") {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
          setError(status.error_message || "Rendering failed");
        }
      } catch (err) {
        setError(err.message);
      }
    }, 1600);
    return response;
  }

  function resetCustomizationState() {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setJob(null);
    setResult(null);
    setError("");
  }

  return {
    job,
    result,
    error,
    startCustomization,
    resetCustomizationState,
    isRendering: Boolean(job && !["completed", "failed"].includes(job.status)),
  };
}
