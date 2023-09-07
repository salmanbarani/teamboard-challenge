import { MessageBus } from "../../../teamboard/services/messagebus";
import { CommandHandlers, EventHandlers, deleteCounter } from "../../../teamboard/services/handlers";
import { TeamBoardInMemoryRepository } from "../../../teamboard/adapter/repository";
import { AddCounterToTeamCommand, CounterCommand, CreateCounterCommand, CreateTeamCommand, DeleteCounterCommand, InCrementStepsCommand } from "../../../teamboard/domain/commands";
import { InMemoryTeamBoardView } from "../views";

const repo = TeamBoardInMemoryRepository.getInstance();
const bus = new MessageBus(repo,EventHandlers, CommandHandlers);
const views = new InMemoryTeamBoardView();
const STEPS = [5,2,9,8];

const counterCMDs = () => {
    return [
        new CreateCounterCommand("aa-counter"), new CreateCounterCommand("bb-counter"),
        new CreateCounterCommand("cc-counter"),new CreateCounterCommand("dd-counter"),
    ]
}

const teamCMDs = () => {
    return [new CreateTeamCommand("team aa"), new CreateTeamCommand("team bb")];
}

function addCountersToBoard() {
    expect(repo.board.coutnersData.length).toEqual(0);
    counterCMDs().forEach(c => bus.handle(c));
    expect(repo.board.coutnersData.length).toEqual(4);
}

function addCountersToTeams(){
    // this function should be called when counters from counterCMDs are added to teams from teamCMDs;

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
}

function addTeamsToBoard() {
    expect(repo.board.teamsData.length).toEqual(0);
    teamCMDs().forEach(cmd => bus.handle(cmd) ); // 2 teams are added
    expect(repo.board.teamsData.length).toEqual(2);
}

function countersTakingSteps() {
    for (let i = 0; i < STEPS.length; i++) {
        for (let j = 0; j < STEPS[i]; j++ ) // each counters[i] takes steps[j]
            bus.handle(new InCrementStepsCommand(counterCMDs()[i].counterName));
    }

    for (let i = 0; i < STEPS.length; i++) {
        expect(repo.getCounterData(counterCMDs()[i].counterName)?.counter.steps).toEqual(STEPS[i]);
    }

}

function loadData(){
    addCountersToBoard();
    addTeamsToBoard();
    addCountersToTeams();
    countersTakingSteps();
}


loadData();


it("get all counters with appropriate steps", () => {
    const countersFromView = views.getCounters();
    expect(countersFromView.length).toEqual(4); // result must be 4 sincie 4 counters were added

    for(let i = 0; i < counterCMDs().length; i++){
        const counterFromView = countersFromView[i]
        expect(STEPS).toContain(counterFromView.steps); // steps should be equal to the amount they've taken;
    }
});

it("get counter from views", () => {
    const counterName = counterCMDs()[2].counterName;
    const counterFromView = views.getCounter(counterName);
    expect(counterFromView.name).toEqual(counterName);
    expect(counterFromView.steps).toEqual(STEPS[2]);
});

it("get all teams from views", () => {
    const teamsFromView = views.getTeams();
    expect(teamsFromView.length).toEqual(2);

    const firstTeamTotalSteps = STEPS[0] + STEPS[1]; // each element of STEPS represent steps of each counter;
    const secondTeamTotalSteps = STEPS[2] + STEPS[3];

    const allTeamsSteps = [firstTeamTotalSteps, secondTeamTotalSteps];
    teamsFromView.forEach( teamInfo => {
        expect(allTeamsSteps).toContain(teamInfo.totalSteps);
    });
});


it("get team from views", () => {
    const secondTeamName = teamCMDs()[1].teamName;
    const totalStepsOfSecondTeam = STEPS[2] + STEPS[3];
    
    const teamFromView = views.getTeam(secondTeamName);
    expect(teamFromView.name).toEqual(secondTeamName);
    expect(teamFromView.totalSteps).toEqual(totalStepsOfSecondTeam);

});
