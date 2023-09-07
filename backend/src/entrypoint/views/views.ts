import { ITeamBoardRepository, TeamBoardInMemoryRepository } from "../../teamboard/adapter/repository";
import { ModelNotFoundError } from "../../teamboard/domain/errors";

export interface ITeamInfo {
    name: string,
    totalSteps: number
}

export interface ICounterInfo {
    name: string,
    steps: number
}

export interface IView {
    getTeam(teamName: string): ITeamInfo;
    getTeams(): ITeamInfo[];
    getCounter(counterName: string): ICounterInfo;
    getCounters(): ICounterInfo[];

}


export class InMemoryTeamBoardView implements IView {
    repo: ITeamBoardRepository;

    constructor() {
        this.repo = TeamBoardInMemoryRepository.getInstance(); // singleton
    }
    
    getTeam(teamName: string): ITeamInfo {
        const teamData = this.repo.getTeamData(teamName);
        if (teamData) {
            return {
                name: teamData.team.name,
                totalSteps: teamData.total_steps
            }
        }else {
            throw new ModelNotFoundError();
        }
    };

    getTeams(): ITeamInfo[] {
        const teams: ITeamInfo[] = [];
        this.repo.getAllTeamData().forEach(td => {
            teams.push({name: td.team.name, totalSteps: td.total_steps});
        });
        return teams;
    }

    getCounter(counterName: string): ICounterInfo {
        const counter  = this.repo.getCounterData(counterName);
        if (counter){
            return {
                name: counter.counter.name,
                steps: counter.counter.steps
            };
        } else {
            throw new ModelNotFoundError();
        }
    };
    
    getCounters(): ICounterInfo[] {
        const counters: ICounterInfo[] = [];
        this.repo.getAllCounters().forEach(cd => {
            counters.push({name: cd.counter.name, steps: cd.counter.steps});
        });
        return counters;
    }

}