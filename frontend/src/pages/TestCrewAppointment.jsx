import React, { useState } from 'react';
import CrewAppointment from '../components/CrewAppointment';
import tabletopCaptainDeskPng from '../assets/ui/backgrounds/tabletop_captain_desk.png';

/**
 * TestCrewAppointment Page
 * Dedicated Sandbox Route for visual verification of Task T064
 */
const TestCrewAppointment = () => {
  const [playerCount, setPlayerCount] = useState(10);
  const [captainId] = useState('p1');

  const mockPlayers = [
    { id: 'p1', nickname: 'Jack Sparrow', avatar: 'jack_sparrow', guns: 2, connectionStatus: 'ONLINE' },
    { id: 'p2', nickname: 'Hector Barbossa', avatar: 'barbossa', guns: 3, connectionStatus: 'ONLINE' },
    { id: 'p3', nickname: 'Joshamee Gibbs', avatar: 'gibbs', guns: 1, connectionStatus: 'ONLINE' },
    { id: 'p4', nickname: 'Will Turner', avatar: 'will_turner', guns: 2, connectionStatus: 'ONLINE' },
    { id: 'p5', nickname: 'Elizabeth Swann', avatar: 'elizabeth_swann', guns: 1, connectionStatus: 'ONLINE' },
    { id: 'p6', nickname: 'Tia Dalma', avatar: 'tia_dalma', guns: 2, connectionStatus: 'ONLINE', speechRestricted: true },
    { id: 'p7', nickname: 'Davy Jones', avatar: 'davy_jones', guns: 3, connectionStatus: 'OFFLINE' },
    { id: 'p8', nickname: 'Angelica Teach', avatar: 'angelica', guns: 1, connectionStatus: 'ONLINE' },
    { id: 'p9', nickname: 'Pintel', avatar: 'pintel', guns: 2, status: 'OFF_DUTY', connectionStatus: 'ONLINE' },
    { id: 'p10', nickname: 'Ragetti', avatar: 'ragetti', guns: 1, connectionStatus: 'ONLINE' },
    { id: 'p11', nickname: 'Jack Monkey', avatar: 'jack_monkey', guns: 1, connectionStatus: 'ONLINE' },
  ].slice(0, playerCount + 1);

  const mockRoom = {
    id: 'TEST-ROOM',
    captainId: 'p1',
    offDutyPlayerIds: ['p9'],
    nominatedLieutenantId: 'p3', // Gibbs appointed as LT
    nominatedNavigatorId: 'p4',  // Will Turner appointed as NAV
    players: mockPlayers,
    status: 'IN_GAME',
    gamePhase: 'DAY_1_CREW_SELECTION'
  };

  return (
    <div className="w-screen h-screen bg-[#080504] flex flex-col items-center justify-center p-2 select-none overflow-hidden font-body">
      {/* Control bar */}
      <div className="flex items-center gap-4 mb-2 z-50 bg-black/60 px-4 py-1.5 rounded-full border border-gold/30 text-xs text-parchment">
        <span>Players:</span>
        {[5, 7, 8, 10].map(cnt => (
          <button
            key={cnt}
            onClick={() => setPlayerCount(cnt)}
            className={`px-2.5 py-0.5 rounded font-heading font-black ${
              playerCount === cnt ? 'bg-gold text-black' : 'bg-stone-800 text-parchment hover:bg-stone-700'
            }`}
          >
            {cnt} Candidates ({cnt + 1} Total)
          </button>
        ))}
      </div>

      {/* Desk tabletop frame container */}
      <div className="relative w-[96vw] max-w-[1500px] aspect-[1920/1069] flex items-center justify-center filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)]">
        {/* Tabletop Desk Frame */}
        <img
          src={tabletopCaptainDeskPng}
          alt="Desk"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        />

        {/* Central Stage: Exactly matching In-Desk Brass Opening */}
        <div
          className="absolute z-10 overflow-hidden"
          style={{
            left: '11.82%',
            right: '11.82%',
            top: '18.15%',
            bottom: '16.37%'
          }}
        >
          <CrewAppointment
            room={mockRoom}
            currentUserId="p2" // Barbossa is "ME"
            myRole="PIRATE"
            onAppointTeam={(ltId, navId) => {
              console.log('Appointed:', { ltId, navId });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TestCrewAppointment;
