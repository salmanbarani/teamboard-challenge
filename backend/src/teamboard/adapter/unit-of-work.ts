// For any persistent storage UnitOfWork class and interface should be created sperately
// Since we're not using any persistent storage it's not necessary to do that. but still
// get benefit of one method to collect Events, this method is implemented in Repository
import { Event } from "../domain/events";

export interface IEventCollector {
    collectNewEvents(): Event | undefined;
}