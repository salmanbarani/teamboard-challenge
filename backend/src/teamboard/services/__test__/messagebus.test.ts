import { MessageBus } from "../messagebus";
import { CommandHandlers, EventHandlers, deleteCounter } from "../handlers";
import { TeamBoardInMemoryRepository } from "../../adapter/repository";
import { AddCounterToTeamCommand, CreateCounterCommand, CreateTeamCommand, DeleteCounterCommand, InCrementStepsCommand } from "../../domain/commands";

const repo = TeamBoardInMemoryRepository.getInstance();
const bus = new MessageBus(repo,EventHandlers, CommandHandlers);

const counterCMDs = () => {
    return [
        new CreateCounterCommand("aa-counter"), new CreateCounterCommand("bb-counter"),
        new CreateCounterCommand("cc-counter"),new CreateCounterCommand("dd-counter"),
    ]
}

const teamCMDs = () => {
    return [new CreateTeamCommand("team aa"), new CreateTeamCommand("team bb")];
}

it("coutner creation using event-driven messagebus", () => {
    expect(repo.board.coutnersData.length).toEqual(0);
    counterCMDs().forEach(c => bus.handle(c));
    expect(repo.board.coutnersData.length).toEqual(4);

});


it("team creation using event-driven messagebus", () => {
    expect(repo.board.teamsData.length).toEqual(0);
    teamCMDs().forEach(cmd => bus.handle(cmd) ); // 2 teams are added
    expect(repo.board.teamsData.length).toEqual(2);

});

it("adding counters to team using event-driven messagebus", () => {
    expect(repo.board.coutnersData.length).toEqual(4); // from previous tests
    expect(repo.board.teamsData.length).toEqual(2);
    
    counterCMDs().slice(0,2).forEach( cmd => {
        bus.handle(new AddCounterToTeamCommand(cmd.counterName, teamCMDs()[0].teamName))
    }); // adding half of conuters to the first team
    counterCMDs().slice(2).forEach( cmd => {
        bus.handle(new AddCounterToTeamCommand(cmd.counterName, teamCMDs()[1].teamName))
    }); // adding the second half to the second team
    
    // length of both teams counters must be 2
    expect(repo.getTeamData(teamCMDs()[0].teamName)?.team.counters.length).toEqual(2);
    expect(repo.getTeamData(teamCMDs()[1].teamName)?.team.counters.length).toEqual(2);
});

it("event's must be handled when adding a counter to a new team", () => {
    expect(repo.getTeamData(teamCMDs()[0].teamName)?.team.counters.length).toEqual(2);
    expect(repo.getTeamData(teamCMDs()[1].teamName)?.team.counters.length).toEqual(2);

    counterCMDs().slice(0,2).forEach( cmd => {
        expect(repo.getCounterData(cmd.counterName)?.counterTeams).toContain(teamCMDs()[0].teamName)
    }); // check to see if teamName was added to counterData

    counterCMDs().slice(2).forEach( cmd => {
        expect(repo.getCounterData(cmd.counterName)?.counterTeams).toContain(teamCMDs()[1].teamName)
    }); // adding half of conuters to the first team

});


it("increment steps using messagebus", () => {
    const steps = [5,2,9,8] // steps that each counter will takes, order is matter;

    for (let i = 0; i < steps.length; i++) {
        for (let j = 0; j < steps[i]; j++ ) // each counters[i] takes steps[j]
            bus.handle(new InCrementStepsCommand(counterCMDs()[i].counterName));
    }

    for (let i = 0; i < steps.length; i++) {
        expect(repo.getCounterData(counterCMDs()[i].counterName)?.counter.steps).toEqual(steps[i]);
    }

});


it("make sure that team steps are aggregated correctly", () => {
    const steps = [5,2,9,8] // steps that each counter will takes, order is matter;
    const firstTeamTotalSteps = steps[0] + steps[1];
    const secondTeamTotalSteps = steps[2] + steps[3];
    const teamsSteps = []
    expect(repo.board.teamsData.length).toEqual(2);
 
    expect(repo.board.teamsData[0].total_steps).toEqual(firstTeamTotalSteps);
    expect(repo.board.teamsData[1].total_steps).toEqual(secondTeamTotalSteps);
});

it("make sure when a counter is deleted, team steps is deducted.", () => {
    const steps = [5,2,9,8] // steps that each counter will takes, order is matter;

    const secondTeamTotalSteps = steps[2] + steps[3]; // 9 + 8 = 17
    expect(repo.board.teamsData[1].total_steps).toEqual(secondTeamTotalSteps);

    const counterName = counterCMDs()[3].counterName // last counter that has 8 steps  
    const cmd = new DeleteCounterCommand(counterName);

    bus.handle(cmd);
    expect(repo.board.teamsData[1].total_steps).toEqual(
        secondTeamTotalSteps - steps[3] // 8 is removed
        ); 

});

