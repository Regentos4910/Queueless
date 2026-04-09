export type Coordinates = {
  lat: number;
  lng: number;
};

export type Facility = {
  id: string;
  name: string;
  location: Coordinates;
  medianServiceTime: number;
  adminOverrideTime?: number | null;
  queueSize?: number;
  waitingTime?: number;
  createdAt?: string | null;
};
