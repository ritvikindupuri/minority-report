export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  yaw: number;
  pitch: number;
}

export interface Camera {
  id: string;
  building_id: string;
  position: Position;
  rotation: Rotation;
  fov: number;
  coverage_radius: number;
  placement_score: number;
}

export interface Building {
  id: string;
  name: string;
  lat: number;
  lng: number;
  footprint_polygon: Array<[number, number]>;
  splat_asset: string;
}

export interface Simulation {
  camera_id: string;
  status: "pending" | "generating" | "complete" | "failed";
  prompt: string;
  video_url: string | null;
  frames?: string[]; // Optional for comic book frame by frame
  error?: string;
}

export interface Session {
  session_id: string;
  building: Building | null;
  cameras: Camera[];
  simulation: Simulation | null;
  placement_complete: boolean;
}

export interface CreateSessionResponse {
  session_id: string;
}

export interface SetBuildingRequest {
  building_id: string;
  name: string;
  lat: number;
  lng: number;
  footprint_polygon: Array<[number, number]>;
}

export interface SetBuildingResponse {
  building: Building;
}

export interface GetBuildingResponse {
  building: Building | null;
}

export interface PlaceCamerasRequest {
  camera_count: number;
}

export interface PlaceCamerasResponse {
  cameras: Camera[];
  coverage_score: number;
  placement_complete: boolean;
}

export interface GetCamerasResponse {
  cameras: Camera[];
  placement_complete: boolean;
}

export interface GetCameraResponse {
  camera: Camera;
}

export interface SimulateRequest {
  prompt: string;
}

export interface SimulateResponse {
  simulation_id: string;
  status: "pending";
  camera_id: string;
  prompt: string;
}

export interface GetSimulationResponse {
  status: "pending" | "generating" | "complete" | "failed";
  prompt: string;
  video_url: string | null;
  frames?: string[]; // Optional for comic book frame by frame
  error?: string;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
}

export type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

export interface ApiRequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}
