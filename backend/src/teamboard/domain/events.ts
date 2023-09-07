abstract class Event {
}

class StepWasAddedEvent extends Event {
    counterName: string;
    stepCount: number;

    constructor(counterName: string, stepCounter: number) {
        super();
        this.counterName = counterName;
        this.stepCount = stepCounter;
    }

}

class CounterWasAddedToTeamEvent extends Event {
    counterName: string;
    teamName: string;
    constructor(counterName: string, teamName: string) {
        super();
        this.counterName = counterName;
        this.teamName = teamName;
    }

}

export class CounterWasDeleted extends Event {
    counterName: string;
    teamName: string;
    totalSteps: number;
    constructor(counterName: string, teamName: string, totalSteps: number) {
        super();
        this.counterName = counterName;
        this.totalSteps = totalSteps;
        this.teamName = teamName
    }

}


export {Event, StepWasAddedEvent, CounterWasAddedToTeamEvent}