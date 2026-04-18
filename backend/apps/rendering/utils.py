from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from io import BytesIO
import os

import cv2
import numpy as np
from PIL import Image


@dataclass
class RenderTransform:
    scale: float = 1.0
    offset_x: float = 0.0
    offset_y: float = 0.0
    opacity: float = 1.0
    blend_mode: str = "alpha_composite"


def pil_to_rgba_array(image: Image.Image) -> np.ndarray:
    return np.array(image.convert("RGBA"), dtype=np.uint8)


def rgba_array_to_pil(image: np.ndarray) -> Image.Image:
    return Image.fromarray(np.clip(image, 0, 255).astype(np.uint8), mode="RGBA")


def fit_design_to_area(design: Image.Image, area: dict, scale: float = 1.0) -> Image.Image:
    target_width = max(1, int(area["width"] * max(scale, 0.1)))
    target_height = max(1, int(area["height"] * max(scale, 0.1)))
    design = design.convert("RGBA")
    ratio = min(target_width / design.width, target_height / design.height)
    resized = design.resize((max(1, int(design.width * ratio)), max(1, int(design.height * ratio))), Image.LANCZOS)
    canvas = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((target_width - resized.width) // 2, (target_height - resized.height) // 2))
    return canvas


def remove_near_white_background(design: Image.Image, threshold: int = 245, softness: int = 24) -> Image.Image:
    rgba = np.array(design.convert("RGBA"), dtype=np.uint8)
    rgb = rgba[:, :, :3].astype(np.int16)
    alpha = rgba[:, :, 3]

    min_rgb = rgb.min(axis=2)
    max_rgb = rgb.max(axis=2)
    near_white = min_rgb >= threshold
    low_saturation = (max_rgb - min_rgb) <= softness
    candidate = near_white & low_saturation & (alpha > 0)
    if not candidate.any():
        return Image.fromarray(rgba, mode="RGBA")

    height, width = candidate.shape
    background_mask = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(y: int, x: int) -> None:
        if candidate[y, x] and not background_mask[y, x]:
            background_mask[y, x] = True
            queue.append((y, x))

    for x in range(width):
        enqueue(0, x)
        enqueue(height - 1, x)
    for y in range(height):
        enqueue(y, 0)
        enqueue(y, width - 1)

    while queue:
        y, x = queue.popleft()
        if y > 0:
            enqueue(y - 1, x)
        if y + 1 < height:
            enqueue(y + 1, x)
        if x > 0:
            enqueue(y, x - 1)
        if x + 1 < width:
            enqueue(y, x + 1)

    rgba[background_mask, 3] = 0
    return Image.fromarray(rgba, mode="RGBA")


def crop_to_visible_content(design: Image.Image, alpha_threshold: int = 8, padding: int = 8) -> Image.Image:
    rgba = np.array(design.convert("RGBA"), dtype=np.uint8)
    alpha = rgba[:, :, 3]
    nonzero = np.argwhere(alpha > alpha_threshold)
    if nonzero.size == 0:
        return design.convert("RGBA")

    top_left = nonzero.min(axis=0)
    bottom_right = nonzero.max(axis=0)
    y1 = max(0, int(top_left[0]) - padding)
    x1 = max(0, int(top_left[1]) - padding)
    y2 = min(rgba.shape[0], int(bottom_right[0]) + padding + 1)
    x2 = min(rgba.shape[1], int(bottom_right[1]) + padding + 1)
    return Image.fromarray(rgba[y1:y2, x1:x2], mode="RGBA")


def sanitize_design_image(design: Image.Image) -> Image.Image:
    cleaned = remove_near_white_background(design)
    return crop_to_visible_content(cleaned)


def build_destination_points(area: dict, perspective_points: list | None) -> np.ndarray:
    if perspective_points and len(perspective_points) == 4:
        return np.array(perspective_points, dtype=np.float32)
    x = float(area["x"])
    y = float(area["y"])
    width = float(area["width"])
    height = float(area["height"])
    return np.array([[x, y], [x + width, y], [x + width, y + height], [x, y + height]], dtype=np.float32)


def transform_destination_points(points: np.ndarray, transform: RenderTransform) -> np.ndarray:
    scale = max(float(transform.scale), 0.1)
    center = points.mean(axis=0)
    transformed = (points - center) * scale + center
    transformed[:, 0] += float(transform.offset_x)
    transformed[:, 1] += float(transform.offset_y)
    return transformed.astype(np.float32)


def warp_design(
    design: Image.Image,
    output_size: tuple[int, int],
    area: dict,
    perspective_points: list | None = None,
    transform: RenderTransform | None = None,
) -> np.ndarray:
    transform = transform or RenderTransform()
    fitted = fit_design_to_area(design, area, scale=1.0)
    design_rgba = pil_to_rgba_array(fitted)
    src_h, src_w = design_rgba.shape[:2]
    src_points = np.array([[0, 0], [src_w, 0], [src_w, src_h], [0, src_h]], dtype=np.float32)
    dst_points = transform_destination_points(build_destination_points(area, perspective_points), transform)
    matrix = cv2.getPerspectiveTransform(src_points, dst_points)
    return cv2.warpPerspective(
        design_rgba,
        matrix,
        output_size,
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0, 0),
    )

