import React, { useState, useEffect, useMemo, useRef } from 'react';
import quickJourneyConfig from '../config/maps/quick-journey.json';
import longJourneyConfig from '../config/maps/long-journey.json';
import { SoundEngine } from '../utils/soundEffects';
import { 
  Anchor, 
  Compass, 
  Sparkles, 
  Eye, 
  Flame, 
  Skull, 
  Award, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Clock, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import PanelWood from './ui/PanelWood';
import CardParchment from './ui/CardParchment';
import ButtonWood from './ui/ButtonWood';

/**
 * MapBoardUI Component (BR-004)
 * Eldritch Parchment Goatskin Nautical Sea Chart:
 * SVG Hexagonal Map, Map Actions, Card Actions, Cult Uprising, and Round End Handlers.
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
  onResolveCultGuns,
  onResolveCultCabinSearch,
  onResolveCultConversion,
  onAdvanceNextRound
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [gunsAllocation, setGunsAllocation] = useState({});
  const lastShipPosRef = useRef(null);

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

  // Initialize guns allocation for Cult Leader
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
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  // Convert map coordinates to SVG space (1000x850)
  const getNodeSvgCoord = (node) => {
    const svgX = (node.x / 100) * 880 + 60;
    const svgY = (node.y / 100) * 720 + 60;
    return { x: svgX, y: svgY };
  };

  const nodeMap = useMemo(() => {
    const map = new Map();
    mapConfig.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [mapConfig]);

  const currentNode = nodeMap.get(shipPositionId) || nodeMap.get('START');
  const totalAllocatedGuns = Object.values(gunsAllocation).reduce((sum, val) => sum + (Number(val) || 0), 0);

  const eligibleCrew = players.filter(p => p.id !== me?.id && p.status !== 'ELIMINATED');
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
      case 'CABIN_SEARCH': return 'Search Cabin (Khám Xét Cabin)';
      case 'FLOGGING': return 'Flogging (Tra Khảo / Đánh Roi)';
      case 'OFF_WITH_THE_TONGUE': return 'Cut Tongue (Cắt Lưỡi)';
      case 'FEED_THE_KRAKEN': return 'Feed the Kraken (Tế Thần Kraken)';
      default: return 'Calm Waters (Vùng Biển Êm Đềm)';
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-fade-in-up">
      
      {/* ====================================================================
          Top Sea Chart HUD Bar
          ==================================================================== */}
      <PanelWood glow="firelight" nails={true} className="w-full max-w-6xl p-3.5 sm:p-4 mb-3 z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Current Position Tag */}
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl animate-ship-bob">⛵</span>
            <div>
              <div className="font-heading text-[10px] font-bold uppercase tracking-widest text-parchment-dim">
                Flagship Coordinates
              </div>
              <div className="font-heading text-base sm:text-lg font-bold text-gold-bright flex items-center gap-2">
                <span>{currentNode?.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-hull border border-gold-dim/40 text-gold">
                  Node: {currentNode?.id}
                </span>
              </div>
            </div>
          </div>

          {/* Chart Metadata Badges */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-heading">
            <div className="bg-abyss px-2.5 py-1 rounded border border-hull-light flex items-center gap-1.5">
              <Compass size={13} className="text-sailor-glow" />
              <span className="text-parchment-dim">{mapConfig.name}</span>
            </div>

            <div className="bg-abyss px-2.5 py-1 rounded border border-hull-light flex items-center gap-1.5">
              <Sparkles size={13} className="text-cult-glow" />
              <span className="text-parchment-dim">Rituals: {room?.mapBoard?.cultRitualDeck?.length ?? 5}</span>
            </div>

            {room?.mapType === 'LONG_JOURNEY' && (
              <div className={`px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                room?.mapBoard?.hasCrossedSupplyLine
                  ? 'bg-verdigris/20 border-verdigris text-verdigris-glow'
                  : 'bg-abyss border-hull-light text-parchment-dim'
              }`}>
                <span>📦</span>
                <span>Supply Line: {room?.mapBoard?.hasCrossedSupplyLine ? 'Crossed' : 'Not Crossed'}</span>
              </div>
            )}
          </div>

        </div>
      </PanelWood>

      {/* ====================================================================
          Main SVG Hexagonal Nautical Map Board
          ==================================================================== */}
      <div className="relative z-10 w-full max-w-6xl flex-1 flex items-center justify-center my-2">
        <div className="w-full h-full max-h-[640px] aspect-[10/8] relative rounded border border-gold-dim/40 bg-[#120F0B] shadow-2xl p-2 overflow-hidden">
          <svg viewBox="0 0 1000 850" className="w-full h-full">
            <defs>
              {/* Gradients */}
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14110C" />
                <stop offset="50%" stopColor="#0A0907" />
                <stop offset="100%" stopColor="#1C1610" />
              </linearGradient>
              <linearGradient id="pirateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5A1515" />
                <stop offset="100%" stopColor="#2A0808" />
              </linearGradient>
              <linearGradient id="sailorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#224250" />
                <stop offset="100%" stopColor="#0E1E26" />
              </linearGradient>
              <linearGradient id="cultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#431C6A" />
                <stop offset="100%" stopColor="#1F0B33" />
              </linearGradient>

              {/* Marker Arrows */}
              <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#A83B2A" opacity="0.85" />
              </marker>
              <marker id="arrow-yellow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#C9A84C" opacity="0.85" />
              </marker>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#4A7A8C" opacity="0.85" />
              </marker>

              {/* Glow Filter */}
              <filter id="parchmentGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Aged Chart Surface */}
            <rect width="1000" height="850" fill="url(#oceanGrad)" rx="6" />

            {/* Compass Rose Silhouette Background */}
            <g opacity="0.08" transform="translate(500, 425)">
              <circle r="220" fill="none" stroke="#C9A84C" strokeWidth="2" strokeDasharray="6 6" />
              <polygon points="0,-200 20,-30 0,0 -20,-30" fill="#C9A84C" />
              <polygon points="0,200 20,30 0,0 -20,30" fill="#C9A84C" />
              <polygon points="-200,0 -30,-20 0,0 -30,20" fill="#C9A84C" />
              <polygon points="200,0 30,-20 0,0 30,20" fill="#C9A84C" />
            </g>

            {/* Supply Line Boundary (Long Journey) */}
            {room?.mapType === 'LONG_JOURNEY' && (
              <g className="opacity-75">
                <path d="M 80 470 Q 500 310 920 470" fill="none" stroke="#C9A84C" strokeWidth="2" strokeDasharray="6 6" />
                <text x="500" y="340" fill="#C9A84C" fontFamily="Cinzel, serif" fontSize="12" fontWeight="bold" textAnchor="middle" letterSpacing="4">
                  ⚔️ SUPPLY LINE BOUNDARY (RANH GIỚI TIẾP TẾ) ⚔️
                </text>
              </g>
            )}

            {/* 1. Draw Edges */}
            {mapConfig.nodes.map(node => {
              const fromCoord = getNodeSvgCoord(node);
              const transitions = node.transitions || {};

              return Object.entries(transitions).map(([color, targetId]) => {
                const targetNode = nodeMap.get(targetId);
                if (!targetNode) return null;

                const toCoord = getNodeSvgCoord(targetNode);
                let strokeColor = '#3D3228';
                let markerId = '';

                if (color === 'RED') {
                  strokeColor = '#A83B2A';
                  markerId = 'url(#arrow-red)';
                } else if (color === 'YELLOW') {
                  strokeColor = '#C9A84C';
                  markerId = 'url(#arrow-yellow)';
                } else if (color === 'BLUE') {
                  strokeColor = '#4A7A8C';
                  markerId = 'url(#arrow-blue)';
                }

                const isTraversed = visitedNodes.includes(node.id) && visitedNodes.includes(targetId);

                return (
                  <line
                    key={`${node.id}-${color}-${targetId}`}
                    x1={fromCoord.x}
                    y1={fromCoord.y}
                    x2={toCoord.x}
                    y2={toCoord.y}
                    stroke={strokeColor}
                    strokeWidth={isTraversed ? 3.5 : 1.6}
                    strokeOpacity={isTraversed ? 0.95 : 0.4}
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

              let fillColor = '#1F1914';
              let strokeColor = '#3D3228';
              let strokeWidth = 1.5;

              if (node.victoryZone === 'PIRATE_VICTORY') {
                fillColor = 'url(#pirateGrad)';
                strokeColor = '#A83B2A';
                strokeWidth = 3;
              } else if (node.victoryZone === 'SAILOR_VICTORY') {
                fillColor = 'url(#sailorGrad)';
                strokeColor = '#4A7A8C';
                strokeWidth = 3;
              } else if (node.victoryZone === 'CULT_VICTORY') {
                fillColor = 'url(#cultGrad)';
                strokeColor = '#6B3BA8';
                strokeWidth = 3;
              } else if (isVisited) {
                fillColor = '#2A2118';
                strokeColor = '#C9A84C';
                strokeWidth = 2;
              }

              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-transform duration-300 hover:scale-105"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <polygon
                    points={getHexPolygonPoints(coord.x, coord.y, isVictory ? 50 : 38)}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    filter={isCurrent ? 'url(#parchmentGlow)' : 'none'}
                  />

                  <text
                    x={coord.x}
                    y={coord.y - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isVictory ? '24' : '17'}
                    className="select-none pointer-events-none"
                  >
                    {node.victoryZone === 'PIRATE_VICTORY' ? '🏴‍☠️' :
                     node.victoryZone === 'SAILOR_VICTORY' ? '⚓' :
                     node.victoryZone === 'CULT_VICTORY' ? '🦑' :
                     node.id === 'START' ? '🦀' :
                     getActionIcon(node.mapAction)}
                  </text>

                  <text
                    x={coord.x}
                    y={coord.y + 18}
                    textAnchor="middle"
                    fontFamily="Cinzel, serif"
                    fontSize={isVictory ? '11' : '9'}
                    fontWeight="bold"
                    fill={isVictory ? '#F0E6CC' : '#C4B998'}
                    className="select-none pointer-events-none uppercase tracking-wider"
                  >
                    {node.id}
                  </text>

                  {/* Flagship Marker on Current Node */}
                  {isCurrent && (
                    <g className="animate-ship-bob" filter="url(#parchmentGlow)">
                      <circle cx={coord.x} cy={coord.y - 36} r="17" fill="#C9A84C" fillOpacity="0.25" stroke="#E6C66E" strokeWidth="1.8" />
                      <text x={coord.x} y={coord.y - 34} textAnchor="middle" dominantBaseline="middle" fontSize="18">
                        ⛵
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hovered Node Tooltip */}
          {hoveredNode && (
            <div className="absolute bottom-4 left-4 p-3 rounded bg-hull-dark/95 border border-gold-dim shadow-2xl text-xs max-w-xs pointer-events-none animate-fade-in-up font-heading">
              <div className="font-bold text-gold-bright text-sm flex items-center gap-1.5">
                <span>{getActionIcon(hoveredNode.mapAction)}</span>
                {hoveredNode.name}
              </div>
              <div className="text-parchment mt-1">
                Event: <span className="font-semibold text-parchment-bright">{getActionName(hoveredNode.mapAction)}</span>
              </div>
              {hoveredNode.victoryZone && (
                <div className="text-verdigris font-bold mt-1">
                  🏆 Victory Haven: {hoveredNode.victoryZone}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EXECUTE MAP ACTION */}
      {/* ========================================================================= */}
      {gamePhase === 'EXECUTE_MAP_ACTION' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-abyss/85 backdrop-blur-sm animate-fade-in-up">
          <CardParchment stains={true} className="w-full max-w-lg p-6 space-y-5 border-gold">
            <div className="text-center space-y-1">
              <div className="text-4xl">{getActionIcon(room?.pendingMapAction?.type)}</div>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-parchment-bright uppercase">
                {getActionName(room?.pendingMapAction?.type)}
              </h2>
              <p className="text-xs text-parchment-dim font-heading">Coordinates: {currentNode?.name}</p>
            </div>

            {isCaptain ? (
              <div className="space-y-4">
                <p className="text-xs text-parchment text-center font-body">
                  Captain, choose 1 crew member to execute this action upon:
                </p>

                <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {eligibleCrew.map(p => (
                    <PanelWood
                      key={p.id}
                      onClick={() => setSelectedTargetId(p.id)}
                      glow={selectedTargetId === p.id ? 'firelight' : 'none'}
                      className={`p-2.5 cursor-pointer flex items-center gap-2.5 border ${
                        selectedTargetId === p.id ? 'border-gold' : 'border-hull-light'
                      }`}
                    >
                      <div className="w-8 h-8 rounded bg-abyss flex items-center justify-center font-heading font-bold text-sm shrink-0">
                        {p.nickname.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading font-bold text-xs text-parchment-bright truncate">{p.nickname}</div>
                        <div className="text-[10px] text-parchment-dim">Guns: {p.gunCount}</div>
                      </div>
                    </PanelWood>
                  ))}
                </div>

                {room?.lastMapActionResult ? (
                  <div className="p-3.5 rounded bg-abyss border border-verdigris/50 space-y-3 text-center">
                    <div className="text-verdigris-glow font-heading font-bold text-xs">
                      {room.lastMapActionResult.publicMessage}
                    </div>
                    <ButtonWood
                      variant="gold"
                      size="md"
                      fullWidth={true}
                      onClick={onConfirmMapAction}
                      icon={<ChevronRight size={16} />}
                    >
                      CONFIRM & RESUME VOYAGE
                    </ButtonWood>
                  </div>
                ) : (
                  <ButtonWood
                    variant="gold"
                    size="lg"
                    fullWidth={true}
                    disabled={!selectedTargetId}
                    onClick={() => onExecuteMapAction(selectedTargetId)}
                    icon={<CheckCircle2 size={18} />}
                  >
                    EXECUTE ACTION NOW
                  </ButtonWood>
                )}
              </div>
            ) : (
              <div className="p-6 rounded bg-abyss border border-hull-light text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-heading text-parchment">
                  Captain is deliberating on <strong className="text-gold-bright">{getActionName(room?.pendingMapAction?.type)}</strong>...
                </p>
                {room?.lastMapActionResult && (
                  <div className="text-verdigris-glow font-bold text-xs">
                    {room.lastMapActionResult.publicMessage}
                  </div>
                )}
              </div>
            )}
          </CardParchment>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CARD ACTION TARGET SELECTION (Mermaid / Telescope) */}
      {/* ========================================================================= */}
      {gamePhase === 'CARD_ACTION_TARGET_SELECTION' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-abyss/85 backdrop-blur-sm animate-fade-in-up">
          <CardParchment stains={true} className="w-full max-w-lg p-6 space-y-4 border-sailor">
            <div className="text-center space-y-1">
              <div className="text-4xl">{room?.pendingCardAction?.type === 'MERMAID' ? '🧜‍♀️' : '🔭'}</div>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-sailor-glow uppercase">
                {room?.pendingCardAction?.type === 'MERMAID' ? 'Mermaid Song' : 'Spyglass Inspection'}
              </h2>
              <p className="text-xs text-parchment-dim font-body">
                {room?.pendingCardAction?.type === 'MERMAID'
                  ? 'Captain, appoint 1 sailor to inspect 3 discarded navigation cards.'
                  : 'Captain, appoint 1 sailor to inspect the top card of the draw pile.'}
              </p>
            </div>

            {isCaptain ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {eligibleCrew.map(p => (
                    <PanelWood
                      key={p.id}
                      onClick={() => setSelectedTargetId(p.id)}
                      glow={selectedTargetId === p.id ? 'firelight' : 'none'}
                      className={`p-2.5 cursor-pointer flex items-center gap-2 border ${
                        selectedTargetId === p.id ? 'border-gold' : 'border-hull-light'
                      }`}
                    >
                      <span className="font-heading font-bold text-xs text-parchment-bright truncate">{p.nickname}</span>
                    </PanelWood>
                  ))}
                </div>
                <ButtonWood
                  variant="gold"
                  size="md"
                  fullWidth={true}
                  disabled={!selectedTargetId}
                  onClick={() => onDesignateCardTarget(selectedTargetId)}
                >
                  DESIGNATE THIS SAILOR
                </ButtonWood>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-parchment font-heading">
                Captain is choosing the sailor to receive this inspection...
              </div>
            )}
          </CardParchment>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MERMAID INSPECTION POPUP */}
      {/* ========================================================================= */}
      {room?.myMermaidCards && room.myMermaidCards.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-abyss/85 backdrop-blur-sm animate-fade-in-up">
          <CardParchment stains={true} className="w-full max-w-md p-6 text-center space-y-4 border-sailor">
            <div className="text-4xl animate-pulse">🧜‍♀️</div>
            <h3 className="font-heading text-lg font-black text-sailor-glow uppercase">Mermaid Song Revelation</h3>
            <p className="text-xs text-parchment-dim">
              You are inspecting 3 cards retrieved from the Discard Pile:
            </p>
            <div className="flex justify-center gap-3">
              {room.myMermaidCards.map((c, idx) => (
                <CardParchment key={idx} faction={c.color?.toLowerCase()} className="w-24 h-36 p-2 flex flex-col items-center justify-center font-heading font-bold text-xs">
                  <span className="text-2xl mb-1">{c.color === 'BLUE' ? '⚓' : c.color === 'RED' ? '⚔️' : '🐙'}</span>
                  <span>{c.color}</span>
                </CardParchment>
              ))}
            </div>
            <ButtonWood variant="primary" size="md" fullWidth={true} onClick={onAcknowledgeMermaid}>
              CLOSE REVELATION
            </ButtonWood>
          </CardParchment>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TELESCOPE INSPECTION POPUP */}
      {/* ========================================================================= */}
      {room?.myTelescopeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-abyss/85 backdrop-blur-sm animate-fade-in-up">
          <CardParchment stains={true} className="w-full max-w-md p-6 text-center space-y-4 border-gold">
            <div className="text-4xl animate-bounce">🔭</div>
            <h3 className="font-heading text-lg font-black text-gold-bright uppercase">Spyglass Vision</h3>
            <p className="text-xs text-parchment-dim">You are inspecting the top card of the Draw Pile:</p>
            <div className="flex justify-center">
              <CardParchment faction={room.myTelescopeCard.color?.toLowerCase()} className="w-28 h-40 p-3 flex flex-col items-center justify-center font-heading font-bold text-sm">
                <span className="text-3xl mb-1">{room.myTelescopeCard.color === 'BLUE' ? '⚓' : room.myTelescopeCard.color === 'RED' ? '⚔️' : '🐙'}</span>
                <span>{room.myTelescopeCard.color}</span>
                <span className="text-[10px] text-parchment-dim mt-1">{room.myTelescopeCard.action}</span>
              </CardParchment>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <ButtonWood variant="gold" size="sm" onClick={() => onResolveTelescope('KEEP')}>
                KEEP ON TOP
              </ButtonWood>
              <ButtonWood variant="danger" size="sm" onClick={() => onResolveTelescope('DISCARD')}>
                DISCARD
              </ButtonWood>
            </div>
          </CardParchment>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CULT UPRISING INITIATION BUTTON */}
      {/* ========================================================================= */}
      {gamePhase === 'CULT_UPRISING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-abyss/85 backdrop-blur-sm animate-fade-in-up">
          <CardParchment stains={true} className="w-full max-w-md p-6 text-center space-y-4 border-cult">
            <div className="text-5xl animate-eldritch-pulse">🐙</div>
            <h2 className="font-heading text-2xl font-black text-cult-glow uppercase">
              Cult of the Kraken Uprising
            </h2>
            <p className="text-xs text-parchment-dim leading-relaxed">
              The executed sea route has stirred the slumbering deity in the deep!
            </p>
            {isCaptain ? (
              <ButtonWood
                variant="cult"
                size="lg"
                fullWidth={true}
                onClick={onStartCultUprising}
                icon={<ChevronRight size={18} />}
              >
                UNSEAL CULT RITUAL ➔
              </ButtonWood>
            ) : (
              <div className="text-parchment-dim text-xs font-heading animate-pulse">
                Awaiting Captain to unveil the Cult Ritual...
              </div>
            )}
          </CardParchment>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CULT UPRISING BLIND OVERLAY */}
      {/* ========================================================================= */}
      {gamePhase === 'CULT_UPRISING_BLIND' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-abyss select-none animate-fade-in-up">
          {!isCultLeader ? (
            <div className="text-center space-y-5 max-w-lg p-8">
              <div className="text-6xl animate-pulse">🌙 🐙</div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-widest text-parchment-dim uppercase">
                Total Darkness Falls...
              </h2>
              <p className="text-xs text-parchment-dim leading-relaxed">
                All crew members must close their eyes in dread. The Cult Ritual is unfolding silently in the abyss...
              </p>
            </div>
          ) : (
            <CardParchment stains={true} className="w-full max-w-xl p-6 border-cult space-y-5 text-center">
              <div className="space-y-1">
                <div className="text-4xl">👑 🐙</div>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-cult-glow uppercase">
                  Cult Leader Power Chamber
                </h2>
                <p className="text-xs text-parchment-dim font-heading">
                  Ritual Type: <span className="font-bold text-gold">{room?.pendingCultRitual?.type}</span>
                </p>
              </div>

              {/* GUNS STASH */}
              {room?.pendingCultRitual?.type === 'GUNS_STASH' && (
                <div className="space-y-4 text-left">
                  <div className="text-xs text-parchment font-heading">
                    Distribute exactly <span className="font-bold text-gold">3 Flintlocks</span> to any sailor (Allocated: {totalAllocatedGuns}/3):
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {players.filter(p => p.status !== 'ELIMINATED').map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded bg-abyss border border-hull-light text-xs font-heading">
                        <span className="font-bold text-parchment-bright">{p.nickname} {p.id === me?.id && '(You)'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setGunsAllocation(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] || 0) - 1) }))}
                            className="w-7 h-7 rounded bg-hull text-parchment font-bold hover:bg-hull-light cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-gold">{gunsAllocation[p.id] || 0}</span>
                          <button
                            type="button"
                            disabled={totalAllocatedGuns >= 3}
                            onClick={() => setGunsAllocation(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }))}
                            className="w-7 h-7 rounded bg-cult text-white font-bold hover:bg-cult/80 disabled:opacity-40 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ButtonWood
                    variant="cult"
                    size="lg"
                    fullWidth={true}
                    disabled={totalAllocatedGuns !== 3}
                    onClick={() => {
                      const allocations = Object.entries(gunsAllocation)
                        .filter(([_, count]) => count > 0)
                        .map(([playerId, count]) => ({ playerId, count }));
                      onResolveCultGuns(allocations);
                    }}
                  >
                    CONFIRM ARMS DISTRIBUTION ➔
                  </ButtonWood>
                </div>
              )}

              {/* CULT CABIN SEARCH */}
              {room?.pendingCultRitual?.type === 'CULT_CABIN_SEARCH' && (
                <div className="space-y-4">
                  <div className="p-4 rounded bg-abyss border border-cult/50 text-left space-y-2 text-xs font-heading">
                    <div className="font-bold text-gold mb-2 uppercase">True Vision of Command Officers:</div>
                    <div>Captain: <span className="font-bold text-parchment-bright">{room?.myCultInspection?.captain?.name}</span> ({room?.myCultInspection?.captain?.role})</div>
                    <div>Lieutenant: <span className="font-bold text-parchment-bright">{room?.myCultInspection?.lieutenant?.name}</span> ({room?.myCultInspection?.lieutenant?.role})</div>
                    <div>Navigator: <span className="font-bold text-parchment-bright">{room?.myCultInspection?.navigator?.name}</span> ({room?.myCultInspection?.navigator?.role})</div>
                  </div>
                  <ButtonWood variant="cult" size="lg" fullWidth={true} onClick={onResolveCultCabinSearch}>
                    CONCLUDE VISION (END NIGHT)
                  </ButtonWood>
                </div>
              )}

              {/* CONVERSION */}
              {room?.pendingCultRitual?.type === 'CONVERSION' && (
                <div className="space-y-4 text-left">
                  <div className="text-xs text-parchment font-heading">
                    Select 1 eligible sailor to induct into the Cult of the Kraken:
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {convertibleCrew.map(p => (
                      <PanelWood
                        key={p.id}
                        onClick={() => setSelectedTargetId(p.id)}
                        glow={selectedTargetId === p.id ? 'verdigris' : 'none'}
                        className={`p-2.5 cursor-pointer flex items-center gap-2 border ${
                          selectedTargetId === p.id ? 'border-cult' : 'border-hull-light'
                        }`}
                      >
                        <span className="font-heading font-bold text-xs text-parchment-bright truncate">{p.nickname}</span>
                      </PanelWood>
                    ))}
                  </div>
                  <ButtonWood
                    variant="cult"
                    size="lg"
                    fullWidth={true}
                    disabled={!selectedTargetId}
                    onClick={() => onResolveCultConversion(selectedTargetId)}
                  >
                    INDUCT AS CULTIST ➔
                  </ButtonWood>
                </div>
              )}
            </CardParchment>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: ROUND END SUMMARY MODAL */}
      {/* ========================================================================= */}
      {gamePhase === 'ROUND_END' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-abyss/85 backdrop-blur-sm animate-fade-in-up">
          <CardParchment stains={true} className="w-full max-w-md p-6 text-center space-y-4 border-gold">
            <div className="text-4xl animate-ship-bob">🏁 ⛵</div>
            <h2 className="font-heading text-2xl font-black text-parchment-bright uppercase">
              Voyage Shift Completed
            </h2>
            <div className="p-3.5 rounded bg-abyss border border-hull-light text-xs text-parchment space-y-2 text-left font-heading">
              <div className="flex justify-between items-center">
                <span className="text-parchment-dim">New Position:</span>
                <span className="font-bold text-gold">{currentNode?.name} ({currentNode?.id})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-parchment-dim">Executed Card:</span>
                <span className="font-bold text-parchment-bright">
                  {room?.executedNavigationCard?.direction || room?.executedNavigationCard?.color}
                </span>
              </div>
              {room?.lastCardActionResult?.publicMessage && (
                <div className="pt-2 border-t border-hull-light text-verdigris font-semibold">
                  📢 {room.lastCardActionResult.publicMessage}
                </div>
              )}
            </div>

            {isCaptain ? (
              <ButtonWood
                variant="gold"
                size="lg"
                fullWidth={true}
                onClick={onAdvanceNextRound}
                icon={<ChevronRight size={18} />}
              >
                BEGIN NEXT SHIFT ➔
              </ButtonWood>
            ) : (
              <p className="text-xs text-parchment-dim font-heading italic">
                ⏳ Awaiting Captain to rotate duty shifts and begin next round...
              </p>
            )}
          </CardParchment>
        </div>
      )}

    </div>
  );
};

export default MapBoardUI;
