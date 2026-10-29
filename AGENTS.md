# Project architecture

- Keep the active application in `src` limited to Veronika Swim; preserve the unregistered SwimDesk experiment in `archived/swimdesk` outside the compilation scope because it depends on a separate schema absent from the active generated database types. Do not reconnect it without validating its schema and types.