import teamRepository from "../repositories/team.repository";
import { getISTTodayRange } from "../utils/date";

class TeamService {

    async getTodayReports() {

        const { start, end } = getISTTodayRange();

        return teamRepository.getTodayReports(
            start,
            end
        );

    }

}

export default new TeamService();