def _soft_light(base: np.ndarray, blend: np.ndarray) -> np.ndarray:
    base = base.astype(np.float32) / 255.0
    blend = blend.astype(np.float32) / 255.0
    result = (1 - 2 * blend) * (base ** 2) + 2 * blend * base
    return np.clip(result * 255, 0, 255).astype(np.uint8)


def _overlay(base: np.ndarray, blend: np.ndarray) -> np.ndarray:
    base_f = base.astype(np.float32) / 255.0
    blend_f = blend.astype(np.float32) / 255.0
    result = np.where(base_f <= 0.5, 2 * base_f * blend_f, 1 - 2 * (1 - base_f) * (1 - blend_f))
    return np.clip(result * 255, 0, 255).astype(np.uint8)


def blend_layers(base: np.ndarray, overlay: np.ndarray, mode: str = "soft_light", opacity: float = 1.0) -> np.ndarray:
    opacity = float(np.clip(opacity, 0.0, 1.0))
    base_rgb = base[:, :, :3]
    overlay_rgb = overlay[:, :, :3]
    overlay_alpha = (overlay[:, :, 3:4].astype(np.float32) / 255.0) * opacity

    if mode == "alpha_composite":
        blended_rgb = overlay_rgb
    elif mode == "multiply":
        blended_rgb = ((base_rgb.astype(np.float32) * overlay_rgb.astype(np.float32)) / 255.0).astype(np.uint8)
    elif mode == "overlay":
        blended_rgb = _overlay(base_rgb, overlay_rgb)
    else:
        blended_rgb = _soft_light(base_rgb, overlay_rgb)

    final_rgb = (base_rgb.astype(np.float32) * (1 - overlay_alpha) + blended_rgb.astype(np.float32) * overlay_alpha).astype(np.uint8)
    final_alpha = np.maximum(base[:, :, 3:4], (overlay[:, :, 3:4].astype(np.float32) * opacity).astype(np.uint8)).astype(np.uint8)
    return np.dstack([final_rgb, final_alpha])


def composite_on_base(base_image: Image.Image, overlay_image: np.ndarray, transform: RenderTransform | None = None) -> Image.Image:
    transform = transform or RenderTransform()
    base_rgba = pil_to_rgba_array(base_image)
    composited = blend_layers(base_rgba, overlay_image, mode=transform.blend_mode, opacity=transform.opacity)
    return rgba_array_to_pil(composited)


def save_image_to_content(image: Image.Image, filename: str) -> tuple[str, bytes]:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return os.path.splitext(filename)[0] + ".png", buffer.getvalue()
