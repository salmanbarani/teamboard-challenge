import { Counter, Team, TeamBoard } from "../../domain/models";
import { TeamBoardInMemoryRepository } from "../repository";
import { ModelExistError, ModelNotFoundError } from "../../domain/errors";


it("TeamBoard creation",async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance()
    expect(repo.board.teamsData.length).toEqual(0);
    expect(repo.board.coutnersData.length).toEqual(0);
});


it("Several repositories can't be created",async () => {
    const repo1 =  TeamBoardInMemoryRepository.getInstance()
    const repo2 =  TeamBoardInMemoryRepository.getInstance()
    expect(repo1).toEqual(repo2);
    expect(repo1.board).toEqual(repo2.board);
});

it("Store new Team in repo board", async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance()

    const teams = [new Team("team name 1"), new Team("team name 2")];

    teams.forEach(t => repo.addNewTeam(t));
    expect(repo.board.teamsData.length).toEqual(2);
});

it("different teams with the same name can't be added to TeamBoard",async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance()
    const teams = [new Team("steve1"), new Team("steve1")];

    expect(() => {
        teams.forEach(t => repo.addNewTeam(t));
    }).toThrow(ModelExistError);
});


it("remove team",async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance()

    const teams = [new Team("team1"), new Team("team2"), new Team("team3")];

    teams.forEach(t => repo.addNewTeam(t));
    const previousLength = repo.board.teamsData.length;

    repo.deleteTeam(teams[1]);
    expect(repo.board.teamsData.length).toEqual(previousLength - 1);
});

it("add counter to Teamboard",async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance()
    const counters = [new Counter("salman"), new Counter("barani")];
    counters.forEach(c => repo.createNewCounter(c));
    expect(repo.board.coutnersData.length).toEqual(2);
});

it("add counter throw error for counters with the same name",async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance()
    const counters = [new Counter("salman1"), new Counter("salman1")];
    const previousLength = repo.board.coutnersData.length; 
    expect( () => counters.forEach(c => repo.createNewCounter(c))).toThrow(ModelExistError);
    expect(repo.board.coutnersData.length).toEqual(previousLength + 1);
});

it("remove counter",async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance()
    const counters = [new Counter("counter1"), new Counter("counter2"), new Counter("counter3")];
    
    let previousLength = repo.board.coutnersData.length; 
    counters.forEach(c => repo.createNewCounter(c));
    expect(repo.board.coutnersData.length).toEqual(previousLength+3);
    previousLength += 3; // 3 new counter were added
    repo.deleteCounter(counters[1]); // 1 counter was deleted
    expect(repo.board.coutnersData.length).toEqual(previousLength-1);
});

it("add counter to team",async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance()

    const counters = [new Counter("countera"), new Counter("counterb"), new Counter("counterc")];
    counters.forEach(c => repo.createNewCounter(c));
    const teams = [new Team("teama"), new Team("teamb"), new Team("teamc")];
    teams.forEach(t => repo.addNewTeam(t));
    

    const team = teams[1];
    const counter = counters[1];

    repo.addCounterToTeam(counter, team);    
    expect(team.counters.length).toEqual(1);
    expect(
        repo.board.teamsData.filter( td => td.team === team)[0].team.counters.length
    ).toEqual(1);
    expect(team.counters[0]).toEqual(counter);
});

it("add counter to team that not exist",async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance()

    const team = new Team("none-existing-team");
    const counter = repo.board.coutnersData[0].counter;

    expect(() => repo.addCounterToTeam(counter, team)).toThrow(ModelNotFoundError);
});


it("add not existing counter to team",async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance()
    const team = repo.board.teamsData[0].team;
    const counter = new Counter("none-existing-counter");

    expect(() => repo.addCounterToTeam(counter, team)).toThrow(ModelNotFoundError);
});

it("add counter to team that already exist",async () => {
    const repo =  TeamBoardInMemoryRepository.getInstance() 
    
    const team = new Team("new-team");
    repo.addNewTeam(team);
    const counter = new Counter("new-counter");
    repo.createNewCounter(counter);

    repo.addCounterToTeam(counter, team);    
    expect(team.counters.length).toEqual(1);
    
    expect(() => repo.addCounterToTeam(counter, team)).toThrow(ModelExistError);
});


it("add steps to count",async () => {    
    const repo =  TeamBoardInMemoryRepository.getInstance() 
    const team = new Team("team-with-steps");
    repo.addNewTeam(team);
    const counter = new Counter("counter-with-steps");
    repo.createNewCounter(counter);

    repo.addCounterToTeam(counter, team);    
    expect(team.counters.length).toEqual(1);

    for(let i = 0; i < 4; i++)
        repo.incrementCounterSteps(counter); // 4 steps are ddaed
    
    expect(counter.steps).toEqual(4);
});

it("add steps Counter not found",async () => {    
    const repo =  TeamBoardInMemoryRepository.getInstance() 
    const team = repo.board.teamsData[0].team;
    const counter = new Counter("none-existing-counter");
    
    expect(() => repo.incrementCounterSteps(counter)).toThrow(ModelNotFoundError);
    expect(counter.steps).toEqual(0);
});
