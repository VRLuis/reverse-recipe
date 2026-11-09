import { DetectedLabel } from "../detected-label.interface";

export interface BaseResponseInterface {
    status: number,
    message: string,
    labels?: DetectedLabel[],
    recipes?: string
}
