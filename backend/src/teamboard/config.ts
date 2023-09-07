import { MessageBus } from "./services/messagebus";
import { TeamBoardInMemoryRepository, ITeamBoardRepository } from "./adapter/repository";
import { EventHandlers, CommandHandlers } from "./services/handlers";

export function getMessageBusInstance(): MessageBus{
    return new MessageBus(
        TeamBoardInMemoryRepository.getInstance(),
        EventHandlers,
        CommandHandlers
        );
}