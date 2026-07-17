export function getISTTodayRange() {
    const now = new Date();

    // Convert current UTC time to IST
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

    // Start of IST day
    const startIST = new Date(
        istNow.getFullYear(),
        istNow.getMonth(),
        istNow.getDate()
    );

    // Convert back to UTC for storing/querying
    const startUTC = new Date(startIST.getTime() - 5.5 * 60 * 60 * 1000);

    const endUTC = new Date(startUTC);
    endUTC.setUTCDate(endUTC.getUTCDate() + 1);

    return {
        start: startUTC,
        end: endUTC,
    };
}


export function getISTRange(date: string) {
    const [year, month, day] = date.split("-").map(Number);

    // IST midnight
    const startIST = new Date(year, month - 1, day);

    // Convert IST -> UTC
    const start = new Date(startIST.getTime() - 5.5 * 60 * 60 * 1000);

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return { start, end };
}