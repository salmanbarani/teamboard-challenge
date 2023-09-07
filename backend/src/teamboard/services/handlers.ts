import {TeamCommand, CounterCommand, AddCounterToTeamCommand, CreateCounterCommand, DeleteCounterCommand,
    CreateTeamCommand, DeleteTeamCommand, InCrementStepsCommand
} from "../domain/commands";
import { ITeamBoardRepository } from "../adapter/repository";
import { Counter, Team} from "../domain/models";
import { CounterWasAddedToTeamEvent, CounterWasDeleted, StepWasAddedEvent } from "../domain/events";
import { InternalProblem, ModelNotFoundError } from "../domain/errors";


export function createCounter(cmd: CounterCommand, repository:ITeamBoardRepository) {
    const newCounter = new Counter(cmd.counterName);
    repository.createNewCounter(newCounter);
}

export function deleteCounter(cmd: CounterCommand, repository:ITeamBoardRepository) {
    const foundCounterData = repository.getCounterData(cmd.counterName);
    if (foundCounterData !== null) {
        repository.deleteCounter(foundCounterData.counter);
    } else {
        // nothing is done;
    }
}

export function createTeam(cmd: TeamCommand, repository:ITeamBoardRepository) {
    const newTeam = new Team(cmd.teamName);
    repository.addNewTeam(newTeam);
}


export function deleteTeam(cmd: TeamCommand, repository:ITeamBoardRepository) {
    const foundTeamData = repository.getTeamData(cmd.teamName);
    if (foundTeamData !== null) {
        repository.deleteTeam(foundTeamData.team);
    } else {
        // nothing is done
    }
}

export function addCounterToTeam(cmd: AddCounterToTeamCommand, repository:ITeamBoardRepository) {
    const foundCounter = repository.getCounterData(cmd.counterName);
    const foundTeamData = repository.getTeamData(cmd.teamName);
    if (foundCounter  && foundTeamData) {
        repository.addCounterToTeam(foundCounter.counter, foundTeamData.team); 
    } else { // also from repository an error might be thrown
        throw new ModelNotFoundError();
    }
}

export function incrementCounterSteps(cmd: CounterCommand, repository:ITeamBoardRepository) {
    const foundCounterData = repository.getCounterData(cmd.counterName);
    if (foundCounterData !== null) {
        repository.incrementCounterSteps(foundCounterData.counter, 1);
    } else {
        throw new ModelNotFoundError();
    }
}

export function addTeamNameToCounterData(event: CounterWasAddedToTeamEvent, repo: ITeamBoardRepository) {
    const counterData = repo.getCounterData(event.counterName);
    if (counterData) {
        counterData.counterTeams.push(event.teamName)
    } else {
        throw new InternalProblem("counterData not found: Even't wasn't handled")
    }
}

export function incrementTeamSteps(event: StepWasAddedEvent, repo: ITeamBoardRepository) {
    const counterData = repo.getCounterData(event.counterName);
    if (counterData) {
        const teamsData = repo.getTeamsDataFromCounter(event.counterName) // O=N
        if (teamsData){
            teamsData.forEach( td=> { // we expect each Counter might join several teams, so all teams updata that;
                td.total_steps += event.stepCount;
            });

        } else {
            throw new InternalProblem("Consistency problem, teamData was not found");
        }

    } else {
        throw new InternalProblem("counterData not found: Even't wasn't handled");
    }
}

export function reduceTeamTotalSteps(event: CounterWasDeleted, repo: ITeamBoardRepository) {
    const teamsData = repo.getTeamData(event.teamName);
    if (teamsData) { // only triggers when counter has already joined a team
        teamsData.total_steps -= event.totalSteps
    }
}


export const EventHandlers = {
    CounterWasAddedToTeamEvent: [addTeamNameToCounterData],
    StepWasAddedEvent: [incrementTeamSteps],
    CounterWasDeleted: [reduceTeamTotalSteps]
}

export const CommandHandlers = {
    CreateCounterCommand: createCounter,
    DeleteCounterCommand: deleteCounter,
    CreateTeamCommand: createTeam,
    DeleteTeamCommand: deleteTeam,
    AddCounterToTeamCommand: addCounterToTeam,
    InCrementStepsCommand: incrementCounterSteps
}
