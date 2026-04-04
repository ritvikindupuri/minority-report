const SESSION_KEY = "minority_report_session";
const BUILDING_KEY = "minority_report_building";

export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSelectedBuilding(): string | null {
  return localStorage.getItem(BUILDING_KEY);
}

export function setSelectedBuilding(id: string): void {
  localStorage.setItem(BUILDING_KEY, id);
}
