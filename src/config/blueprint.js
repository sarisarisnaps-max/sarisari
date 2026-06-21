// True physical proportions of the manufactured product — owner-supplied
// 2026-06-21 from the 3D/SCAD model. All units mm. Replaces the earlier
// uniform `p-[5%]` / `rounded-[16px]` / `gap-[3.5%]` / `rounded-[7%]`
// approximations in FramePreview.jsx + PhotoGrid.jsx with the real numbers.
//
// Why this can't just be CSS percentages: padding-top/bottom percentages in
// CSS always resolve against the box's own WIDTH (a real CSS quirk, not a
// bug) and grid row-gap percentages resolve against an auto/indefinite
// height as 0. Both break the moment outer_w !== outer_h (true for every
// non-square SKU). So FramePreview measures its own rendered width via
// ResizeObserver and converts every mm value to real pixels using a single
// scale factor — see FramePreview.jsx for the derivation/proof that this
// stays self-consistent (total rendered height naturally lands on
// outer_h * scale without ever measuring height directly).
export const SCAD = {
  cell_w: 52,
  cell_h: 52,
  cell_gap: 3,
  frame_left: 3,
  frame_right: 3,
  frame_top: 3,
  frame_bottom: 16,
  floor_thickness: 3.9,
  pocket_depth: 3.3,
  outer_corner_r: 3,
  pocket_corner_r: 5,
}

// Real outer footprint (mm) for a given grid shape — everything else
// (padding, gap, radii) is expressed in mm too and converted to px by
// FramePreview using outer_w as the calibration reference.
export function deriveBlueprint(cols, rows) {
  const paw = cols * SCAD.cell_w + (cols - 1) * SCAD.cell_gap // pocket-area width
  const pah = rows * SCAD.cell_h + (rows - 1) * SCAD.cell_gap // pocket-area height
  const outer_w = SCAD.frame_left + paw + SCAD.frame_right
  const outer_h = SCAD.frame_bottom + pah + SCAD.frame_top
  return { cols, rows, paw, pah, outer_w, outer_h }
}

// Cell (pocket) corner radius as a percentage of the cell's OWN size — safe
// to use as a plain CSS percentage with no measurement needed, because every
// cell is forced aspect-square (width === height), so a single percentage
// radius can't distort into an ellipse the way the outer frame's would.
export const POCKET_RADIUS_PCT = (SCAD.pocket_corner_r / SCAD.cell_w) * 100
