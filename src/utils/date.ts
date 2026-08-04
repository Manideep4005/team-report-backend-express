import { startOfDay, addDays } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TIME_ZONE = "Asia/Kolkata";

export function getISTTodayRange() {
    const now = new Date();

    // Current time represented in IST
    const zonedNow = toZonedTime(now, TIME_ZONE);

    // Midnight in IST
    const startOfTodayIST = startOfDay(zonedNow);

    // Convert IST midnight back to UTC for DB queries/storage
    const start = fromZonedTime(startOfTodayIST, TIME_ZONE);

    const end = addDays(start, 1);

    return { start, end };
}

export function getISTDateRange(date: Date) {
    // Convert input date to IST
    const zonedDate = toZonedTime(date, TIME_ZONE);

    // Start of that day in IST
    const startOfDateIST = startOfDay(zonedDate);

    // Convert back to UTC for DB query
    const start = fromZonedTime(startOfDateIST, TIME_ZONE);
    const end = addDays(start, 1);

    return { start, end };
}

export function getISTRange(date: string) {
    const [year, month, day] = date.split("-").map(Number);

    // Construct midnight in IST
    const start = fromZonedTime(
        new Date(year, month - 1, day),
        TIME_ZONE
    );

    const end = addDays(start, 1);

    return { start, end };
}