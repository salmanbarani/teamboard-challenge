abstract class Command {
}


abstract class TeamCommand extends Command{
    teamName: string;
    constructor(teamName: string) {
      super();
      this.teamName = teamName;  
    }
}

abstract class CounterCommand extends Command{
    counterName: string;
    constructor(counterName: string) {
        super();
        this.counterName = counterName;
    }
}


class CreateCounterCommand extends CounterCommand {
    // has access to counterName
}

class DeleteCounterCommand extends CounterCommand {
    // has access to counterName
}

class CreateTeamCommand extends TeamCommand {
    // has access to teamName
}

class DeleteTeamCommand extends TeamCommand {
    // has access to teamName
}

class InCrementStepsCommand extends CounterCommand {
    // access to name
}

class AddCounterToTeamCommand  extends Command{
    // multi-inhiretence is not suported by Typescript
    counterName : string;
    teamName : string;

    constructor(counterName: string, teamName: string) {
        super();
        this.counterName = counterName;
        this.teamName = teamName;
    }
}

export {CreateCounterCommand, DeleteCounterCommand, CreateTeamCommand, DeleteTeamCommand, 
    CounterCommand, InCrementStepsCommand, TeamCommand, AddCounterToTeamCommand, Command};