const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function parseResponse(response) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || payload.error_message || "Request failed");
  }
  return response.json();
}

export async function fetchProducts() {
  return parseResponse(await fetch(`${API_BASE}/products/`));
}

export async function fetchProduct(productId) {
  return parseResponse(await fetch(`${API_BASE}/products/${productId}/`));
}

export async function customizeProduct(formData) {
  return parseResponse(
    await fetch(`${API_BASE}/customize/`, {
      method: "POST",
      body: formData,
    }),
  );
}

export async function fetchCustomizationStatus(jobId) {
  return parseResponse(await fetch(`${API_BASE}/customize/${jobId}/status/`));
}

export async function fetchCustomizationResult(jobId) {
  return parseResponse(await fetch(`${API_BASE}/customize/${jobId}/result/`));
}

export async function updateProductViewMapping(viewId, payload) {
  return parseResponse(
    await fetch(`${API_BASE}/product-views/${viewId}/mapping/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  );
}
