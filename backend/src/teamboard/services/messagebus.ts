import { ITeamBoardRepository } from "../adapter/repository";
import { Command } from "../domain/commands";
import { InternalProblem } from "../domain/errors";
import { Event } from "../domain/events";

type Message = Command | Event;

export class MessageBus {
    private repo: ITeamBoardRepository;
    private event_handlers: { [key: string]: Function[] };
    private command_handlers: { [key: string]: Function };
    private queue: Message[]; 

  constructor(
    repo: ITeamBoardRepository,
    event_handlers: { [key: string]: Function[] },
    command_handlers: { [key: string]: Function }
  ){
    this.repo = repo;
    this.event_handlers = event_handlers;
    this.command_handlers = command_handlers;
    this.queue = [];
  }

  handle(message: Message): void {
    const handleProcessor = {
        
    }

    this.queue.push(message);
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      if (message instanceof Event) {
        this.handleEvent(message);
      } else if (message instanceof Command) {
        this.handleCommand(message);
      } else {
        throw new InternalProblem(`${message} was not an Event or Command`);
      }
    }
  }

  private handleEvent(event: Event): void {
    const handlers = this.event_handlers[event.constructor.name];
    for (const handler of handlers) {
      try {
        handler(event, this.repo);
        let e = this.repo.collectNewEvents()
        while (e !== undefined){
            this.queue.push(e) // collecting all upcoming events
            e = this.repo.collectNewEvents()
        }
      }catch (error) {
        continue;
      }
    }
  }

    private handleCommand(command: Command): void {
        try {
        const handler = this.command_handlers[command.constructor.name];
        handler(command, this.repo);
        let e = this.repo.collectNewEvents()
        while (e !== undefined){
            this.queue.push(e) // collecting all upcoming events
            e = this.repo.collectNewEvents()
        }
        } catch (error) {
            throw error; // errors must handled by any app that uses this module 
          }
        }
}