import { bbangtoTonyStyleGuide, bbangtoTonyFoundation } from "/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-069-M724GH/src/lib/motion/bbangtoTonyStyleGuide.ts";
import { blogVizStyleGuide } from "/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-069-M724GH/src/lib/viz/blogVizStyleGuide.ts";

const CORE_FIELDS = ["name","description","foundations","extendedFoundations","foundationPresets","defaultFoundationKey","guidelines","meta","wrapperComponents","wrapperBlocks","wrapperPatterns","patterns","visualMotif"];
const VIZ_FIELDS  = ["name","description","foundations","extendedFoundations","foundationPresets","defaultFoundationKey","guidelines","meta","wrapperComponents","patterns","visualMotif"];

const probe = (sg: any, fields: string[]) => {
  const out: Record<string, any> = {};
  for (const f of fields) {
    const v = sg[f];
    out[f] = v === undefined ? "ABSENT"
      : v === null ? "null"
      : Array.isArray(v) ? `array(${v.length})`
      : typeof v === "object" ? `object(keys=${Object.keys(v).length})`
      : typeof v === "string" ? `string("${v}")`
      : String(v);
  }
  out["__ownKeys"] = Object.keys(sg).sort().join(",");
  return out;
};

console.log(JSON.stringify({
  bbangtoTonyStyleGuide: probe(bbangtoTonyStyleGuide, CORE_FIELDS),
  blogVizStyleGuide: probe(blogVizStyleGuide, VIZ_FIELDS),
  bbangtoTonyFoundation_topKeys: Object.keys(bbangtoTonyFoundation).sort(),
}, null, 1));
