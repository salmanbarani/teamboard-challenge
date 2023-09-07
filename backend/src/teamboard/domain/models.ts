import { InternalProblem, ModelExistError, ModelNotFoundError } from "./errors";
import { Event, StepWasAddedEvent } from "./events";

class Counter {
    name: string;
    steps: number;
  
    constructor(name: string, steps: number = 0) {
      this.name = name;
      this.steps = steps;
    }
}
  
  class Team {
    name: string;
    counters: Counter[];
  
    constructor(name: string) {
      this.name = name;
      this.counters = [];
    }


    private counterExist(counter: Counter): boolean {
      let similarCounters = []
      similarCounters = this.counters.filter(team_counter => {
        if (team_counter.name === counter.name){
          return true;
        }
      });
      return similarCounters.length > 0 ;
    }

    addCounter(counter: Counter): any {
      const counterCanBeAdded = !this.counterExist(counter);
      if (counterCanBeAdded)
          this.counters.push(counter);
      else
         throw new ModelExistError(counter);
    }
  }

  interface TeamData {
    team: Team;
    total_steps: number;
  }

  interface CounterData {
    counter: Counter;
    counterTeams: string []; // contains list of teamNames for faster retrieval
  }
  

  class TeamBoard {
    teamsData: TeamData[];
    coutnersData: CounterData[];
    events: Event[];

    constructor(teamData: TeamData[] = [], counter: CounterData[] = []){
      this.teamsData = teamData;
      this.coutnersData = counter;
      this.events = [];
    }

    addSteps(counter: Counter, stepCount: number) {
      const countersData = this.coutnersData.filter(cd => cd.counter === counter);
      if (countersData.length === 1) {
          countersData[0].counter.steps += stepCount;
          this.events.push(new StepWasAddedEvent(counter.name, stepCount))
          return true;
      }
      else if (countersData.length === 0) {
          throw new ModelNotFoundError();
      }
      else {
          // this senario should never happpen;
          throw new InternalProblem("There is consistency problem:")
      }
    }
}
  
export {Counter, Team, TeamBoard, TeamData, CounterData}