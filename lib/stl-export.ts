import { booleans } from "@jscad/modeling";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";

export async function exportSTL(geometry: Geom3 | Geom3[], filename = "model.stl") {
  const stlSerializer = (await import("@jscad/stl-serializer")).default;

  const merged = Array.isArray(geometry)
    ? booleans.union(...geometry)
    : geometry;

  const rawData = stlSerializer.serialize({ binary: true }, merged);
  const blob = new Blob(rawData as BlobPart[], {
    type: "application/octet-stream",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
