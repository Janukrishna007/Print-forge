import numpy as np
from django.test import SimpleTestCase
from PIL import Image, ImageDraw

from .utils import RenderTransform, fit_design_to_area, sanitize_design_image, warp_design


class RenderingUtilsTests(SimpleTestCase):
    def setUp(self):
        self.design = Image.new("RGBA", (300, 200), (0, 0, 0, 0))
        draw = ImageDraw.Draw(self.design)
        draw.rectangle((40, 40, 260, 160), fill=(59, 130, 246, 255))
        self.area = {"x": 100, "y": 120, "width": 240, "height": 180}

    def test_fit_design_to_area_respects_target_bounds(self):
        fitted = fit_design_to_area(self.design, self.area, scale=1.0)
        self.assertEqual(fitted.size, (240, 180))

    def test_warp_design_returns_canvas_sized_image(self):
        warped = warp_design(
            self.design,
            output_size=(640, 640),
            area=self.area,
            perspective_points=[[100, 120], [320, 130], [300, 290], [115, 300]],
            transform=RenderTransform(scale=1.0, offset_x=5, offset_y=10),
        )
        self.assertEqual(warped.shape, (640, 640, 4))
        self.assertGreater(int(warped[:, :, 3].sum()), 0)

    def test_warp_design_scale_changes_occupied_area(self):
        base = warp_design(
            self.design,
            output_size=(640, 640),
            area=self.area,
            perspective_points=None,
            transform=RenderTransform(scale=1.0, offset_x=0, offset_y=0),
        )
        enlarged = warp_design(
            self.design,
            output_size=(640, 640),
            area=self.area,
            perspective_points=None,
            transform=RenderTransform(scale=1.35, offset_x=0, offset_y=0),
        )

        base_alpha = np.argwhere(base[:, :, 3] > 0)
        enlarged_alpha = np.argwhere(enlarged[:, :, 3] > 0)
        base_height = int(base_alpha[:, 0].max() - base_alpha[:, 0].min())
        enlarged_height = int(enlarged_alpha[:, 0].max() - enlarged_alpha[:, 0].min())
        self.assertGreater(enlarged_height, base_height)

    def test_sanitize_design_image_removes_near_white_background(self):
        design = Image.new("RGBA", (120, 120), (255, 255, 255, 255))
        draw = ImageDraw.Draw(design)
        draw.rectangle((30, 30, 90, 90), fill=(12, 120, 40, 255))
        sanitized = sanitize_design_image(design)
        self.assertLess(sanitized.size[0], 120)
        self.assertLess(sanitized.size[1], 120)
        alpha = np.array(sanitized)[:, :, 3]
        self.assertGreater(int(alpha.max()), 0)

    def test_sanitize_design_image_preserves_non_edge_white_details(self):
        design = Image.new("RGBA", (120, 120), (255, 255, 255, 255))
        draw = ImageDraw.Draw(design)
        draw.rectangle((20, 20, 100, 100), fill=(5, 5, 5, 255))
        draw.rectangle((42, 42, 78, 78), fill=(255, 255, 255, 255))
        sanitized = sanitize_design_image(design)
        alpha = np.array(sanitized)[:, :, 3]
        self.assertGreater(int(alpha.max()), 0)
        self.assertGreater(int(alpha[alpha.shape[0] // 2, alpha.shape[1] // 2]), 0)
