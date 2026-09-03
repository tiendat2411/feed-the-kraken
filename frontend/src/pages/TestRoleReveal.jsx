import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameHeader from '../components/GameHeader';
import RoleReveal from '../components/RoleReveal';
import ButtonWood from '../components/ui/ButtonWood';

const FACTION_MAP = {
  sailor: 'SAILOR',
  pirate: 'PIRATE',
  'cult-leader': 'CULT_LEADER',
  cult_leader: 'CULT_LEADER',
  cultist: 'CULTIST',
};

/**
 * TestRoleReveal Page
 * Dedicated Sandbox Route for testing RoleReveal UI without creating rooms:
 * - /test/role-reveal
 * - /test/role-reveal/sailor
 * - /test/role-reveal/pirate
 * - /test/role-reveal/cult-leader
 * - /test/role-reveal/cultist
 */
const TestRoleReveal = () => {
  const { factionParam } = useParams();
  const navigate = useNavigate();

  const selectedRole = factionParam ? FACTION_MAP[factionParam.toLowerCase()] || 'SAILOR' : 'SAILOR';
  const [timerKey, setTimerKey] = useState(Date.now());
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    // Re-initialize mock room state whenever role or timer reset changes
    setRoomData({
      id: 'TEST-DEV',
      status: 'IN_GAME',
      gamePhase: selectedRole === 'PIRATE' ? 'PIRATES_GATHERING' : 'ROLE_REVEAL',
      mapType: 'LONG_JOURNEY',
      phaseDeadline: Date.now() + 20000,
      knownPirates: [
        { id: 'dev-user-01', nickname: 'Jack Sparrow', avatar: 'jack_sparrow' },
        { id: 'dev-user-02', nickname: 'Barbossa', avatar: 'barbossa' },
        { id: 'dev-user-03', nickname: 'Angelica', avatar: 'angelica' },
      ],
      knownCultLeader: {
        id: 'cult-leader-01',
        nickname: 'Davy Jones',
        avatar: '🐙',
      },
    });
  }, [selectedRole, timerKey]);

  const handleSwitchFaction = (param) => {
    navigate(`/test/role-reveal/${param}`);
  };

  const handleResetTimer = () => {
    setTimerKey(Date.now());
  };

  if (!roomData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A08] relative">
      {/* ── Developer Fast-Testing Quick Bar ── */}
      <div className="bg-hull-dark/95 border-b border-gold/40 px-4 py-2 z-50 flex flex-wrap items-center justify-between gap-2 shadow-wood">
        <div className="flex items-center gap-2">
          <span className="font-display text-gold tracking-widest text-xs uppercase">
            🛠️ TEST SANDBOX:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleSwitchFaction('sailor')}
              className={`px-3 py-1 text-xs font-display tracking-wider rounded border transition-all ${
                selectedRole === 'SAILOR'
                  ? 'bg-sailor/40 border-sailor-glow text-white shadow-[0_0_10px_rgba(74,122,140,0.6)]'
                  : 'bg-black/50 border-gold/30 text-parchment-dim hover:text-white'
              }`}
            >
              SAILOR
            </button>
            <button
              onClick={() => handleSwitchFaction('pirate')}
              className={`px-3 py-1 text-xs font-display tracking-wider rounded border transition-all ${
                selectedRole === 'PIRATE'
                  ? 'bg-pirate/40 border-pirate-glow text-white shadow-[0_0_10px_rgba(168,59,42,0.6)]'
                  : 'bg-black/50 border-gold/30 text-parchment-dim hover:text-white'
              }`}
            >
              PIRATE
            </button>
            <button
              onClick={() => handleSwitchFaction('cult-leader')}
              className={`px-3 py-1 text-xs font-display tracking-wider rounded border transition-all ${
                selectedRole === 'CULT_LEADER'
                  ? 'bg-amber-900/50 border-gold text-gold shadow-[0_0_10px_rgba(201,168,76,0.6)]'
                  : 'bg-black/50 border-gold/30 text-parchment-dim hover:text-white'
              }`}
            >
              CULT LEADER
            </button>
            <button
              onClick={() => handleSwitchFaction('cultist')}
              className={`px-3 py-1 text-xs font-display tracking-wider rounded border transition-all ${
                selectedRole === 'CULTIST'
                  ? 'bg-cult/40 border-cult-glow text-white shadow-[0_0_10px_rgba(107,63,160,0.6)]'
                  : 'bg-black/50 border-gold/30 text-parchment-dim hover:text-white'
              }`}
            >
              CULTIST
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ButtonWood
            onClick={handleResetTimer}
            className="!h-[32px] !min-w-[110px] !px-2.5 !text-xs"
          >
            ⏱️ RESTART 20s
          </ButtonWood>
          <button
            onClick={() => navigate('/')}
            className="text-xs font-display text-parchment-dim hover:text-gold transition px-2 py-1"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* ── Main Stage Role Reveal (No GameHeader in Role Reveal phase) ── */}

      {/* ── Main Stage Role Reveal ── */}
      <div key={timerKey} className="flex-1">
        <RoleReveal
          room={roomData}
          myRole={selectedRole}
          currentUserId="dev-user-01"
        />
      </div>
    </div>
  );
};

export default TestRoleReveal;
