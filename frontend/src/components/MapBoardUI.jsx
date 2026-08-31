import React, { useState, useEffect, useMemo, useRef } from 'react';
import quickJourneyConfig from '../config/maps/quick-journey.json';
import longJourneyConfig from '../config/maps/long-journey.json';
import { SoundEngine } from '../utils/soundEffects';

/**
 * MapBoardUI Component (BR-004)
 * Trực quan hóa bản đồ lục giác SVG, hoạt ảnh con tàu,
 * hành động ô bản đồ (Map Actions), hiệu ứng thẻ bài (Card Effects)
 * và Nghi thức Tà giáo (Cult Uprising).
 */
const MapBoardUI = ({
  room,
  currentUserId,
  myRole,
  onExecuteMapAction,
  onConfirmMapAction,
  onDesignateCardTarget,
  onResolveTelescope,
  onAcknowledgeMermaid,
  onStartCultUprising,
  onConfirmCultNight,
  onResolveCultGuns,
  onResolveCultCabinSearch,
  onResolveCultConversion,
  onAdvanceNextRound
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [gunsAllocation, setGunsAllocation] = useState({});
  const [privateNotification, setPrivateNotification] = useState(null);
  const [isModalMinimized, setIsModalMinimized] = useState(false);
  const lastShipPosRef = useRef(null);
  const lastPhaseRef = useRef(room?.gamePhase);

  // Auto-restore modal when game phase changes
  useEffect(() => {
    if (room?.gamePhase !== lastPhaseRef.current) {
      setIsModalMinimized(false);
      lastPhaseRef.current = room?.gamePhase;
    }
  }, [room?.gamePhase]);

  const players = room?.players || [];
  const me = players.find(p => p.id === currentUserId || p.sessionToken === currentUserId);
  const isCaptain = me?.id === room?.captainId;
  const isCultLeader = myRole === 'CULT_LEADER' || me?.factionRole === 'CULT_LEADER';

  const mapConfig = room?.mapType === 'LONG_JOURNEY' ? longJourneyConfig : quickJourneyConfig;
  const shipPositionId = room?.mapBoard?.shipPosition || 'START';
  const visitedNodes = room?.mapBoard?.visitedNodes || ['START'];
  const gamePhase = room?.gamePhase || 'EXECUTE_ACTIONS';

  // Sound effect when ship sails to a new position
  useEffect(() => {
    if (shipPositionId && lastShipPosRef.current && lastShipPosRef.current !== shipPositionId) {
      SoundEngine.playBell();
    }
    lastShipPosRef.current = shipPositionId;
  }, [shipPositionId]);

  // Sound effect on Cult Ritual or Feed the Kraken
  useEffect(() => {
    if (room?.pendingCultRitual || room?.pendingMapAction?.actionType === 'FEED_THE_KRAKEN') {
      SoundEngine.playKrakenRoar();
    }
  }, [room?.pendingCultRitual, room?.pendingMapAction?.actionType]);

  // Khởi tạo phân bổ súng mặc định khi vào phase Guns Stash
  useEffect(() => {
    if (room?.pendingCultRitual?.type === 'GUNS_STASH' && isCultLeader) {
      const initial = {};
      players.forEach(p => {
        if (p.status !== 'ELIMINATED') initial[p.id] = 0;
      });
      if (me) initial[me.id] = 3;
      setGunsAllocation(initial);
    }
  }, [room?.pendingCultRitual?.type, isCultLeader]);

  // Pointy-topped hexagon path generator (R = 38)
  const getHexPolygonPoints = (cx, cy, r = 38) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      // Pointy-topped: angle starts at 30 deg (Math.PI / 6)
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  // Convert map coordinates (percentages) to SVG space (1000x850)
  const getNodeSvgCoord = (node) => {
    const svgX = (node.x / 100) * 880 + 60;
    const svgY = (node.y / 100) * 720 + 60;
    return { x: svgX, y: svgY };
  };

  // Node Map lookup
  const nodeMap = useMemo(() => {
    const map = new Map();
    mapConfig.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [mapConfig]);

  const currentNode = nodeMap.get(shipPositionId) || nodeMap.get('START');

  // Total allocated guns check
  const totalAllocatedGuns = Object.values(gunsAllocation).reduce((sum, val) => sum + (Number(val) || 0), 0);

  // Eligible targets for Captain Map Action & Card Target
  const eligibleCrew = players.filter(p => p.id !== me?.id && p.status !== 'ELIMINATED');

  // Eligible targets for Cult Conversion (isConvertible == true, status == ACTIVE, not Cult Leader)
  const convertibleCrew = players.filter(p => p.id !== me?.id && p.status === 'ACTIVE' && p.isConvertible !== false);

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'CABIN_SEARCH': return '🔍';
      case 'FLOGGING': return '🩸';
      case 'OFF_WITH_THE_TONGUE': return '🔒';
      case 'FEED_THE_KRAKEN': return '🐙';
      default: return '⚓';
    }
  };

  const getActionName = (actionType) => {
    switch (actionType) {
      case 'CABIN_SEARCH': return 'Cabin Search';
      case 'FLOGGING': return 'Interrogation (Flogging)';
      case 'OFF_WITH_THE_TONGUE': return 'Silence (Cut Tongue)';
      case 'FEED_THE_KRAKEN': return 'Feed to Kraken';
      default: return 'Calm Waters';
    }
  };

  const getWaypointDisplayName = (node) => {
    if (!node) return 'Open Seas';
    const nameMap = {
      'START': 'Crab Island Bay (Departure)',
      'Vịnh Crab Island (Xuất Phát)': 'Crab Island Bay (Departure)',
      'Tử Địa Kraken (Kraken\'s Nest)': 'Kraken\'s Nest',
      'Vịnh Hải Tặc (Crimson Cove)': 'Crimson Cove',
      'Vịnh Hoàng Gia (Bluewater Bay)': 'Bluewater Bay',
      'Vùng Biển Tây Nam': 'Southwest Waters',
      'Vùng Biển Phía Đông': 'Eastern Waters',
      'Vùng Biển Phía Tây': 'Western Waters',
      'Vùng Biển Đông Nam': 'Southeast Waters',
      'Vùng Biển Trung Tâm': 'Central Basin',
      'Hải Trình Tây Nam': 'Southwest Passage',
      'Hải Trình Đông Nam': 'Southeast Passage',
      'Hải Trình Phía Đông': 'Eastern Passage',
      'Hải Trình Phía Tây': 'Western Passage',
      'Hải Trình Trung Tâm': 'Central Passage',
      'Vực Thẳm Siren': 'Siren\'s Trench',
      'Eo Biển Xương Xổi': 'Bone Strait',
      'Bãi Đá Ngầm Máu': 'Blood Reef',
      'Vùng Biển Lặng': 'Calm Shallows',
      'Hải Vực Sương Mù': 'Mist Veil Waters'
    };
    return nameMap[node.name] || nameMap[node.id] || node.name || `Waypoint ${node.id}`;
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] bg-slate-950 text-white flex flex-col items-center justify-between p-4 overflow-hidden select-none">
      {/* Background Ocean & Compass Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top HUD Bar with Persistent Deck & Waypoint Info */}
      <div className="relative z-10 w-full max-w-6xl flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 shadow-2xl">
        {/* Left: Waypoint Position */}
        <div className="flex items-center space-x-3">
          <span className="text-3xl animate-bounce">⛵</span>
          <div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-slate-400">Current Waypoint</div>
            <div className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
              {getWaypointDisplayName(currentNode)}
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Node: {currentNode?.id}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Navigation Decks & Journey Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-heading">
          {/* Deck Count */}
          <div className="flex items-center gap-1.5 bg-cyan-950/70 border border-cyan-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-cyan-200 shadow-sm" title="Navigation Draw Pile">
            <span className="text-cyan-400 font-normal">Deck:</span>
            <span className="font-black text-cyan-300">{room?.navigationDeck?.drawPileCount ?? (room?.mapType === 'LONG_JOURNEY' ? 23 : 19)}</span>
            <span>🎴</span>
          </div>

          {/* Discard Count */}
          <div className="flex items-center gap-1.5 bg-rose-950/70 border border-rose-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-rose-200 shadow-sm" title="Navigation Discard Pile">
            <span className="text-rose-400 font-normal">Discard:</span>
            <span className="font-black text-rose-300">{room?.navigationDeck?.discardPileCount ?? 0}</span>
            <span>🗑️</span>
          </div>

          {/* Logbook Count */}
          <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-amber-200 shadow-sm" title="Captain's Logbook">
            <span className="text-amber-400 font-normal">Logbook:</span>
            <span className="font-black text-amber-300">{room?.navigationDeck?.logbookCount ?? 0}/2</span>
            <span>📖</span>
          </div>

          {/* Cult Ritual Deck Count */}
          <div className="flex items-center gap-1.5 bg-purple-950/70 border border-purple-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-purple-200 shadow-sm" title="Cult Ritual Deck">
            <span>🔮</span>
            <span className="text-purple-300 font-normal">Rituals:</span>
            <span className="font-black text-purple-200">{room?.mapBoard?.cultRitualDeck?.length ?? 5}</span>
          </div>

          {/* Journey Mode */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-2.5 sm:px-3 py-1.5 rounded-xl text-slate-300" title="Journey Type">
            <span className="text-blue-400">🗺️</span>
            <span className="font-bold">{room?.mapType === 'LONG_JOURNEY' ? 'Long Journey' : 'Quick Journey'}</span>
          </div>

          {/* Supply Line Status (if Long Journey) */}
          {room?.mapType === 'LONG_JOURNEY' && (
            <div
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border ${
                room?.mapBoard?.hasCrossedSupplyLine
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
              title="Supply Line Status"
            >
              <span>📦</span>
              <span>Supply Line: {room?.mapBoard?.hasCrossedSupplyLine ? 'Crossed' : 'Not Crossed'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main SVG Hexagonal Map Container */}
      <div className="relative z-10 w-full max-w-6xl flex-1 flex items-center justify-center my-2">
        <div className="w-full h-full max-h-[640px] aspect-[10/8] relative rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm shadow-2xl p-2">
          <svg viewBox="0 0 1000 850" className="w-full h-full">
            <defs>
              {/* Gradients */}
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#020617" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
              <linearGradient id="pirateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
              <linearGradient id="sailorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </linearGradient>
              <linearGradient id="cultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7e22ce" />
                <stop offset="100%" stopColor="#3b0764" />
              </linearGradient>

              {/* Marker Arrows */}
              <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" opacity="0.8" />
              </marker>
              <marker id="arrow-yellow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#eab308" opacity="0.8" />
              </marker>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" opacity="0.8" />
              </marker>

              {/* Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ocean Surface */}
            <rect width="1000" height="850" fill="url(#oceanGrad)" rx="24" />

            {/* Draw Curved Supply Line Boundary if Long Journey */}
            {room?.mapType === 'LONG_JOURNEY' && (
              <g className="opacity-80">
                <path d="M 80 470 Q 500 310 920 470" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="8 8" />
                <text x="500" y="340" fill="#f59e0b" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="3">
                  ⚔️ SUPPLY LINE BOUNDARY ⚔️
                </text>
              </g>
            )}

            {/* 1. Draw Path Connections (Edges with Colors) */}
            {mapConfig.nodes.map(node => {
              const fromCoord = getNodeSvgCoord(node);
              const transitions = node.transitions || {};

              return Object.entries(transitions).map(([color, targetId]) => {
                const targetNode = nodeMap.get(targetId);
                if (!targetNode) return null;

                const toCoord = getNodeSvgCoord(targetNode);
                let strokeColor = '#64748b';
                let markerId = '';

                if (color === 'RED') {
                  strokeColor = '#ef4444';
                  markerId = 'url(#arrow-red)';
                } else if (color === 'YELLOW') {
                  strokeColor = '#eab308';
                  markerId = 'url(#arrow-yellow)';
                } else if (color === 'BLUE') {
                  strokeColor = '#38bdf8';
                  markerId = 'url(#arrow-blue)';
                }

                // Kiểm tra xem đoạn đường này có nằm trong lịch sử di chuyển không
                const isTraversed = visitedNodes.includes(node.id) && visitedNodes.includes(targetId);

                return (
                  <line
                    key={`${node.id}-${color}-${targetId}`}
                    x1={fromCoord.x}
                    y1={fromCoord.y}
                    x2={toCoord.x}
                    y2={toCoord.y}
                    stroke={strokeColor}
                    strokeWidth={isTraversed ? 3.5 : 1.8}
                    strokeOpacity={isTraversed ? 0.9 : 0.35}
                    strokeDasharray={isTraversed ? 'none' : '4 4'}
                    markerEnd={markerId}
                  />
                );
              });
            })}

            {/* 2. Draw Hexagon Nodes */}
            {mapConfig.nodes.map(node => {
              const coord = getNodeSvgCoord(node);
              const isCurrent = node.id === shipPositionId;
              const isVisited = visitedNodes.includes(node.id);
              const isVictory = Boolean(node.victoryZone);

              let fillColor = '#1e293b';
              let strokeColor = '#475569';
              let strokeWidth = 1.5;

              if (node.victoryZone === 'PIRATE_VICTORY') {
                fillColor = 'url(#pirateGrad)';
                strokeColor = '#f87171';
                strokeWidth = 3;
              } else if (node.victoryZone === 'SAILOR_VICTORY') {
                fillColor = 'url(#sailorGrad)';
                strokeColor = '#38bdf8';
                strokeWidth = 3;
              } else if (node.victoryZone === 'CULT_VICTORY') {
                fillColor = 'url(#cultGrad)';
                strokeColor = '#c084fc';
                strokeWidth = 3;
              } else if (isVisited) {
                fillColor = '#334155';
                strokeColor = '#fbbf24';
                strokeWidth = 2.5;
              }

              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-transform duration-300 hover:scale-105"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Hexagon Shape */}
                  <polygon
                    points={getHexPolygonPoints(coord.x, coord.y, isVictory ? 50 : 38)}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    filter={isCurrent ? 'url(#glow)' : 'none'}
                  />

                  {/* Node Icon / Action Symbol */}
                  <text
                    x={coord.x}
                    y={coord.y - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isVictory ? '24' : '18'}
                    className="select-none pointer-events-none"
                  >
                    {node.victoryZone === 'PIRATE_VICTORY' ? '🏴‍☠️' :
                     node.victoryZone === 'SAILOR_VICTORY' ? '⚓' :
                     node.victoryZone === 'CULT_VICTORY' ? '🦑' :
                     node.id === 'START' ? '🦀' :
                     getActionIcon(node.mapAction)}
                  </text>

                  {/* Node Short Label */}
                  <text
                    x={coord.x}
                    y={coord.y + 18}
                    textAnchor="middle"
                    fontSize={isVictory ? '11' : '9'}
                    fontWeight="bold"
                    fill={isVictory ? '#fef08a' : '#cbd5e1'}
                    className="select-none pointer-events-none uppercase tracking-wider"
                  >
                    {node.id}
                  </text>

                  {/* Animated Ship Marker on Current Node */}
                  {isCurrent && (
                    <g className="animate-bounce" filter="url(#glow)">
                      <circle cx={coord.x} cy={coord.y - 36} r="18" fill="#fbbf24" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2" />
                      <text x={coord.x} y={coord.y - 34} textAnchor="middle" dominantBaseline="middle" fontSize="20">
                        ⛵
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Node Info Tooltip */}
          {hoveredNode && (
            <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-900/90 border border-slate-700 backdrop-blur-md shadow-2xl text-xs max-w-xs pointer-events-none animate-fadeIn">
              <div className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                <span>{getActionIcon(hoveredNode.mapAction)}</span>
                {hoveredNode.name}
              </div>
              <div className="text-slate-300 mt-1">
                Action: <span className="font-semibold text-white">{getActionName(hoveredNode.mapAction)}</span>
              </div>
              {hoveredNode.victoryZone && (
                <div className="text-emerald-400 font-bold mt-1">
                  🏆 Victory Zone: {hoveredNode.victoryZone}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING RESTORE BUTTON WHEN ANY EVENT MODAL IS MINIMIZED */}
      {/* ========================================================================= */}
      {isModalMinimized && (
        <div className="fixed top-28 sm:top-32 md:top-34 right-4 sm:right-8 z-40 animate-bounce">
          <button
            type="button"
            onClick={() => setIsModalMinimized(false)}
            className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-[#140F0A]/95 border-2 border-gold text-gold font-display text-sm tracking-wider shadow-[0_8px_25px_rgba(0,0,0,0.9),0_0_20px_rgba(201,168,76,0.8)] cursor-pointer hover:scale-105 active:scale-95 transition"
            title="Click to restore event modal"
          >
            <span className="text-xl">📜</span>
            <span className="font-heading font-black text-xs uppercase tracking-wide">
              [+] VIEW EVENT DETAILS
            </span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EXECUTE MAP ACTION (UC-013) */}
      {/* ========================================================================= */}
      {gamePhase === 'EXECUTE_MAP_ACTION' && !isModalMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-[#140F0A] border-2 border-gold shadow-[0_0_50px_rgba(201,168,76,0.3)] flex flex-col space-y-4 text-parchment-bright select-none">
            {/* Modal Header with Minimize Button */}
            <div className="flex items-center justify-between border-b border-gold/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{getActionIcon(room?.pendingMapAction?.type)}</span>
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-black text-gold tracking-wide">
                    MAP ACTION: {getActionName(room?.pendingMapAction?.type)}
                  </h2>
                  <p className="text-[11px] font-heading text-parchment-dim">Waypoint: {currentNode?.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalMinimized(true)}
                className="font-heading font-bold text-xs px-2.5 py-1 rounded bg-black/50 hover:bg-gold/20 text-gold border border-gold/40 transition cursor-pointer"
                title="Minimize to inspect Sea Chart"
              >
                ─ MINIMIZE
              </button>
            </div>

            {/* Captain's Target Selection & Result Interface */}
            {isCaptain ? (
              <div className="space-y-4">
                {!room?.lastMapActionResult ? (
                  <>
                    <p className="font-heading text-sm text-gold-bright text-center">
                      Captain, select a crew member to carry out this action:
                    </p>

                    <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                      {eligibleCrew.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedTargetId(p.id)}
                          className={`p-3 rounded-2xl border flex items-center space-x-3 transition-all text-left ${selectedTargetId === p.id ? 'bg-gold/20 border-gold shadow-md text-white' : 'bg-black/40 border-gold/30 hover:border-gold/60 text-parchment-dim'}`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-black/60 border border-gold/40 flex items-center justify-center text-base font-bold text-gold">
                            {p.nickname.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 font-heading">
                            <div className="font-bold truncate text-sm text-parchment-bright">{p.nickname}</div>
                            <div className="text-[11px] text-parchment-dim">Guns: {p.gunCount ?? 3} | {p.status}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={!selectedTargetId}
                      onClick={() => onExecuteMapAction(selectedTargetId)}
                      className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-bright disabled:opacity-40 font-display font-black text-[#140F0A] shadow-lg transition tracking-wide cursor-pointer"
                    >
                      EXECUTE ACTION NOW
                    </button>
                  </>
                ) : (
                  /* ── MAP ACTION RESULT DISPLAY FOR CAPTAIN ── */
                  <div className="space-y-4">
                    {/* CASE A: CABIN SEARCH SECRET RESULT */}
                    {room.lastMapActionResult.actionType === 'CABIN_SEARCH' && (
                      <div className="p-5 rounded-2xl bg-black/70 border-2 border-gold shadow-[0_0_30px_rgba(201,168,76,0.3)] space-y-3 text-center animate-fadeIn">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl">🔍</span>
                          <span className="font-display font-black text-sm text-gold tracking-wider uppercase">
                            SECRET CABIN SEARCH DOSSIER
                          </span>
                        </div>

                        <p className="text-xs font-heading text-parchment-dim">
                          You searched the quarters of <span className="font-bold text-white">{room.lastMapActionResult.targetName}</span>:
                        </p>

                        {/* Revealed Role Card */}
                        {(() => {
                          const role = room.lastMapActionResult.privateResult;
                          if (role === 'SAILOR') {
                            return (
                              <div className="p-4 rounded-xl bg-blue-950/80 border-2 border-cyan-400 text-cyan-200 space-y-1.5 shadow-lg">
                                <div className="text-4xl">⚓</div>
                                <div className="font-display font-black text-base text-cyan-300 tracking-wider">
                                  LOYAL SAILOR (THỦY THỦ)
                                </div>
                                <div className="text-xs font-heading text-slate-300">
                                  This crew member is loyal to the British Crown & Sailor Faction.
                                </div>
                              </div>
                            );
                          }
                          if (role === 'PIRATE') {
                            return (
                              <div className="p-4 rounded-xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 space-y-1.5 shadow-lg">
                                <div className="text-4xl">🏴‍☠️</div>
                                <div className="font-display font-black text-base text-rose-300 tracking-wider">
                                  RUTHLESS PIRATE (HẢI TẶC)
                                </div>
                                <div className="text-xs font-heading text-slate-300">
                                  This crew member is a ruthless Pirate steering the ship to the Pirate Cove.
                                </div>
                              </div>
                            );
                          }
                          if (role === 'CULT_LEADER') {
                            return (
                              <div className="p-4 rounded-xl bg-purple-950/80 border-2 border-purple-400 text-purple-200 space-y-1.5 shadow-lg">
                                <div className="text-4xl animate-pulse">👁️</div>
                                <div className="font-display font-black text-base text-purple-300 tracking-wider">
                                  CULT LEADER (GIÁO CHỦ TÀ GIÁO)
                                </div>
                                <div className="text-xs font-heading text-slate-300">
                                  This crew member is the original High Priest of the Dark Kraken Cult!
                                </div>
                              </div>
                            );
                          }
                          if (role === 'CULTIST_TENTACLE' || role === 'CULTIST') {
                            return (
                              <div className="p-4 rounded-xl bg-purple-950/80 border-2 border-purple-500 text-purple-200 space-y-1.5 shadow-lg">
                                <div className="text-4xl animate-pulse">🐙</div>
                                <div className="font-display font-black text-base text-purple-300 tracking-wider">
                                  CULTIST TENTACLE (TÀ GIÁO ĐÃ THU NẠP)
                                </div>
                                <div className="text-xs font-heading text-slate-300">
                                  Dark tentacles have corrupted this soul! This member has been converted to the Cult.
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div className="p-3 rounded-xl bg-black/60 border border-gold/40 text-gold text-sm font-bold">
                              {role || 'Role Unknown'}
                            </div>
                          );
                        })()}

                        <div className="text-[11px] text-amber-400/90 font-heading italic">
                          🔒 Marked: This crew member is now permanently immune to future Cult conversion.
                        </div>
                      </div>
                    )}

                    {/* CASE B: OTHER MAP ACTIONS (FLOGGING, TONGUE, KRAKEN) */}
                    {room.lastMapActionResult.actionType !== 'CABIN_SEARCH' && (
                      <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/50 space-y-3 text-center">
                        <div className="text-emerald-300 font-heading font-bold text-sm">
                          {room.lastMapActionResult.publicMessage}
                        </div>
                        {room.lastMapActionResult.publicStatement && (
                          <div className="text-xs text-amber-300 font-heading">
                            📢 {room.lastMapActionResult.publicStatement}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Advance / Confirm Button */}
                    <button
                      onClick={onConfirmMapAction}
                      className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-bright font-display font-black text-[#140F0A] shadow-lg shadow-gold/20 active:scale-98 transition tracking-wider cursor-pointer"
                    >
                      CONFIRM & CONTINUE VOYAGE ➔
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-black/40 border border-gold/20 text-center space-y-3 font-heading">
                <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
                <p className="text-sm font-semibold text-parchment-bright">
                  Captain is resolving <span className="text-gold font-bold">{getActionName(room?.pendingMapAction?.type)}</span>...
                </p>
                {room?.lastMapActionResult && (
                  <div className="text-emerald-300 font-bold text-sm animate-pulse">
                    {room.lastMapActionResult.publicMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CARD ACTION TARGET SELECTION (Mermaid / Telescope - UC-014 AC-2) */}
      {/* ========================================================================= */}
      {gamePhase === 'CARD_ACTION_TARGET_SELECTION' && !isModalMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#140F0A] border-2 border-cyan-500/60 shadow-2xl space-y-4 select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{room?.pendingCardAction?.type === 'MERMAID' ? '🧜‍♀️' : '🔭'}</span>
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-black text-cyan-300 tracking-wide">
                    {room?.pendingCardAction?.type === 'MERMAID' ? "MERMAID'S SONG (MERMAID)" : 'SPYGLASS (TELESCOPE)'}
                  </h2>
                  <p className="text-[11px] font-heading text-parchment-dim">
                    {room?.pendingCardAction?.type === 'MERMAID'
                      ? 'Captain, designate 1 crew member to secretly inspect 3 discarded navigation cards.'
                      : 'Captain, designate 1 crew member to secretly inspect the top card of the draw pile.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalMinimized(true)}
                className="font-heading font-bold text-xs px-2.5 py-1 rounded bg-black/50 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition cursor-pointer"
                title="Minimize to inspect Sea Chart"
              >
                ─ MINIMIZE
              </button>
            </div>

            {isCaptain ? (
              <div className="space-y-4 font-heading">
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {eligibleCrew.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedTargetId(p.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center space-x-2 transition ${selectedTargetId === p.id ? 'bg-cyan-900/40 border-cyan-400 text-white' : 'bg-black/40 border-cyan-500/30 text-parchment-dim'}`}
                    >
                      <span className="font-bold text-sm truncate">{p.nickname}</span>
                    </button>
                  ))}
                </div>
                <button
                  disabled={!selectedTargetId}
                  onClick={() => onDesignateCardTarget(selectedTargetId)}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-display font-black text-white disabled:opacity-40 transition tracking-wide cursor-pointer"
                >
                  DESIGNATE CREW MEMBER
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-parchment-bright font-heading">
                Captain is designating a crew member to receive the sight...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MERMAID INSPECTION POPUP (AC-2 UC-014) */}
      {/* ========================================================================= */}
      {room?.myMermaidCards && room.myMermaidCards.length > 0 && !isModalMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#140F0A] border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center space-y-4 select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl animate-pulse">🧜‍♀️</span>
                <h3 className="text-lg sm:text-xl font-display font-black text-cyan-300">MERMAID'S SONG</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalMinimized(true)}
                className="font-heading font-bold text-xs px-2.5 py-1 rounded bg-black/50 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition cursor-pointer"
              >
                ─ MINIMIZE
              </button>
            </div>
            <p className="text-xs font-heading text-parchment-dim">
              You are secretly peering at 3 discarded navigation cards from the depths:
            </p>
            <div className="flex justify-center gap-3">
              {room.myMermaidCards.map((c, idx) => (
                <div key={idx} className={`w-24 h-36 rounded-2xl border p-2 flex flex-col items-center justify-center font-heading font-bold text-xs shadow-lg ${c.color === 'BLUE' ? 'bg-cyan-950 border-cyan-500 text-cyan-200' : c.color === 'RED' ? 'bg-rose-950 border-rose-500 text-rose-200' : 'bg-amber-950 border-amber-500 text-amber-200'}`}>
                  <span className="text-2xl">{c.color === 'BLUE' ? '⚓' : c.color === 'RED' ? '⚔️' : '🐙'}</span>
                  <span className="mt-1">{c.color}</span>
                </div>
              ))}
            </div>
            <button
              onClick={onAcknowledgeMermaid}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-display font-black tracking-wide transition cursor-pointer"
            >
              INSPECTION FINISHED (CLOSE)
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TELESCOPE INSPECTION POPUP (AC-3 UC-014) */}
      {/* ========================================================================= */}
      {room?.myTelescopeCard && !isModalMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#140F0A] border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center space-y-4 select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl animate-bounce">🔭</span>
                <h3 className="text-lg sm:text-xl font-display font-black text-cyan-300">SPYGLASS</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalMinimized(true)}
                className="font-heading font-bold text-xs px-2.5 py-1 rounded bg-black/50 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition cursor-pointer"
              >
                ─ MINIMIZE
              </button>
            </div>
            <p className="text-xs font-heading text-parchment-dim">You are inspecting the top card of the Navigation Draw Pile:</p>
            <div className="flex justify-center">
              <div className={`w-28 h-40 rounded-2xl border p-3 flex flex-col items-center justify-center font-heading font-bold text-sm shadow-2xl ${room.myTelescopeCard.color === 'BLUE' ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : room.myTelescopeCard.color === 'RED' ? 'bg-rose-950 border-rose-400 text-rose-200' : 'bg-amber-950 border-amber-400 text-amber-200'}`}>
                <span className="text-3xl">{room.myTelescopeCard.color === 'BLUE' ? '⚓' : room.myTelescopeCard.color === 'RED' ? '⚔️' : '🐙'}</span>
                <span className="mt-1">{room.myTelescopeCard.color}</span>
                <span className="text-[10px] text-parchment-dim mt-1">{room.myTelescopeCard.action}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onResolveTelescope('KEEP')}
                className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-display font-black text-xs tracking-wider transition shadow-lg cursor-pointer"
              >
                KEEP ON TOP
              </button>
              <button
                onClick={() => onResolveTelescope('DISCARD')}
                className="py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-display font-black text-xs tracking-wider transition shadow-lg cursor-pointer"
              >
                DISCARD TO DEEP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CULT UPRISING RITUAL CARD REVEAL (UC-015) */}
      {/* ========================================================================= */}
      {gamePhase === 'CULT_UPRISING' && !isModalMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#140F0A] border-2 border-purple-500 text-center space-y-4 shadow-[0_0_60px_rgba(168,85,247,0.4)] select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl animate-pulse">🐙</span>
                <h2 className="text-lg sm:text-xl font-display font-black text-purple-300 tracking-wide">
                  CULT RITUAL (CULT UPRISING)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalMinimized(true)}
                className="font-heading font-bold text-xs px-2.5 py-1 rounded bg-black/50 hover:bg-purple-500/20 text-purple-300 border border-purple-500/40 transition cursor-pointer"
                title="Minimize to inspect Sea Chart"
              >
                ─ MINIMIZE
              </button>
            </div>

            {!room?.revealedCultRitual ? (
              /* ── Step 1: Draw Ritual Card Prompt ── */
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-heading text-parchment-dim leading-relaxed">
                  The steered course has invoked an ancient Eldritch curse! Captain must draw a sacred ritual card from the Cult Deck.
                </p>
                {isCaptain ? (
                  <button
                    onClick={onStartCultUprising}
                    className="w-full py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-600 font-display font-black text-white shadow-xl shadow-purple-900/30 transition tracking-wider cursor-pointer"
                  >
                    DRAW CULT RITUAL CARD ➔
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-black/40 border border-purple-500/30 text-parchment-bright font-heading text-xs sm:text-sm animate-pulse">
                    ⏳ Waiting for Captain to draw the Cult Ritual card...
                  </div>
                )}
              </div>
            ) : (
              /* ── Step 2: Public Ritual Card Reveal & Night Phase Confirmation ── */
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs font-heading text-parchment-dim">
                  The dark shadows have manifested the following ritual across the entire ship:
                </p>

                {/* Ritual Tarot Plate */}
                <div className="p-5 rounded-2xl bg-purple-950/70 border-2 border-purple-400 text-purple-200 space-y-2 shadow-2xl">
                  <div className="text-4xl animate-bounce">
                    {room.revealedCultRitual.type === 'GUNS_STASH' ? '🔫' : room.revealedCultRitual.type === 'CULT_CABIN_SEARCH' ? '👁️' : '🐙'}
                  </div>
                  <div className="font-display font-black text-base sm:text-lg text-purple-300 tracking-wider">
                    {room.revealedCultRitual.name}
                  </div>
                  <div className="text-xs font-heading text-slate-300 leading-relaxed px-2">
                    {room.revealedCultRitual.description}
                  </div>
                </div>

                <p className="text-[11px] font-heading text-amber-300/90 italic">
                  ⚠️ All crew members must close their eyes during the night as the Cult Leader executes their power!
                </p>

                {isCaptain ? (
                  <button
                    onClick={onConfirmCultNight}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 font-display font-black text-white shadow-2xl shadow-purple-900/40 active:scale-98 transition tracking-wider cursor-pointer"
                  >
                    BEGIN NIGHT PHASE (CLOSE EYES) ➔
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/30 text-parchment-bright font-heading text-xs sm:text-sm animate-pulse">
                    ⏳ Waiting for Captain to initiate the Night Phase...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CULT UPRISING BLIND OVERLAY (Anti-Sniffing AC-1, AC-2, AC-3) */}
      {/* ========================================================================= */}
      {gamePhase === 'CULT_UPRISING_BLIND' && !isModalMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black select-none animate-fadeIn">
          {/* MÀN ĐÊM DÀNH CHO NGƯỜI CHƠI THƯỜNG (AC-1 Anti-Sniffing) */}
          {!isCultLeader ? (
            <div className="text-center space-y-6 max-w-lg p-8">
              <div className="text-6xl animate-pulse">🌙</div>
              <h2 className="text-3xl font-display font-black tracking-widest text-parchment-dim">
                NIGHT FALLS ACROSS THE WAVES...
              </h2>
              <p className="text-sm font-heading text-parchment-dim leading-relaxed">
                All crew members keep their eyes closed in dread.
                An occult ritual transpires deep in the abyss...
              </p>
            </div>
          ) : (
            /* BẢNG ĐIỀU KHIỂN DÀNH CHO GIÁO CHỦ (CULT LEADER) */
            <div className="w-full max-w-xl p-6 rounded-3xl bg-[#140F0A] border-2 border-purple-500 shadow-[0_0_60px_rgba(168,85,247,0.4)] space-y-5 text-center">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">👑 🐙</span>
                  <div className="text-left">
                    <h2 className="text-lg sm:text-xl font-display font-black text-purple-300">
                      CULT LEADER - ELDRITCH POWERS
                    </h2>
                    <p className="text-xs font-heading text-parchment-dim">
                      Ritual Type: <span className="font-bold uppercase text-gold">{room?.pendingCultRitual?.type}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalMinimized(true)}
                  className="font-heading font-bold text-xs px-2.5 py-1 rounded bg-black/50 hover:bg-purple-500/20 text-purple-300 border border-purple-500/40 transition cursor-pointer"
                >
                  ─ MINIMIZE
                </button>
              </div>

              {/* CASE 1: GUNS STASH (AC-2) */}
              {room?.pendingCultRitual?.type === 'GUNS_STASH' && (
                <div className="space-y-4 text-left font-heading">
                  <div className="text-xs text-parchment-bright">
                    Distribute exactly <span className="font-bold text-gold">3 guns</span> to any crew members (Allocated: {totalAllocatedGuns}/3):
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {players.filter(p => p.status !== 'ELIMINATED').map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-purple-500/30 text-xs">
                        <span className="font-bold text-parchment-bright">{p.nickname} {p.id === me?.id && '(You)'}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setGunsAllocation(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] || 0) - 1) }))}
                            className="w-7 h-7 rounded-lg bg-black/60 text-white font-bold hover:bg-gold/20 border border-gold/30 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-black text-gold">{gunsAllocation[p.id] || 0}</span>
                          <button
                            disabled={totalAllocatedGuns >= 3}
                            onClick={() => setGunsAllocation(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }))}
                            className="w-7 h-7 rounded-lg bg-purple-700 text-white font-bold hover:bg-purple-600 disabled:opacity-40 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    disabled={totalAllocatedGuns !== 3}
                    onClick={() => {
                      const allocations = Object.entries(gunsAllocation)
                        .filter(([_, count]) => count > 0)
                        .map(([playerId, count]) => ({ playerId, count }));
                      onResolveCultGuns(allocations);
                    }}
                    className="w-full py-3 rounded-2xl bg-purple-700 hover:bg-purple-600 font-display font-black text-white disabled:opacity-50 transition tracking-wide cursor-pointer"
                  >
                    CONFIRM 3 GUNS ALLOCATION ➔
                  </button>
                </div>
              )}

              {/* CASE 2: CULT CABIN SEARCH */}
              {room?.pendingCultRitual?.type === 'CULT_CABIN_SEARCH' && (
                <div className="space-y-4 font-heading">
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-left space-y-2 text-xs">
                    <div className="font-bold text-gold mb-2">True Vision of the Officers:</div>
                    <div>Captain: <span className="font-bold text-white">{room?.myCultInspection?.captain?.name}</span> ({room?.myCultInspection?.captain?.role})</div>
                    <div>Lieutenant: <span className="font-bold text-white">{room?.myCultInspection?.lieutenant?.name}</span> ({room?.myCultInspection?.lieutenant?.role})</div>
                    <div>Navigator: <span className="font-bold text-white">{room?.myCultInspection?.navigator?.name}</span> ({room?.myCultInspection?.navigator?.role})</div>
                  </div>
                  <button
                    onClick={onResolveCultCabinSearch}
                    className="w-full py-3 rounded-2xl bg-purple-700 hover:bg-purple-600 font-display font-black text-white transition tracking-wide cursor-pointer"
                  >
                    FINISH VISION (END NIGHT)
                  </button>
                </div>
              )}

              {/* CASE 3: CONVERSION (AC-3) */}
              {room?.pendingCultRitual?.type === 'CONVERSION' && (
                <div className="space-y-4 text-left font-heading">
                  {convertibleCrew.length > 0 ? (
                    <>
                      <div className="text-xs text-parchment-bright">
                        Select 1 non-immune crew member to convert into a Cultist:
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                        {convertibleCrew.map(p => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedTargetId(p.id)}
                            className={`p-3 rounded-2xl border text-left flex items-center space-x-2 transition cursor-pointer ${
                              selectedTargetId === p.id
                                ? 'bg-purple-700/40 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                                : 'bg-black/40 border-purple-500/30 text-parchment-dim hover:border-purple-400/50'
                            }`}
                          >
                            <span className="font-bold text-xs truncate">{p.nickname}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={!selectedTargetId}
                        onClick={() => onResolveCultConversion(selectedTargetId)}
                        className="w-full py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-600 font-display font-black text-white disabled:opacity-50 transition tracking-wide cursor-pointer shadow-xl shadow-purple-900/40"
                      >
                        CONVERT TO CULTIST ➔
                      </button>
                    </>
                  ) : (
                    /* Khi không còn ai thỏa mãn điều kiện thu nạp */
                    <div className="space-y-4 text-center">
                      <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-400/60 text-purple-200 text-xs sm:text-sm leading-relaxed space-y-2">
                        <div className="text-3xl animate-pulse">🔒 👁️</div>
                        <div className="font-display font-black text-gold text-sm sm:text-base uppercase tracking-wide">
                          NO ELIGIBLE CREW MEMBERS
                        </div>
                        <p className="text-slate-300 text-xs">
                          All other active crew members have either already joined the Cult or are permanently immune to conversion (due to previous Cabin Search or Flogging).
                        </p>
                        <p className="text-[11px] text-amber-300/90 italic">
                          (The rest of the crew remains blind and unaware of this outcome.)
                        </p>
                      </div>

                      <button
                        onClick={() => onResolveCultConversion(null)}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 font-display font-black text-white text-sm tracking-wider uppercase transition shadow-2xl shadow-purple-900/50 cursor-pointer active:scale-98"
                      >
                        END RITUAL & BRING DAWN ➔
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: ROUND END SUMMARY MODAL (BR-004 -> BR-005) */}
      {/* ========================================================================= */}
      {gamePhase === 'ROUND_END' && !isModalMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#140F0A] border-2 border-gold text-center space-y-4 shadow-2xl select-none">
            {/* Modal Header with Minimize Button */}
            <div className="flex items-center justify-between border-b border-gold/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl animate-bounce">🏁 ⛵</span>
                <h2 className="text-lg sm:text-xl font-display font-black text-gold tracking-wide">
                  VOYAGE WATCH COMPLETED
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalMinimized(true)}
                className="font-heading font-bold text-xs px-2.5 py-1 rounded bg-black/50 hover:bg-gold/20 text-gold border border-gold/40 transition cursor-pointer"
                title="Minimize to inspect Sea Chart"
              >
                ─ MINIMIZE
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-gold/30 text-xs text-parchment-dim space-y-2 text-left font-heading">
              <div className="flex justify-between items-center">
                <span className="text-parchment-dim">Current Waypoint:</span>
                <span className="font-bold text-gold">{currentNode?.name} ({currentNode?.id})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-parchment-dim">Course Steered:</span>
                <span className="font-bold text-white">
                  {room?.executedNavigationCard?.direction || room?.executedNavigationCard?.color}
                </span>
              </div>
              {room?.lastCardActionResult?.publicMessage && (
                <div className="pt-2 border-t border-gold/20 text-emerald-400 font-medium">
                  📢 {room.lastCardActionResult.publicMessage}
                </div>
              )}
            </div>

            {isCaptain ? (
              <button
                onClick={onAdvanceNextRound}
                className="w-full py-3.5 rounded-2xl bg-gold hover:bg-gold-bright font-display font-black text-[#140F0A] shadow-lg shadow-gold/20 active:scale-98 transition transform tracking-wider cursor-pointer"
              >
                ADVANCE TO NEXT ROUND (TRANSFER WATCH) ➔
              </button>
            ) : (
              <p className="text-xs text-parchment-dim italic font-heading">
                ⏳ Waiting for Captain to transfer the watch and start the next round...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapBoardUI;
