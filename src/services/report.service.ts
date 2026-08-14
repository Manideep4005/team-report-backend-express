import reportRepository from "../repositories/report.repository";
import userRepository from "../repositories/user.repository";
import googleSheetsService from "./googleSheets.service";

import {
    getISTDateRange,
    getISTRange,
    getISTTodayRange,
} from "../utils/date";

class ReportService {

    async save(
        userId: string,
        description: string,
        reportDate: string
    ) {
        const { start } = getISTDateRange(
            new Date(reportDate)
        );

        // 1. Save/update the report in PostgreSQL
        const report = await reportRepository.upsert(
            userId,
            description,
            start
        );

        // 2. Get the current user name
        const user = await userRepository.findById(
            userId
        );

        // 3. Try to synchronize with Google Sheets
        //
        // Google Sheets must NEVER cause the
        // report save itself to fail.
        // if (user) {
        //     try {
        //         await googleSheetsService.syncReport(
        //             user.name,
        //             start,
        //             description
        //         );
        //     } catch (error) {
        //         console.error(
        //             "Google Sheets synchronization failed:",
        //             error
        //         );
        //     }
        // }

        // 4. Return the database report
        return report;
    }

    async today(userId: string) {

        const { start, end } =
            getISTTodayRange();

        return reportRepository.findToday(
            userId,
            start,
            end
        );
    }

    async history(
        userId: string,
        date?: string
    ) {

        let where = {};

        if (date) {

            const { start, end } =
                getISTRange(date);

            where = {
                reportDate: {
                    gte: start,
                    lt: end,
                },
            };
        }

        return reportRepository.history(
            userId,
            where
        );
    }

    async all(date?: string) {
        let where = {};

        if (date) {
            const { start, end } = getISTRange(date);

            where = {
                reportDate: {
                    gte: start,
                    lt: end,
                },
            };
        }

        return reportRepository.findAll(where);
    }
}

export default new ReportService();