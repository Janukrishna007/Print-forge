(function () {
  function initMapper(root) {
    const stage = root.querySelector(".printforge-admin-stage");
    const img = stage.querySelector("img");
    const canvas = stage.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const printAreaField = document.getElementById("id_print_area");
    const pointsField = document.getElementById("id_perspective_points");
    if (!img || !canvas || !printAreaField || !pointsField) return;

    let printArea = JSON.parse(printAreaField.value || root.dataset.printArea || "{\"x\":120,\"y\":160,\"width\":520,\"height\":520}");
    let points = JSON.parse(pointsField.value || root.dataset.points || "[[120,160],[640,160],[640,680],[120,680]]");
    let pointIndex = 0;
    let dragging = false;
    let dragOffset = { x: 0, y: 0 };

    function getScale() {
      return {
        x: img.clientWidth / img.naturalWidth,
        y: img.clientHeight / img.naturalHeight,
      };
    }

    function syncFields() {
      printAreaField.value = JSON.stringify(printArea);
      pointsField.value = JSON.stringify(points);
    }

    function draw() {
      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
      const scale = getScale();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(59,130,246,0.16)";
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.fillRect(printArea.x * scale.x, printArea.y * scale.y, printArea.width * scale.x, printArea.height * scale.y);
      ctx.strokeRect(printArea.x * scale.x, printArea.y * scale.y, printArea.width * scale.x, printArea.height * scale.y);
      ctx.beginPath();
      points.forEach(function (point, index) {
        const x = point[0] * scale.x;
        const y = point[1] * scale.y;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      if (points.length === 4) ctx.closePath();
      ctx.strokeStyle = "#8B5CF6";
      ctx.stroke();
      points.forEach(function (point, index) {
        const x = point[0] * scale.x;
        const y = point[1] * scale.y;
        ctx.beginPath();
        ctx.fillStyle = "#F8FAFC";
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#020617";
        ctx.fillText(String(index + 1), x + 8, y - 8);
      });
    }

    function toImageCoords(event) {
      const rect = canvas.getBoundingClientRect();
      const scale = getScale();
      return {
        x: Math.round((event.clientX - rect.left) / scale.x),
        y: Math.round((event.clientY - rect.top) / scale.y),
      };
    }

    canvas.addEventListener("mousedown", function (event) {
      const coords = toImageCoords(event);
      if (
        coords.x >= printArea.x &&
        coords.x <= printArea.x + printArea.width &&
        coords.y >= printArea.y &&
        coords.y <= printArea.y + printArea.height
      ) {
        dragging = true;
        dragOffset = { x: coords.x - printArea.x, y: coords.y - printArea.y };
        return;
      }
      points[pointIndex] = [coords.x, coords.y];
      pointIndex = (pointIndex + 1) % 4;
      syncFields();
      draw();
    });

    window.addEventListener("mouseup", function () {
      dragging = false;
    });

    canvas.addEventListener("mousemove", function (event) {
      if (!dragging) return;
      const coords = toImageCoords(event);
      printArea.x = Math.max(0, coords.x - dragOffset.x);
      printArea.y = Math.max(0, coords.y - dragOffset.y);
      syncFields();
      draw();
    });

    canvas.addEventListener("wheel", function (event) {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 12 : -12;
      printArea.width = Math.max(40, printArea.width + delta);
      printArea.height = Math.max(40, printArea.height + delta);
      syncFields();
      draw();
    });

    window.addEventListener("resize", draw);
    if (img.complete) draw();
    else img.addEventListener("load", draw);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-printforge-mapper]").forEach(initMapper);
  });
})();
