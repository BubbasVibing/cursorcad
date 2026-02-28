import threemfSerializer from "@jscad/3mf-serializer";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";

export function export3MF(geometry: Geom3, filename = "model.3mf") {
  const rawData = threemfSerializer.serialize({ binary: true }, geometry);
  const blob = new Blob(rawData as BlobPart[], {
    type: "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
