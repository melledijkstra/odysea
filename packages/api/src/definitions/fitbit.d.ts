export type SleepResponse = {
  summary: {
    stages: {
      deep: number
      light: number
      rem: number
      wake: number
    }
    totalMinutesAsleep: number
    totalSleepRecords: number
    totalTimeInBed: number
  }
}
