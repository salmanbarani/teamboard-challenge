import { Counter, Team, TeamBoard } from "../models";
import { ModelExistError } from "../errors";

it("Counter creation with no steps",async () => {
    const name = "Salman Barani";
    const counter = new Counter(name);

    expect(counter.name).toEqual(name);
    expect(counter.steps).toEqual(0);
});

it("Counter creation with steps",async () => {
    const name = "Salman Barani";
    let steps = 5;
    const counter = new Counter(name, steps);

    counter.steps += 5;
    expect(counter.name).toEqual(name);
    expect(counter.steps).toEqual(10);
});

it("Team creation",async () => {
    const teamName = "Salman Team"
    const counters = [new Counter("A", 5), new Counter("B", 9) ]

    const team = new Team(teamName);
    expect(team.name).toEqual(teamName);

    counters.forEach(c => team.addCounter(c)); // adding counters to team
    expect(team.counters.length).toEqual(counters.length); 
});

it("Each team must have unique counters",async () => {
    const teamName = "Salman Team"
    const counters = [new Counter("A", 5), new Counter("A", 9) ]

    const team = new Team(teamName);
    expect(team.name).toEqual(teamName);
    expect(team.counters.length).toEqual(0);
    
    // adding existing counter raise CounterExistError
    expect(() => {
        counters.forEach(c => { team.addCounter(c)});
    }).toThrow(ModelExistError);

    expect(team.counters.length).toEqual(1);
});


