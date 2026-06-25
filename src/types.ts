interface Stop {
  readonly id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number
  };
  fixedTimes?: {
    start: number;
    end: number;
  }
  durationMinutes: number;
}