import { useEffect, useState } from "react";

import { fetchProduct, fetchProducts, updateProductViewMapping } from "../services/api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedView, setSelectedView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const items = await fetchProducts();
        if (!active) return;
        setProducts(items);
        if (items.length > 0) {
          const detail = await fetchProduct(items[0].id);
          if (!active) return;
          setSelectedProduct(detail);
          setSelectedView(detail.views[0] ?? null);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function selectProduct(productId) {
    setLoading(true);
    try {
      const detail = await fetchProduct(productId);
      setSelectedProduct(detail);
      setSelectedView(detail.views[0] ?? null);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveViewMapping(viewId, printArea) {
    const response = await updateProductViewMapping(viewId, { print_area: printArea });
    setSelectedProduct((current) => {
      if (!current) return current;
      return {
        ...current,
        views: current.views.map((view) =>
          view.id === viewId
            ? { ...view, print_area: response.print_area, perspective_points: response.perspective_points }
            : view,
        ),
      };
    });
    setSelectedView((current) =>
      current?.id === viewId
        ? { ...current, print_area: response.print_area, perspective_points: response.perspective_points }
        : current,
    );
    return response;
  }

  return {
    products,
    selectedProduct,
    selectedView,
    setSelectedView,
    selectProduct,
    saveViewMapping,
    loading,
    error,
  };
}
