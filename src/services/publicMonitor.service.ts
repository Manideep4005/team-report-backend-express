import crypto from "crypto";
import publicMonitorRepository from "../repositories/publicMonitor.repository";
import {
    getISTRange,
} from "../utils/date";

type ExpirationType = "MINUTES" | "HOURS" | "NEVER";

interface CreateMonitorLinkInput {
    createdById: string;
    expirationType: ExpirationType;
    expirationValue?: number;
}

class PublicMonitorService {

    async getPublicMonitor(
        token: string,
        date?: string
    ) {

        const link =
            await this.getValidLink(token);

        if (!link) {
            throw new Error(
                "Monitoring link is invalid, expired, or revoked."
            );
        }


        /*
         * If no date is supplied, use today.
         *
         * If a date is supplied, use that date.
         */
        const monitorDate =
            date ??
            new Date()
                .toLocaleDateString(
                    "en-CA",
                    {
                        timeZone: "Asia/Kolkata",
                    }
                );


        const {
            start,
            end,
        } = getISTRange(monitorDate);


        const [
            teamMembers,
            reports,
        ] = await Promise.all([
            publicMonitorRepository.findTeamMembers(),

            publicMonitorRepository.findUserReportsByDate(
                start,
                end
            ),
        ]);


        const reportMap =
            new Map(
                reports.map(
                    report => [
                        report.user.id,
                        report,
                    ]
                )
            );


        const teamStatus =
            teamMembers.map(user => {

                const report =
                    reportMap.get(user.id);


                return {
                    id: user.id,
                    name: user.name,
                    submitted: Boolean(report),

                    report: report
                        ? {
                            id: report.id,
                            reportDate:
                                report.reportDate,
                            description:
                                report.description,
                            createdAt:
                                report.createdAt,
                            updatedAt:
                                report.updatedAt,
                        }
                        : null,
                };
            });


        const submitted =
            teamStatus.filter(
                member => member.submitted
            ).length;


        const totalMembers =
            teamStatus.length;


        const completion =
            totalMembers > 0
                ? Math.round(
                    (submitted / totalMembers) * 100
                )
                : 0;


        return {
            date: monitorDate,

            stats: {
                submitted,
                totalMembers,
                completion,
            },

            teamStatus,
        };
    }

    /**
     * Generate a cryptographically secure random token.
     */
    private generateToken(): string {
        return crypto.randomBytes(32).toString("hex");
    }


    /**
     * Hash token before storing it.
     */
    private hashToken(token: string): string {
        return crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
    }


    /**
     * Calculate expiration timestamp.
     */
    private calculateExpiration(
        expirationType: ExpirationType,
        expirationValue?: number
    ): Date | null {

        if (expirationType === "NEVER") {
            return null;
        }


        if (
            expirationValue === undefined ||
            !Number.isInteger(expirationValue) ||
            expirationValue <= 0
        ) {
            throw new Error(
                "Expiration value must be a positive integer."
            );
        }


        const now = Date.now();


        if (expirationType === "MINUTES") {
            return new Date(
                now + expirationValue * 60 * 1000
            );
        }


        if (expirationType === "HOURS") {
            return new Date(
                now + expirationValue * 60 * 60 * 1000
            );
        }


        throw new Error(
            "Invalid expiration type."
        );
    }


    /**
     * Create a public monitoring link.
     */
    async createLink(
        input: CreateMonitorLinkInput
    ) {

        const {
            createdById,
            expirationType,
            expirationValue,
        } = input;


        const token = this.generateToken();

        const tokenHash =
            this.hashToken(token);


        const expiresAt =
            this.calculateExpiration(
                expirationType,
                expirationValue
            );


        const link =
            await publicMonitorRepository.create({
                tokenHash,
                createdById,
                expiresAt,
            });


        /*
         * Raw token is returned only once.
         * It is never stored in the database.
         */
        return {
            id: link.id,
            token,
            expiresAt: link.expiresAt,
            isActive: link.isActive,
            createdAt: link.createdAt,
        };
    }


    /**
     * Find and validate a public monitoring link.
     */
    async getValidLink(
        token: string
    ) {

        if (!token) {
            return null;
        }


        const tokenHash =
            this.hashToken(token);


        const link =
            await publicMonitorRepository
                .findByTokenHash(tokenHash);


        if (!link) {
            return null;
        }


        /*
         * Manually revoked.
         */
        if (!link.isActive) {
            return null;
        }


        /*
         * Expired.
         */
        if (
            link.expiresAt &&
            link.expiresAt <= new Date()
        ) {
            return null;
        }


        return link;
    }


    /**
     * Revoke a monitoring link.
     */
    async revokeLink(
        linkId: string,
        revokedById: string
    ) {

        const link =
            await publicMonitorRepository
                .findById(linkId);


        if (!link) {
            throw new Error(
                "Monitoring link not found."
            );
        }


        if (!link.isActive) {
            throw new Error(
                "Monitoring link is already revoked."
            );
        }


        return publicMonitorRepository.revoke(
            linkId,
            revokedById
        );
    }


    /**
     * Get generated monitoring links.
     */
    async getLinks() {

        return publicMonitorRepository.findAll();
    }
}


export default new PublicMonitorService();