import { TeamBoardInMemoryRepository } from "../../adapter/repository";
import { AddCounterToTeamCommand, CreateCounterCommand, CreateTeamCommand, DeleteCounterCommand, DeleteTeamCommand, InCrementStepsCommand } from "../../domain/commands";
import { addCounterToTeam, createCounter, createTeam, deleteCounter, deleteTeam, incrementCounterSteps } from "../handlers";
const repo = TeamBoardInMemoryRepository.getInstance()

it("Counter creation", () => {
    const cmd = new CreateCounterCommand("Salman"); // command
    createCounter(cmd, repo);
    expect(repo.board.coutnersData.length).toEqual(1);
    expect(repo.board.coutnersData[0].counter.name).toEqual(cmd.counterName);
});

it("Counter deletion", () => {
    createCounter(new CreateCounterCommand("Marvan"), repo);
    createCounter(new CreateCounterCommand("Zobair"), repo);
    expect(repo.board.coutnersData.length).toEqual(3);

    const cmd = new DeleteCounterCommand("Marvan");
    deleteCounter(cmd, repo);
    expect(repo.board.coutnersData.length).toEqual(2);
    repo.board.coutnersData.forEach(cd => {
        expect(cd.counter.name === cmd.counterName).toBeFalsy();
    })
});

it("team creation", () => {
    const cmd = new CreateTeamCommand("Special team"); // command
    createTeam(cmd, repo);
    expect(repo.board.teamsData.length).toEqual(1);
    expect(repo.board.teamsData[0].team.name).toEqual(cmd.teamName);
});

it("team deletion", () => {
    createTeam(new CreateTeamCommand("team a"), repo);
    createTeam(new CreateTeamCommand("team b"), repo);
    expect(repo.board.teamsData.length).toEqual(3);

    const cmd = new DeleteTeamCommand("Marvan");
    deleteTeam(cmd, repo);
    expect(repo.board.coutnersData.length).toEqual(2);
    repo.board.teamsData.forEach(td => {
        expect(td.team.name === cmd.teamName).toBeFalsy();
    })
});

it("add counter to team", () => {
    const counterCMD = new CreateCounterCommand("coutner-to-add-to-team");
    const teamCMD = new CreateTeamCommand("team-that-a-counter-adds-to-it");
    createCounter(counterCMD, repo);
    createTeam(teamCMD, repo);
    
    addCounterToTeam(new AddCounterToTeamCommand(counterCMD.counterName, teamCMD.teamName), repo);
    
    const teamData = repo.getTeamData(teamCMD.teamName) ; 

    expect(teamData?.team.name === teamCMD.teamName ).toBeTruthy()
    expect(teamData?.team.counters.length).toEqual(1);
    expect(teamData?.team.counters[0].name).toEqual(counterCMD.counterName);
});


it("increment steps", () => {
    // Here's a complex one to ensure of the consistency
    const counterCMDs = [
        new CreateCounterCommand("aa-counter"), new CreateCounterCommand("bb-counter"),
        new CreateCounterCommand("cc-counter"),new CreateCounterCommand("dd-counter"),
    ]

    const teamCMDs = [new CreateTeamCommand("team aa"), new CreateTeamCommand("team bb")];

    counterCMDs.forEach( cmd => createCounter(cmd, repo)); // 4 couner is created
    teamCMDs.forEach(cmd => createTeam(cmd, repo) ); // 2 teams are added
    
    counterCMDs.slice(0,2).forEach( cmd => {
        addCounterToTeam(new AddCounterToTeamCommand(cmd.counterName, teamCMDs[0].teamName), repo)
    }); // adding half of conuters to the first team
    counterCMDs.slice(2).forEach( cmd => {
        addCounterToTeam(new AddCounterToTeamCommand(cmd.counterName, teamCMDs[1].teamName), repo)
    }); // adding the second half to the second team
    
    // length of both teams counters must be 2
    expect(repo.getTeamData(teamCMDs[0].teamName)?.team.counters.length).toEqual(2);
    expect(repo.getTeamData(teamCMDs[1].teamName)?.team.counters.length).toEqual(2);

    const steps = [5,2,9,8] // steps that each counter will takes, order is matter;

    for (let i = 0; i < steps.length; i++) {
        for (let j = 0; j < steps[i]; j++ ) // each counters[i] takes steps[j]
            incrementCounterSteps(new InCrementStepsCommand(counterCMDs[i].counterName), repo);
    }

    for (let i = 0; i < steps.length; i++) {
        expect(repo.getCounterData(counterCMDs[i].counterName)?.counter.steps).toEqual(steps[i]);
    }

});