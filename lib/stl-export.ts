import stlSerializer from "@jscad/stl-serializer";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";

export function exportSTL(geometry: Geom3, filename = "model.stl") {
  const rawData = stlSerializer.serialize({ binary: true }, geometry);
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
