import { Counter, CounterData, Team, TeamBoard, TeamData } from "../domain/models";
import { InternalProblem, ModelExistError, ModelNotFoundError } from "../domain/errors";
import { IEventCollector } from "./unit-of-work";
import { CounterWasAddedToTeamEvent, CounterWasDeleted, Event } from "../domain/events";
// Base Repository that all persistant Storages should extend frm

interface ITeamBoardRepository extends IEventCollector {
    createNewCounter(counter: Counter): boolean;
    getCounterData(counterName: string): CounterData | null ;
    getAllCounters() : CounterData[];
    deleteCounter(counter: Counter): boolean;
    addNewTeam(team: Team): boolean;
    getTeamData(teamName: string): TeamData | null;
    getAllTeamData(): TeamData[];
    deleteTeam(team: Team): boolean;
    incrementCounterSteps(counter: Counter, stepCount: number): boolean;
    addCounterToTeam(counter: Counter, team: Team): boolean;
    getTeamsDataFromCounter(counterName: string): TeamData[];
}

/*
        In-Memory Singleton repository Repository 
*/

class TeamBoardInMemoryRepository implements ITeamBoardRepository {
    private static instance: TeamBoardInMemoryRepository;
    board: TeamBoard;
    seenEvents: Event[];

    private constructor(){
        this.board = new TeamBoard();
        this.seenEvents = [];  
    }

    public static getInstance(): TeamBoardInMemoryRepository {
        if (!TeamBoardInMemoryRepository.instance) {
            TeamBoardInMemoryRepository.instance = new TeamBoardInMemoryRepository();
        }
        return TeamBoardInMemoryRepository.instance;
    }

    createNewCounter(counter: Counter): boolean {
      const canAddCounter = this.board.coutnersData.filter(cd => cd.counter.name === counter.name).length === 0;
      if (canAddCounter){ // check for uniqueness
          this.board.coutnersData.push({counter: counter, counterTeams: []});
          return true;
      }
      else
        throw new ModelExistError(counter); 
    }

    getCounterData(counterName: string): CounterData | null {
        const counter = this.board.coutnersData.filter(cd => cd.counter.name === counterName)
        if (counter.length > 0){
            return counter[0]
        }
        else
          return null;
    }

    deleteCounter(counter: Counter): boolean {
      this.board.coutnersData = this.board.coutnersData.filter(cd =>{
        if (cd.counter.name === counter.name) {
            cd.counterTeams.forEach(teamName => {
            // O=(N + M); N is all counters, M is found counter teams | second loop applies on only one counter.
                this.board.events.push(
                    new CounterWasDeleted(counter.name, teamName, cd.counter.steps)
                )
            })
            return false
        }
      return true;
        });      
      
      return true;
    }
    
    addNewTeam(team: Team): boolean {
        const teamCanBeAdded = this.board.teamsData.filter(td => td.team.name === team.name).length === 0
        if (teamCanBeAdded) { // check for uniquenss
            this.board.teamsData.push({team:team, total_steps: 0});
            return false
        }
        else
            throw new ModelExistError(team);
    }

    getTeamData(teamName: string): TeamData | null {
        const teamData = this.board.teamsData.filter(td => td.team.name === teamName);
        if (teamData.length > 0){
            return teamData[0];
        }
        else
            return null
    }


    deleteTeam(team: Team): boolean {
      this.board.teamsData = this.board.teamsData.filter(td => td.team.name !== team.name);
      return true
    }
    
    incrementCounterSteps(counter: Counter, stepCount: number=1): boolean {
        this.board.addSteps(counter, stepCount);
        return true;
    }

    addCounterToTeam(counter: Counter, team: Team): boolean {
        const teamData = this.board.teamsData.filter(td => td.team === team);
        const countersData = this.board.coutnersData.filter(cd => cd.counter === counter);
        
        if (countersData.length === 1 && teamData.length ===1) {
            teamData[0].team.addCounter(counter);
            this.board.events.push(new CounterWasAddedToTeamEvent( // adding an event to
                counter.name, teamData[0].team.name
            ));       
            return true;
        }
        else if (countersData.length === 0 || teamData.length === 0) {
            throw new ModelNotFoundError();
        }
        else {
            // this senario should never happpen;
            throw new InternalProblem("There is consistency problem:");
        }
    }

    collectNewEvents(): Event | undefined {
        return this.board.events.pop();
    }

    getTeamsDataFromCounter(counterName: string): TeamData[] {
        const counterData = this.getCounterData(counterName);
        const teamsData: TeamData[] = [];
        if (counterData) {
            counterData.counterTeams.forEach(teamName => {
                const td = this.getTeamData(teamName);
                if (td)
                    teamsData.push(td);
                else
                    throw new InternalProblem("Consistency problem, team data not found");
            });
        } else {
            throw new ModelNotFoundError(); // coutner not exist in board.counters
        }
        return teamsData;
    }

    getAllCounters(): CounterData[] {
        const counters: CounterData[] = [];
        this.board.coutnersData.forEach(cd => {
            counters.push(cd);
        });
        return counters;
    };

    getAllTeamData(): TeamData[] {
        const teams: TeamData[] = []
        this.board.teamsData.forEach(td => {
            teams.push(td);
        });
        return teams;
    };


}

export {TeamBoardInMemoryRepository, ITeamBoardRepository};