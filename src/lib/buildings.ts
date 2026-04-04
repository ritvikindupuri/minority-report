import type { Building } from "./types";

export const PRELOADED_BUILDINGS: Building[] = [
  {
    id: "purdue-lawson",
    name: "Lawson Computer Science Building",
    lat: 40.4278,
    lng: -86.9170,
    footprint_polygon: [
      [40.42762, -86.91748],
      [40.42762, -86.91653],
      [40.42785, -86.91653],
      [40.42785, -86.91701],
      [40.42798, -86.91701],
      [40.42798, -86.91748],
    ],
    splat_asset: "lawson.splat",
  },
  {
    id: "purdue-pmu",
    name: "Purdue Memorial Union",
    lat: 40.4247,
    lng: -86.9106,
    footprint_polygon: [
      [40.42443, -86.91131],
      [40.42443, -86.90989],
      [40.42470, -86.90989],
      [40.42470, -86.91060],
      [40.42497, -86.91060],
      [40.42497, -86.91131],
      [40.42483, -86.91131],
      [40.42483, -86.91170],
      [40.42443, -86.91170],
    ],
    splat_asset: "pmu.splat",
  },
  {
    id: "purdue-armstrong",
    name: "Neil Armstrong Hall of Engineering",
    lat: 40.4314,
    lng: -86.9193,
    footprint_polygon: [
      [40.43118, -86.91977],
      [40.43118, -86.91883],
      [40.43163, -86.91883],
      [40.43163, -86.91977],
    ],
    splat_asset: "armstrong.splat",
  },
];
