<!--
Sync Impact Report:
- Version change: [NEW] → 1.0.0
- Added sections: Core Principles, Technical Constraints, Governance
- Removed sections: N/A
- Templates requiring updates: 
  - ✅ .specify/templates/plan-template.md (already generic)
  - ✅ .specify/templates/spec-template.md (already generic)
  - ✅ .specify/templates/tasks-template.md (already generic)
- Follow-up TODOs: None
-->
# Feed the Kraken Web App Constitution

## Core Principles

### I. Pragmatic & Lightweight Code Quality
Code MUST be clean, readable, and highly modular. We MUST avoid over-engineering and complex enterprise architectures (such as microservices) that are unnecessary for a personal project. Simplicity and pragmatism are prioritized over abstract design patterns.

### II. Uncompromising Game Logic (Source of Truth)
The application MUST strictly adhere to the rules, hidden roles mechanics, and lore of "Feed the Kraken". The core game logic MUST serve as the absolute "source of truth" and MUST be completely separated and decoupled from the User Interface (UI).

### III. Focused Testing Standards (Unit Tests First)
Unit Tests are MANDATORY for all core game logic components (faction assignment, character skills, voting outcomes, ship navigation). This ensures rule accuracy and protects the game experience from breaking bugs. Cumbersome End-to-End (E2E) testing processes SHOULD be omitted in favor of agility.

### IV. Player-Centric User Experience (UX)
The interface MUST be consistent and mobile-friendly, ensuring a smooth experience for groups of friends playing together. Interactions (closing eyes, voting, checking the map) MUST be intuitive. The current game state MUST always be clearly conveyed to the player.

### V. Real-Time Performance & Sync
The application MUST be optimized for real-time multiplayer gameplay. State synchronization between clients MUST be smooth and immediate, primarily utilizing WebSockets as the transport layer.

### VI. Graceful Resilience & Reconnection
The system MUST include robust handling for network disconnects. Players MUST be able to reconnect to their exact room and prior state seamlessly, without disrupting the ongoing game session for other players.

## Technical Constraints

Technology choices MUST align with the pragmatic and real-time nature of the principles. The frontend and backend architectures SHOULD support seamless WebSocket integration and strictly enforce the separation of game logic from presentation. 

## Governance

This Constitution supersedes all other project documentation and practices. Any architectural or design decisions MUST be validated against these principles. 
- Amendments to these principles require an increment to the constitution version.
- All Pull Requests and feature implementations MUST verify compliance with the "Uncompromising Game Logic" and "Focused Testing Standards" principles.

**Version**: 1.0.0 | **Ratified**: 2026-08-11 | **Last Amended**: 2026-08-11
